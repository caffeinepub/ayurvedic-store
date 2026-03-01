import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  var adminPrincipal : ?Principal = null;

  public type Specification = {
    key : Text;
    value : Text;
  };

  public type ProductStatus = {
    #visible;
    #outOfStock;
    #launchingSoon;
    #featured;
    #notVisible;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    priceInr : Nat;
    imageUrl : Text;
    category : Text;
    stockQuantity : Nat;
    isFeatured : Bool;
    status : ProductStatus;
    specifications : [Specification];
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceInr : Nat;
    imageUrl : Text;
    category : Text;
    stockQuantity : Nat;
    isFeatured : Bool;
    status : ProductStatus;
    specifications : [Specification];
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    unitPrice : Nat;
  };

  public type ShippingDetails = {
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    state : Text;
    pincode : Text;
  };

  public type GuestDetails = {
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    state : Text;
    pincode : Text;
    orderNotes : ?Text;
  };

  public type Order = {
    id : Nat;
    customerId : Principal;
    guestDetails : ?GuestDetails;
    items : [OrderItem];
    shippingDetails : ShippingDetails;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : ?Text;
    paymentStatus : Text;
    fulfillmentStatus : Text;
    createdAt : Int;
  };

  public type ExistingOrderInput = {
    items : [OrderItem];
    shippingDetails : ShippingDetails;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : Text;
  };

  public type OrderInput = {
    items : [OrderItem];
    shippingDetails : ShippingDetails;
    guestDetails : GuestDetails;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type UserSummary = {
    principal : Principal;
    profile : ?UserProfile;
    registeredAt : Int;
    orderCount : Nat;
  };

  public type SiteSettings = {
    razorpayKeyId : Text;
    storeName : Text;
    contactEmail : Text;
    announcementBanner : Text;
    whatsappNumber : Text;
  };

  // WhatsApp Button Settings
  public type WhatsAppButtonSettings = {
    number : Text;
    enabled : Bool;
    animation : Text;
    tooltip : Text;
    ringEffect : Bool;
    pulseRingColor : Text;
    buttonColor : Text;
    icon : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextProductId = 0;
  var nextOrderId = 0;

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userRegistrationTimes = Map.empty<Principal, Int>();

  var siteSettings : SiteSettings = {
    razorpayKeyId = "";
    storeName = "";
    contactEmail = "";
    announcementBanner = "";
    whatsappNumber = "";
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  var whatsappButtonSettings : WhatsAppButtonSettings = {
    number = "";
    enabled = true;
    animation = "slide-in";
    tooltip = "";
    ringEffect = true;
    pulseRingColor = "#25D366";
    buttonColor = "#25D366";
    icon = "whatsapp";
  };

  // ── Helper: check if a principal is anonymous ────────────────────────────────

  func isAnonymous(p : Principal) : Bool {
    p.toText() == "2vxsx-fae";
  };

  // ── Helper: check if a product is visible to the public ─────────────────────

  func isPubliclyVisible(p : Product) : Bool {
    p.status != #notVisible;
  };

  // ── Admin functions ─────────────────────────────────────────────────────────

  /// Bootstrap or admin-only: set the admin principal.
  /// When no admin has been set yet, any authenticated caller may claim admin.
  /// Once an admin is set, only the current admin can change it.
  public shared ({ caller }) func setAdmin(principal : Principal) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot set admin");
    };
    switch (adminPrincipal) {
      case (null) {
        // Bootstrap: first authenticated caller claims admin
        adminPrincipal := ?principal;
      };
      case (?_existing) {
        // Already bootstrapped: only current admin may reassign
        if (not isAdminOrAuthorized(caller)) {
          Runtime.trap("Not authorized: Only admin can assign admin role");
        };
        adminPrincipal := ?principal;
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    if (isAnonymous(caller)) { return false };
    switch (adminPrincipal) {
      case (?admin) { caller == admin };
      case (null) { false };
    };
  };

  // Check if the caller is the designated admin or has the correct role via AccessControl.
  // Anonymous callers are always rejected.
  func isAdminOrAuthorized(caller : Principal) : Bool {
    if (isAnonymous(caller)) { return false };
    switch (adminPrincipal) {
      case (?admin) { caller == admin or AccessControl.hasPermission(accessControlState, caller, #admin) };
      case (null) { AccessControl.hasPermission(accessControlState, caller, #admin) };
    };
  };

  // Check if the caller is authenticated (non-anonymous).
  func isAuthenticated(caller : Principal) : Bool {
    not isAnonymous(caller);
  };

  // ── User profile functions ──────────────────────────────────────────────────

  /// Authenticated users only: get the caller's own profile.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot access profiles");
    };
    userProfiles.get(caller);
  };

  /// Authenticated users only: save the caller's own profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot save a profile");
    };
    // Record registration time on first save
    switch (userRegistrationTimes.get(caller)) {
      case (null) { userRegistrationTimes.add(caller, Time.now()) };
      case (?_) {};
    };
    userProfiles.add(caller, profile);
  };

  /// Owner or admin: get a specific user's profile.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin or the owner can access profile");
    };
    userProfiles.get(user);
  };

  /// Admin-only: list all registered users with profile and order summary.
  public query ({ caller }) func getAllUsers() : async [UserSummary] {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view all users");
    };
    let allOrders = orders.values().toArray();
    userRegistrationTimes.entries().toArray().map(
      func((principal, registeredAt)) : UserSummary {
        let profile = userProfiles.get(principal);
        let orderCount = allOrders.filter(func(o : Order) : Bool { o.customerId == principal }).size();
        {
          principal = principal;
          profile = profile;
          registeredAt = registeredAt;
          orderCount = orderCount;
        };
      }
    );
  };

  // ── Product functions ───────────────────────────────────────────────────────

  /// Admin-only: create a new product.
  public shared ({ caller }) func createProduct(productInput : ProductInput) : async Product {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can create product");
    };

    let productId = nextProductId;
    let product : Product = {
      id = productId;
      name = productInput.name;
      description = productInput.description;
      priceInr = productInput.priceInr;
      imageUrl = productInput.imageUrl;
      category = productInput.category;
      stockQuantity = productInput.stockQuantity;
      isFeatured = productInput.isFeatured;
      status = productInput.status;
      specifications = productInput.specifications;
    };
    products.add(productId, product);
    nextProductId += 1;
    product;
  };

  /// Public: browse products (storefront).
  /// When statusFilter is empty, defaults to all statuses except #notVisible.
  /// When statusFilter is provided, only returns products matching those statuses,
  /// but always excludes #notVisible to prevent leaking hidden products publicly.
  public query func getProducts(statusFilter : [ProductStatus]) : async [Product] {
    if (statusFilter.size() == 0) {
      return products.values().toArray().filter(isPubliclyVisible);
    };

    // Even when a caller provides explicit statuses, #notVisible is always excluded
    // from public-facing queries to prevent information leakage.
    products.values().toArray().filter(
      func(p) {
        if (not isPubliclyVisible(p)) { return false };
        statusFilter.find(
          func(status) { status == p.status }
        ) != null;
      }
    );
  };

  /// Public: get a single product by id (storefront).
  /// Returns null for #notVisible products to prevent information leakage.
  public query func getProductById(id : Nat) : async ?Product {
    switch (products.get(id)) {
      case (?product) {
        if (isPubliclyVisible(product)) { ?product } else { null };
      };
      case (null) { null };
    };
  };

  /// Admin-only: get all products including hidden/draft ones.
  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view all products");
    };
    products.values().toArray();
  };

  /// Admin-only: update an existing product.
  public shared ({ caller }) func updateProduct(id : Nat, productInput : ProductInput) : async Product {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update product");
    };

    switch (products.get(id)) {
      case (?existingProduct) {
        let updatedProduct = {
          id = existingProduct.id;
          name = productInput.name;
          description = productInput.description;
          priceInr = productInput.priceInr;
          imageUrl = productInput.imageUrl;
          category = productInput.category;
          stockQuantity = productInput.stockQuantity;
          isFeatured = productInput.isFeatured;
          status = productInput.status;
          specifications = productInput.specifications;
        };
        products.add(id, updatedProduct);
        updatedProduct;
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  /// Admin-only: delete a product.
  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can delete products");
    };

    switch (products.get(id)) {
      case (?_product) { products.remove(id) };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  /// Admin-only: update stock quantity for a product.
  public shared ({ caller }) func updateStock(id : Nat, quantity : Nat) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update stock");
    };

    switch (products.get(id)) {
      case (?product) {
        let updatedProduct = {
          id = product.id;
          name = product.name;
          description = product.description;
          priceInr = product.priceInr;
          imageUrl = product.imageUrl;
          category = product.category;
          stockQuantity = quantity;
          isFeatured = product.isFeatured;
          status = product.status;
          specifications = product.specifications;
        };
        products.add(id, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  /// Public: get featured products for the storefront.
  /// Excludes #notVisible products.
  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(p) { p.isFeatured and isPubliclyVisible(p) }
    );
  };

  /// Public: check whether a product is in stock.
  /// Returns false for #notVisible products.
  public query func isProductInStock(productId : Nat) : async Bool {
    switch (products.get(productId)) {
      case (?product) { isPubliclyVisible(product) and product.stockQuantity > 0 };
      case (null) { false };
    };
  };

  /// Public: filter products by category.
  /// Excludes #notVisible products.
  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { p.category == category and isPubliclyVisible(p) }
    );
  };

  /// Public: full-text search over product name and description.
  /// Excludes #notVisible products.
  public query func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        isPubliclyVisible(p) and (
          p.name.toLower().contains(#text (searchTerm.toLower())) or
          p.description.toLower().contains(#text (searchTerm.toLower()))
        )
      }
    );
  };

  /// Public: paginated product listing.
  /// Excludes #notVisible products.
  public query func getPaginatedProducts(page : Nat, pageSize : Nat) : async [Product] {
    let allProducts = products.values().toArray().filter(isPubliclyVisible);
    let startIndex = page * pageSize;
    if (startIndex >= allProducts.size()) { return [] };
    let endIndex = if ((page + 1) * pageSize > allProducts.size()) {
      allProducts.size();
    } else {
      (page + 1) * pageSize;
    };
    let actualEnd = if (endIndex > allProducts.size()) { allProducts.size() } else {
      endIndex;
    };
    if (actualEnd <= startIndex) { return [] };
    allProducts.sliceToArray(startIndex, actualEnd);
  };

  // ── Order functions ─────────────────────────────────────────────────────────

  /// Authenticated users or guests: place a new order.
  public shared ({ caller }) func createOrder(orderInput : OrderInput) : async Order {
    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      customerId = caller;
      guestDetails = ?orderInput.guestDetails;
      items = orderInput.items;
      shippingDetails = orderInput.shippingDetails;
      totalAmount = orderInput.totalAmount;
      razorpayOrderId = orderInput.razorpayOrderId;
      razorpayPaymentId = ?orderInput.razorpayPaymentId;
      paymentStatus = "paid";
      fulfillmentStatus = "Pending";
      createdAt = Time.now();
    };

    orders.add(orderId, order);
    nextOrderId += 1;
    order;
  };

  /// Order owner or admin: confirm payment for an order.
  public shared ({ caller }) func confirmPayment(orderId : Nat, razorpayPaymentId : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can confirm payment");
    };
    switch (orders.get(orderId)) {
      case (?order) {
        if (caller != order.customerId and not isAdminOrAuthorized(caller)) {
          Runtime.trap("Not authorized: Only order owner or admin can confirm payment");
        };
        let updatedOrder = {
          id = order.id;
          customerId = order.customerId;
          guestDetails = order.guestDetails;
          items = order.items;
          shippingDetails = order.shippingDetails;
          totalAmount = order.totalAmount;
          razorpayOrderId = order.razorpayOrderId;
          razorpayPaymentId = ?razorpayPaymentId;
          paymentStatus = "paid";
          fulfillmentStatus = order.fulfillmentStatus;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  /// Admin-only: list all orders.
  public query ({ caller }) func getOrders() : async [Order] {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view all orders");
    };
    orders.values().toArray();
  };

  /// Order owner or admin: get a single order by id.
  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can view orders");
    };
    switch (orders.get(orderId)) {
      case (?order) {
        if (caller != order.customerId and not isAdminOrAuthorized(caller)) {
          Runtime.trap("Not authorized: Only order owner or admin can view order");
        };
        ?order;
      };
      case (null) { null };
    };
  };

  /// Authenticated users only: list the caller's own orders.
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.customerId == caller });
  };

  /// Admin-only: update the fulfillment status of an order.
  public shared ({ caller }) func updateFulfillmentStatus(orderId : Nat, status : Text) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update fulfillment status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerId = order.customerId;
          guestDetails = order.guestDetails;
          items = order.items;
          shippingDetails = order.shippingDetails;
          totalAmount = order.totalAmount;
          razorpayOrderId = order.razorpayOrderId;
          razorpayPaymentId = order.razorpayPaymentId;
          paymentStatus = order.paymentStatus;
          fulfillmentStatus = status;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  // ── Site settings ───────────────────────────────────────────────────────────

  /// Public: returns only the Razorpay public key needed by the checkout page.
  /// The Razorpay Key ID is a client-side public key and must be readable by
  /// any visitor so that the checkout flow works without authentication.
  public query func getRazorpayKeyId() : async Text {
    siteSettings.razorpayKeyId;
  };

  /// Admin-only: read the full site settings (includes sensitive config).
  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view site settings");
    };
    siteSettings;
  };

  /// Admin-only: persist updated site settings.
  public shared ({ caller }) func setSiteSettings(newSettings : SiteSettings) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update site settings");
    };
    siteSettings := newSettings;
  };

  // WhatsApp Number Management (public query and admin-only setter)
  public query func getWhatsappNumber() : async Text {
    siteSettings.whatsappNumber;
  };

  public shared ({ caller }) func setWhatsappNumber(number : Text) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can set WhatsApp number");
    };
    // Create new settings record
    let newSettings : SiteSettings = {
      siteSettings with whatsappNumber = number;
    };
    siteSettings := newSettings;
    // Update WhatsApp button settings with the new number.
    whatsappButtonSettings := {
      whatsappButtonSettings with number = number;
    };
  };

  // ---- Stripe integration methods --------------------------------------------

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  /// Authenticated users only: create a Stripe checkout session.
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // WhatsApp Button Settings Queries and Updates
  public query func getWhatsappButtonSettings() : async WhatsAppButtonSettings {
    whatsappButtonSettings;
  };

  public shared ({ caller }) func updateWhatsappButtonSettings(settings : WhatsAppButtonSettings) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update WhatsApp button settings");
    };
    whatsappButtonSettings := settings;
  };
};
