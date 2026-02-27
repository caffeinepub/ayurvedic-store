import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceInr : Nat;
    imageUrl : Text;
    category : Text;
    stockQuantity : Nat;
    isFeatured : Bool;
    status : {
      #active;
      #outOfStock;
      #launchingSoon;
    };
    specifications : [Specification];
  };

  type Specification = {
    key : Text;
    value : Text;
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

  type Order = {
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

  // New WhatsApp Button Settings Type
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

  // Old actor type without WhatsApp button settings.
  type OldActor = {
    adminPrincipal : ?Principal;
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
    siteSettings : SiteSettings;
    stripeConfig : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
  };

  // New actor type with WhatsApp button settings.
  type NewActor = {
    adminPrincipal : ?Principal;
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
    siteSettings : SiteSettings;
    stripeConfig : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
    whatsappButtonSettings : WhatsAppButtonSettings;
  };

  // Migration function called by the main actor via the with-clause.
  public func run(old : OldActor) : NewActor {
    let defaultWhatsAppButtonSettings : WhatsAppButtonSettings = {
      number = old.siteSettings.whatsappNumber;
      enabled = true;
      animation = "slide-in";
      tooltip = "";
      ringEffect = true;
      pulseRingColor = "#25D366";
      buttonColor = "#25D366";
      icon = "whatsapp";
    };

    { old with whatsappButtonSettings = defaultWhatsAppButtonSettings };
  };
};
