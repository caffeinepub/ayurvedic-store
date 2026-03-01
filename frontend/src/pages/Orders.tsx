import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Package, ShoppingBag, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useGetMyOrders, useGetProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Order, Product } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function formatNanosecondDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount: bigint): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function PaymentStatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  if (lower === 'paid') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
        <CheckCircle className="w-3 h-3" />
        Paid
      </Badge>
    );
  }
  if (lower === 'pending') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <XCircle className="w-3 h-3" />
      {status}
    </Badge>
  );
}

function FulfillmentStatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  if (lower === 'delivered') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
        <CheckCircle className="w-3 h-3" />
        Delivered
      </Badge>
    );
  }
  if (lower === 'shipped') {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
        <Truck className="w-3 h-3" />
        Shipped
      </Badge>
    );
  }
  if (lower === 'processing') {
    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1">
        <Clock className="w-3 h-3" />
        Processing
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
      <Clock className="w-3 h-3" />
      {status}
    </Badge>
  );
}

function OrderCard({ order, products }: { order: Order; products: Product[] }) {
  const getProductName = (productId: bigint): string => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId.toString()}`;
  };

  const getProductImage = (productId: bigint): string | null => {
    const product = products.find((p) => p.id === productId);
    return product ? product.imageUrl : null;
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="bg-muted/40 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Order ID</p>
            <p className="font-mono font-semibold text-foreground text-sm">
              #ORDER-{order.id.toString().padStart(4, '0')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Date</p>
            <p className="text-sm text-foreground">{formatNanosecondDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total</p>
            <p className="text-sm font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PaymentStatusBadge status={order.paymentStatus} />
          <FulfillmentStatusBadge status={order.fulfillmentStatus} />
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Items Ordered</p>
        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const imgUrl = getProductImage(item.productId);
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={getProductName(item.productId)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/assets/generated/product-ubtan.dim_600x600.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getProductName(item.productId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity.toString()} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground flex-shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="px-6 pb-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
          Shipping To
        </p>
        <p className="text-sm text-foreground">
          {order.shippingDetails.fullName} — {order.shippingDetails.addressLine1}
          {order.shippingDetails.addressLine2 ? `, ${order.shippingDetails.addressLine2}` : ''},{' '}
          {order.shippingDetails.city}, {order.shippingDetails.state} -{' '}
          {order.shippingDetails.pincode}
        </p>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders();
  const { data: products = [] } = useGetProducts();

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h2 className="font-serif text-3xl text-foreground mb-3">Login to view orders</h2>
          <p className="text-muted-foreground mb-8">
            Please login to see your order history and track your deliveries.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-serif text-3xl text-foreground">My Orders</h1>
        </div>

        {/* Loading State */}
        {ordersLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="bg-muted/40 px-6 py-4 border-b border-border">
                  <div className="flex gap-6">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!ordersLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-40" />
            <h2 className="font-serif text-2xl text-foreground mb-3">No orders yet</h2>
            <p className="text-muted-foreground mb-8">
              Start shopping to see your orders here!
            </p>
            <button
              onClick={() => navigate({ to: '/shop' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium transition-colors"
            >
              Shop Now
            </button>
          </div>
        )}

        {/* Orders List */}
        {!ordersLoading && orders && orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </p>
            {[...orders]
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order) => (
                <OrderCard key={order.id.toString()} order={order} products={products} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
