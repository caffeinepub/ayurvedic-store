import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  public type Specification = {
    key : Text;
    value : Text;
  };

  public type ProductStatus = { #active; #outOfStock; #launchingSoon };

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

  public type Order = {
    id : Nat;
    customerId : Principal;
    items : [OrderItem];
    shippingDetails : ShippingDetails;
    totalAmount : Nat;
    razorpayOrderId : Text;
    razorpayPaymentId : ?Text;
    paymentStatus : Text;
    fulfillmentStatus : Text;
    createdAt : Int;
  };

  public type OrderInput = {
    items : [OrderItem];
    shippingDetails : ShippingDetails;
    totalAmount : Nat;
    razorpayOrderId : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type SiteSettings = {
    razorpayKeyId : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextProductId = 0;
  var nextOrderId = 0;

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var siteSettings : SiteSettings = {
    razorpayKeyId = "";
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // ── User profile functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Not authenticated: Only authenticated users can access their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Not authenticated: Only authenticated users can edit their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Not authorized: Only admin or the owner can access profile");
    };
    userProfiles.get(user);
  };

  // ── Product functions ───────────────────────────────────────────────────────

  /// Admin-only: create a new product.
  public shared ({ caller }) func createProduct(productInput : ProductInput) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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

  /// Public: browse all products (storefront).
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  /// Public: get a single product by id (storefront).
  public query func getProductById(id : Nat) : async ?Product {
    products.get(id);
  };

  /// Admin-only: get all products including hidden/draft ones.
  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can view all products");
    };
    products.values().toArray();
  };

  /// Admin-only: update an existing product.
  public shared ({ caller }) func updateProduct(id : Nat, productInput : ProductInput) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can delete products");
    };

    switch (products.get(id)) {
      case (?_product) { products.remove(id) };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  /// Admin-only: update stock quantity for a product.
  public shared ({ caller }) func updateStock(id : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isFeatured });
  };

  /// Public: check whether a product is in stock.
  public query func isProductInStock(productId : Nat) : async Bool {
    switch (products.get(productId)) {
      case (?product) { product.stockQuantity > 0 };
      case (null) { false };
    };
  };

  /// Public: filter products by category.
  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  /// Public: full-text search over product name and description.
  public query func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.name.toLower().contains(#text (searchTerm.toLower())) or p.description.toLower().contains(#text (searchTerm.toLower()))
      }
    );
  };

  /// Public: paginated product listing.
  public query func getPaginatedProducts(page : Nat, pageSize : Nat) : async [Product] {
    let allProducts = products.values().toArray();
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

  /// Authenticated users only: place a new order.
  public shared ({ caller }) func createOrder(orderInput : OrderInput) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Not authenticated: Only authenticated users can place orders");
    };

    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      customerId = caller;
      items = orderInput.items;
      shippingDetails = orderInput.shippingDetails;
      totalAmount = orderInput.totalAmount;
      razorpayOrderId = orderInput.razorpayOrderId;
      razorpayPaymentId = null;
      paymentStatus = "pending";
      fulfillmentStatus = "Pending";
      createdAt = Time.now();
    };
    orders.add(orderId, order);
    nextOrderId += 1;
    order;
  };

  /// Order owner or admin: confirm payment for an order.
  public shared ({ caller }) func confirmPayment(orderId : Nat, razorpayPaymentId : Text) : async () {
    switch (orders.get(orderId)) {
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Not authorized: Only order owner or admin can confirm payment");
        };
        let updatedOrder = {
          id = order.id;
          customerId = order.customerId;
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can view all orders");
    };
    orders.values().toArray();
  };

  /// Order owner or admin: get a single order by id.
  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Not authorized: Only order owner or admin can view order");
        };
        ?order;
      };
      case (null) { null };
    };
  };

  /// Authenticated users only: list the caller's own orders.
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Not authenticated: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.customerId == caller });
  };

  /// Admin-only: update the fulfillment status of an order.
  public shared ({ caller }) func updateFulfillmentStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can update fulfillment status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerId = order.customerId;
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can view site settings");
    };
    siteSettings;
  };

  /// Admin-only: persist updated site settings.
  public shared ({ caller }) func setSiteSettings(newSettings : SiteSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Not authorized: Only admin can update site settings");
    };
    siteSettings := newSettings;
  };

  // ---- Stripe integration methods --------------------------------------------

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
