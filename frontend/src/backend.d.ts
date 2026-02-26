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
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SiteSettings {
    razorpayKeyId: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
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
    active = "active",
    launchingSoon = "launchingSoon",
    outOfStock = "outOfStock"
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
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Authenticated users only: place a new order.
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Public: get featured products for the storefront.
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
     */
    getPaginatedProducts(page: bigint, pageSize: bigint): Promise<Array<Product>>;
    /**
     * / Public: get a single product by id (storefront).
     */
    getProductById(id: bigint): Promise<Product | null>;
    /**
     * / Public: browse all products (storefront).
     */
    getProducts(): Promise<Array<Product>>;
    /**
     * / Public: filter products by category.
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
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Public: check whether a product is in stock.
     */
    isProductInStock(productId: bigint): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Public: full-text search over product name and description.
     */
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    /**
     * / Admin-only: persist updated site settings.
     */
    setSiteSettings(newSettings: SiteSettings): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
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
}
