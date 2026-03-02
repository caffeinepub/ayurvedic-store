import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  public type OldOrder = {
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
    guestDetails : ?GuestDetails;
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

  public type DeliveryInfo = {
    fullName : Text;
    address : Text;
    phoneNumber : Text;
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

  public type Specification = {
    key : Text;
    value : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type ProductStatus = {
    #visible;
    #outOfStock;
    #launchingSoon;
    #featured;
    #notVisible;
  };

  public type NewOrder = {
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

  type OldActor = {
    orders : Map.Map<Nat, OldOrder>;
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
  };

  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistrationTimes : Map.Map<Principal, Int>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          id = oldOrder.id;
          customerId = oldOrder.customerId;
          guestDeliveryInfo = oldOrder.guestDetails.map(mapGuestDetailsToDeliveryInfo);
          items = oldOrder.items;
          deliveryInfo = mapShippingDetailsToDeliveryInfo(oldOrder.shippingDetails);
          totalAmount = oldOrder.totalAmount;
          razorpayOrderId = oldOrder.razorpayOrderId;
          razorpayPaymentId = oldOrder.razorpayPaymentId;
          paymentStatus = oldOrder.paymentStatus;
          fulfillmentStatus = oldOrder.fulfillmentStatus;
          createdAt = oldOrder.createdAt;
        };
      }
    );
    {
      orders = newOrders;
      products = old.products;
      userProfiles = old.userProfiles;
      userRegistrationTimes = old.userRegistrationTimes;
    };
  };

  func mapShippingDetailsToDeliveryInfo(details : ShippingDetails) : DeliveryInfo {
    {
      fullName = details.fullName;
      address = details.addressLine1 # " " # details.addressLine2 # ", " # details.city # ", " # details.state # ", " # details.pincode;
      phoneNumber = details.phoneNumber;
    };
  };

  func mapGuestDetailsToDeliveryInfo(details : GuestDetails) : DeliveryInfo {
    {
      fullName = details.fullName;
      address = details.addressLine1 # " " # details.addressLine2 # ", " # details.city # ", " # details.state # ", " # details.pincode;
      phoneNumber = details.phoneNumber;
    };
  };
};
