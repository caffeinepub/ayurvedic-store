import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Zap, ArrowLeft, Star, Package, Minus, Plus } from 'lucide-react';
import { useGetProductById, useGetRazorpayKeyId } from '../hooks/useQueries';
import { useRazorpay } from '../hooks/useRazorpay';
import { useCart } from '../context/CartContext';
import { ProductStatus, OrderInput } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import StatusBadge from '../components/admin/StatusBadge';
import DeliveryDetailsModal, { DeliveryFormData } from '../components/DeliveryDetailsModal';

// We read the id from the URL via window.location since the route path
// is nested under the customer-layout and the full route id is long.
function useProductId(): bigint | null {
  const pathname = window.location.pathname;
  const match = pathname.match(/\/product\/(\d+)/);
  if (match && match[1]) {
    try {
      return BigInt(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const productId = useProductId();
  const [quantity, setQuantity] = useState(1);
  const [buyingNow, setBuyingNow] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const { data: product, isLoading } = useGetProductById(productId);
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { openCheckout, isCreatingOrder } = useRazorpay();
  const { addItem } = useCart();

  const isOutOfStock =
    product?.status === ProductStatus.outOfStock || product?.stockQuantity === BigInt(0);
  const isLaunchingSoon = product?.status === ProductStatus.launchingSoon;

  const handleAddToCart = () => {
    if (!product || isOutOfStock || isLaunchingSoon) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        priceInr: product.priceInr,
        imageUrl: product.imageUrl,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNowClick = () => {
    if (!product || isOutOfStock || isLaunchingSoon || !razorpayKeyId) return;
    setShowDeliveryModal(true);
  };

  const handleDeliverySubmit = async (deliveryData: DeliveryFormData) => {
    if (!product || !razorpayKeyId) return;
    setBuyingNow(true);
    try {
      const deliveryInfo = {
        fullName: deliveryData.fullName,
        address: deliveryData.address,
        phoneNumber: deliveryData.phoneNumber,
      };

      const orderInput: OrderInput = {
        items: [
          {
            productId: product.id,
            quantity: BigInt(quantity),
            unitPrice: product.priceInr,
          },
        ],
        deliveryInfo,
        guestDeliveryInfo: deliveryInfo,
        totalAmount: product.priceInr * BigInt(quantity),
        razorpayOrderId: `order_${Date.now()}`,
        razorpayPaymentId: '',
      };

      setShowDeliveryModal(false);

      await openCheckout({
        keyId: razorpayKeyId,
        amount: Number(product.priceInr) * quantity * 100,
        name: 'Nature Glow',
        description: product.name,
        orderInput,
        prefill: {
          name: deliveryData.fullName,
          contact: deliveryData.phoneNumber,
        },
      });
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-forest/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-forest mb-2">Product Not Found</h2>
          <p className="text-forest/60 mb-6">
            This product doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="px-6 py-3 bg-forest text-cream rounded-full hover:bg-forest/90 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/shop' })}
          className="flex items-center gap-2 text-forest/60 hover:text-forest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-sage/20 aspect-square">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/assets/generated/product-neem.dim_600x600.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-forest/20" />
                </div>
              )}
            </div>
            {product.isFeatured && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-gold/90 rounded-full">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span className="text-white text-xs font-medium">Featured</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-forest/50 text-sm uppercase tracking-wide">
                {product.category}
              </span>
              <StatusBadge status={product.status} size="sm" />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-forest mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
              <span className="text-forest/50 text-sm ml-2">(4.9)</span>
            </div>

            <p className="text-forest/70 leading-relaxed mb-6">{product.description}</p>

            <div className="text-3xl font-bold text-forest mb-6">
              ₹{product.priceInr.toString()}
            </div>

            {/* Quantity */}
            {!isOutOfStock && !isLaunchingSoon && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-forest/70 text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2 border border-forest/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-forest/10 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-forest" />
                  </button>
                  <span className="px-4 py-2 text-forest font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(Number(product.stockQuantity), q + 1)
                      )
                    }
                    className="p-2 hover:bg-forest/10 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-forest" />
                  </button>
                </div>
                <span className="text-forest/40 text-sm">
                  {product.stockQuantity.toString()} in stock
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isLaunchingSoon}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-forest/10 hover:bg-forest/20 text-forest font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {isLaunchingSoon
                  ? 'Coming Soon'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
              {!isOutOfStock && !isLaunchingSoon && razorpayKeyId && (
                <button
                  onClick={handleBuyNowClick}
                  disabled={buyingNow || isCreatingOrder}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gold hover:bg-gold/90 text-forest font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  {buyingNow ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </div>

            {/* Specifications */}
            {product.specifications.length > 0 && (
              <div className="border-t border-forest/10 pt-6">
                <h3 className="font-serif text-lg text-forest mb-4">Product Details</h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b border-forest/5"
                    >
                      <span className="text-forest/60 text-sm">{spec.key}</span>
                      <span className="text-forest text-sm font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        open={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSubmit={handleDeliverySubmit}
        isLoading={buyingNow || isCreatingOrder}
        productName={product?.name}
      />
    </div>
  );
}
