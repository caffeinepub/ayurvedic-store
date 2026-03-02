import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    status: ProductStatus;
    specifications: Array<Specification>;
    stockQuantity: bigint;
    name: string;
    description: string;
    imageUrl: string;
    isFeatured: boolean;
    category: string;
    priceInr: bigint;
}
export interface ProductInput {
    status: ProductStatus;
    specifications: Array<Specification>;
    stockQuantity: bigint;
    name: string;
    description: string;
    imageUrl: string;
    isFeatured: boolean;
    category: string;
    priceInr: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    unitPrice: bigint;
}
export interface OrderInput {
    razorpayPaymentId: string;
    deliveryInfo: DeliveryInfo;
    razorpayOrderId: string;
    totalAmount: bigint;
    guestDeliveryInfo: DeliveryInfo;
    items: Array<OrderItem>;
}
export interface Order {
    id: bigint;
    razorpayPaymentId?: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: bigint;
    deliveryInfo: DeliveryInfo;
    razorpayOrderId: string;
    totalAmount: bigint;
    customerId: Principal;
    guestDeliveryInfo?: DeliveryInfo;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface WhatsAppButtonSettings {
    ringEffect: boolean;
    icon: string;
    animation: string;
    tooltip: string;
    pulseRingColor: string;
    enabled: boolean;
    buttonColor: string;
    number: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SiteSettings {
    razorpayKeyId: string;
    whatsappNumber: string;
    storeName: string;
    contactEmail: string;
    announcementBanner: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface DeliveryInfo {
    fullName: string;
    address: string;
    phoneNumber: string;
}
export interface UserSummary {
    principal: Principal;
    orderCount: bigint;
    registeredAt: bigint;
    profile?: UserProfile;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Specification {
    key: string;
    value: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum ProductStatus {
    featured = "featured",
    launchingSoon = "launchingSoon",
    outOfStock = "outOfStock",
    notVisible = "notVisible",
    visible = "visible"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmPayment(orderId: bigint, razorpayPaymentId: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(orderInput: OrderInput): Promise<Order>;
    createProduct(productInput: ProductInput): Promise<Product>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getAllUsers(): Promise<Array<UserSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getPaginatedProducts(page: bigint, pageSize: bigint): Promise<Array<Product>>;
    getProductById(id: bigint): Promise<Product | null>;
    getProducts(statusFilter: Array<ProductStatus>): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getRazorpayKeyId(): Promise<string>;
    getSiteSettings(): Promise<SiteSettings>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsappButtonSettings(): Promise<WhatsAppButtonSettings>;
    getWhatsappNumber(): Promise<string>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isProductInStock(productId: bigint): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    setAdmin(principal: Principal): Promise<void>;
    setSiteSettings(newSettings: SiteSettings): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateFulfillmentStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, productInput: ProductInput): Promise<Product>;
    updateStock(id: bigint, quantity: bigint): Promise<void>;
    updateWhatsappButtonSettings(settings: WhatsAppButtonSettings): Promise<void>;
}
