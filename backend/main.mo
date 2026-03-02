import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

// Specify the data migration function in with-clause.
(with migration = Migration.run)
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

  public type DeliveryInfo = {
    fullName : Text;
    address : Text;
    phoneNumber : Text;
  };

  public type Order = {
    id : Nat;
    customerId : Principal;
    guestDeliveryInfo : ?DeliveryInfo;
    items : [OrderItem];
    deliveryInfo : DeliveryInfo;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : ?Text;
    paymentStatus : Text;
    fulfillmentStatus : Text;
    createdAt : Int;
  };

  public type ExistingOrderInput = {
    items : [OrderItem];
    deliveryInfo : DeliveryInfo;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : Text;
  };

  public type OrderInput = {
    items : [OrderItem];
    deliveryInfo : DeliveryInfo;
    guestDeliveryInfo : DeliveryInfo;
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

  func isAnonymous(p : Principal) : Bool {
    p.toText() == "2vxsx-fae";
  };

  func isPubliclyVisible(p : Product) : Bool {
    p.status != #notVisible;
  };

  public shared ({ caller }) func setAdmin(principal : Principal) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot set admin");
    };
    switch (adminPrincipal) {
      case (null) {
        adminPrincipal := ?principal;
      };
      case (?_existing) {
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

  func isAdminOrAuthorized(caller : Principal) : Bool {
    if (isAnonymous(caller)) { return false };
    switch (adminPrincipal) {
      case (?admin) { caller == admin or AccessControl.hasPermission(accessControlState, caller, #admin) };
      case (null) { AccessControl.hasPermission(accessControlState, caller, #admin) };
    };
  };

  func isAuthenticated(caller : Principal) : Bool {
    not isAnonymous(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authorized: Anonymous callers cannot save a profile");
    };
    switch (userRegistrationTimes.get(caller)) {
      case (null) { userRegistrationTimes.add(caller, Time.now()) };
      case (?_) {};
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin or the owner can access profile");
    };
    userProfiles.get(user);
  };

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

  public query func getProducts(statusFilter : [ProductStatus]) : async [Product] {
    if (statusFilter.size() == 0) {
      return products.values().toArray().filter(isPubliclyVisible);
    };

    products.values().toArray().filter(
      func(p) {
        if (not isPubliclyVisible(p)) { return false };
        statusFilter.find(
          func(status) { status == p.status }
        ) != null;
      }
    );
  };

  public query func getProductById(id : Nat) : async ?Product {
    switch (products.get(id)) {
      case (?product) {
        if (isPubliclyVisible(product)) { ?product } else { null };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view all products");
    };
    products.values().toArray();
  };

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

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can delete products");
    };

    switch (products.get(id)) {
      case (?_product) { products.remove(id) };
      case (null) { Runtime.trap("Product not found") };
    };
  };

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

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(p) { p.isFeatured and isPubliclyVisible(p) }
    );
  };

  public query func isProductInStock(productId : Nat) : async Bool {
    switch (products.get(productId)) {
      case (?product) { isPubliclyVisible(product) and product.stockQuantity > 0 };
      case (null) { false };
    };
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { p.category == category and isPubliclyVisible(p) }
    );
  };

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

  public shared ({ caller }) func createOrder(orderInput : OrderInput) : async Order {
    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      customerId = caller;
      guestDeliveryInfo = ?orderInput.guestDeliveryInfo;
      items = orderInput.items;
      deliveryInfo = orderInput.deliveryInfo;
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
          guestDeliveryInfo = order.guestDeliveryInfo;
          items = order.items;
          deliveryInfo = order.deliveryInfo;
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

  public query ({ caller }) func getOrders() : async [Order] {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view all orders");
    };
    orders.values().toArray();
  };

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

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.customerId == caller });
  };

  public shared ({ caller }) func updateFulfillmentStatus(orderId : Nat, status : Text) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update fulfillment status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerId = order.customerId;
          guestDeliveryInfo = order.guestDeliveryInfo;
          items = order.items;
          deliveryInfo = order.deliveryInfo;
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

  public query func getRazorpayKeyId() : async Text {
    siteSettings.razorpayKeyId;
  };

  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can view site settings");
    };
    siteSettings;
  };

  public shared ({ caller }) func setSiteSettings(newSettings : SiteSettings) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can update site settings");
    };
    siteSettings := newSettings;
  };

  public query func getWhatsappNumber() : async Text {
    siteSettings.whatsappNumber;
  };

  public shared ({ caller }) func setWhatsappNumber(number : Text) : async () {
    if (not isAdminOrAuthorized(caller)) {
      Runtime.trap("Not authorized: Only admin can set WhatsApp number");
    };
    let newSettings : SiteSettings = {
      siteSettings with whatsappNumber = number;
    };
    siteSettings := newSettings;
    whatsappButtonSettings := {
      whatsappButtonSettings with number = number;
    };
  };

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

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Not authenticated: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

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
