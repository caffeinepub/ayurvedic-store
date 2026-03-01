import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type Specification = {
    key : Text;
    value : Text;
  };

  type ProductStatus = {
    #visible;
    #outOfStock;
    #launchingSoon;
    #featured;
    #notVisible;
  };

  type Product = {
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

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    unitPrice : Nat;
  };

  type ShippingDetails = {
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    state : Text;
    pincode : Text;
  };

  // Guest details used for new records
  type GuestDetails = {
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

  // Mapping old Order type to new one
  type OldOrder = {
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

  type NewOrder = {
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

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type SiteSettings = {
    razorpayKeyId : Text;
    storeName : Text;
    contactEmail : Text;
    announcementBanner : Text;
    whatsappNumber : Text;
  };

  type WhatsAppButtonSettings = {
    number : Text;
    enabled : Bool;
    animation : Text;
    tooltip : Text;
    ringEffect : Bool;
    pulseRingColor : Text;
    buttonColor : Text;
    icon : Text;
  };

  type OldActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, OldOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
    siteSettings : SiteSettings;
    stripeConfig : ?Stripe.StripeConfiguration;
    whatsappButtonSettings : WhatsAppButtonSettings;
    adminPrincipal : ?Principal;
  };

  type NewActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, NewOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
    siteSettings : SiteSettings;
    stripeConfig : ?Stripe.StripeConfiguration;
    whatsappButtonSettings : WhatsAppButtonSettings;
    adminPrincipal : ?Principal;
  };

  /// Convert old-style orders to the new format.
  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          guestDetails = null
        };
      }
    );
    { old with orders = newOrders };
  };
};
