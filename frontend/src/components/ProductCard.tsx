import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Clock, AlertCircle, Zap, Loader2, Star } from 'lucide-react';
import { Product, ProductStatus } from '../backend';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { useCreateOrder } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const emptyGuestDetails = {
  fullName: '',
  email: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  orderNotes: undefined as string | undefined,
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCheckout } = useRazorpay();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const isVisible = product.status === ProductStatus.visible;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;
  const isFeaturedStatus = product.status === ProductStatus.featured;
  const isNotVisible = product.status === ProductStatus.notVisible;

  // Products that can be purchased
  const canPurchase = isVisible || isFeaturedStatus;

  // Don't render notVisible products at all
  if (isNotVisible) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canPurchase) {
      addItem(product, 1);
      navigate({ to: '/cart' });
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canPurchase) return;
    setIsBuyingNow(true);
    try {
      await openCheckout({
        amount: Number(product.priceInr) * 100,
        name: 'Nature Glow',
        description: product.name,
        onSuccess: async (paymentId: string, rzpOrderId: string) => {
          try {
            await createOrder.mutateAsync({
              items: [{ productId: product.id, quantity: BigInt(1), unitPrice: product.priceInr }],
              shippingDetails: {
                fullName: '',
                email: '',
                phoneNumber: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
              },
              guestDetails: emptyGuestDetails,
              totalAmount: product.priceInr,
              razorpayOrderId: rzpOrderId || `rzp_${Date.now()}`,
              razorpayPaymentId: paymentId,
            });
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
          } catch {
            // Order save failed but payment succeeded — still navigate to success
          }
          navigate({ to: '/payment-success' });
        },
        onDismiss: () => {
          setIsBuyingNow(false);
          navigate({ to: '/payment-failure' });
        },
      });
    } catch (err: any) {
      if (err?.message !== 'Payment dismissed') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-botanical hover:shadow-botanical-lg transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => navigate({ to: '/product/$id', params: { id: product.id.toString() } })}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-parchment">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badges - top left */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-bark/80 text-cream text-xs font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </Badge>
          </div>
        )}
        {isLaunchingSoon && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-600 text-white text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Launching Soon
            </Badge>
          </div>
        )}
        {isFeaturedStatus && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500 text-white text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </Badge>
          </div>
        )}
        {/* Featured star indicator (top right) for isFeatured flag */}
        {product.isFeatured && !isFeaturedStatus && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-forest text-cream text-xs font-medium">⭐ Featured</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-sage font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-forest font-semibold text-base leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-bark/60 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-golden text-lg">
            ₹{Number(product.priceInr).toLocaleString('en-IN')}
          </span>
          {canPurchase && (
            <span className="text-xs text-bark/40 line-through">
              ₹{Math.round(Number(product.priceInr) * 1.2).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {/* Add to Cart */}
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!canPurchase}
            className={`flex-1 text-xs font-semibold rounded-xl transition-all ${
              canPurchase
                ? 'bg-forest hover:bg-forest/90 text-cream shadow-sm hover:shadow-botanical'
                : 'bg-bark/15 text-bark/40 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {isOutOfStock ? 'Out of Stock' : isLaunchingSoon ? 'Coming Soon' : 'Add to Cart'}
          </Button>

          {/* Buy Now */}
          {canPurchase && (
            <Button
              size="sm"
              onClick={handleBuyNow}
              disabled={isBuyingNow}
              className="flex-1 text-xs font-semibold rounded-xl bg-golden hover:bg-golden/90 text-white shadow-sm hover:shadow-botanical transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuyingNow ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Buy Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
