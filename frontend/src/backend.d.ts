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
export interface GuestDetails {
    city: string;
    fullName: string;
    email: string;
    state: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    phoneNumber: string;
    orderNotes?: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShippingDetails {
    city: string;
    fullName: string;
    email: string;
    state: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    phoneNumber: string;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    unitPrice: bigint;
}
export interface OrderInput {
    razorpayPaymentId: string;
    guestDetails: GuestDetails;
    razorpayOrderId: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
    shippingDetails: ShippingDetails;
}
export interface Order {
    id: bigint;
    razorpayPaymentId?: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: bigint;
    guestDetails?: GuestDetails;
    razorpayOrderId: string;
    totalAmount: bigint;
    customerId: Principal;
    items: Array<OrderItem>;
    shippingDetails: ShippingDetails;
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
    /**
     * / Order owner or admin: confirm payment for an order.
     */
    confirmPayment(orderId: bigint, razorpayPaymentId: string): Promise<void>;
    /**
     * / Authenticated users only: create a Stripe checkout session.
     */
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Authenticated users or guests: place a new order.
     */
    createOrder(orderInput: OrderInput): Promise<Order>;
    /**
     * / Admin-only: create a new product.
     */
    createProduct(productInput: ProductInput): Promise<Product>;
    /**
     * / Admin-only: delete a product.
     */
    deleteProduct(id: bigint): Promise<void>;
    /**
     * / Admin-only: get all products including hidden/draft ones.
     */
    getAllProducts(): Promise<Array<Product>>;
    /**
     * / Admin-only: list all registered users with profile and order summary.
     */
    getAllUsers(): Promise<Array<UserSummary>>;
    /**
     * / Authenticated users only: get the caller's own profile.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Public: get featured products for the storefront.
     * / Excludes #notVisible products.
     */
    getFeaturedProducts(): Promise<Array<Product>>;
    /**
     * / Authenticated users only: list the caller's own orders.
     */
    getMyOrders(): Promise<Array<Order>>;
    /**
     * / Order owner or admin: get a single order by id.
     */
    getOrderById(orderId: bigint): Promise<Order | null>;
    /**
     * / Admin-only: list all orders.
     */
    getOrders(): Promise<Array<Order>>;
    /**
     * / Public: paginated product listing.
     * / Excludes #notVisible products.
     */
    getPaginatedProducts(page: bigint, pageSize: bigint): Promise<Array<Product>>;
    /**
     * / Public: get a single product by id (storefront).
     * / Returns null for #notVisible products to prevent information leakage.
     */
    getProductById(id: bigint): Promise<Product | null>;
    /**
     * / Public: browse products (storefront).
     * / When statusFilter is empty, defaults to all statuses except #notVisible.
     * / When statusFilter is provided, only returns products matching those statuses,
     * / but always excludes #notVisible to prevent leaking hidden products publicly.
     */
    getProducts(statusFilter: Array<ProductStatus>): Promise<Array<Product>>;
    /**
     * / Public: filter products by category.
     * / Excludes #notVisible products.
     */
    getProductsByCategory(category: string): Promise<Array<Product>>;
    /**
     * / Public: returns only the Razorpay public key needed by the checkout page.
     * / The Razorpay Key ID is a client-side public key and must be readable by
     * / any visitor so that the checkout flow works without authentication.
     */
    getRazorpayKeyId(): Promise<string>;
    /**
     * / Admin-only: read the full site settings (includes sensitive config).
     */
    getSiteSettings(): Promise<SiteSettings>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    /**
     * / Owner or admin: get a specific user's profile.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsappButtonSettings(): Promise<WhatsAppButtonSettings>;
    getWhatsappNumber(): Promise<string>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Public: check whether a product is in stock.
     * / Returns false for #notVisible products.
     */
    isProductInStock(productId: bigint): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    /**
     * / Authenticated users only: save the caller's own profile.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Public: full-text search over product name and description.
     * / Excludes #notVisible products.
     */
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    /**
     * / Bootstrap or admin-only: set the admin principal.
     * / When no admin has been set yet, any authenticated caller may claim admin.
     * / Once an admin is set, only the current admin can change it.
     */
    setAdmin(principal: Principal): Promise<void>;
    /**
     * / Admin-only: persist updated site settings.
     */
    setSiteSettings(newSettings: SiteSettings): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    /**
     * / Admin-only: update the fulfillment status of an order.
     */
    updateFulfillmentStatus(orderId: bigint, status: string): Promise<void>;
    /**
     * / Admin-only: update an existing product.
     */
    updateProduct(id: bigint, productInput: ProductInput): Promise<Product>;
    /**
     * / Admin-only: update stock quantity for a product.
     */
    updateStock(id: bigint, quantity: bigint): Promise<void>;
    updateWhatsappButtonSettings(settings: WhatsAppButtonSettings): Promise<void>;
}
