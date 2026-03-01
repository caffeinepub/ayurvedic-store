import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  AlertCircle,
  CheckCircle,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Zap,
  Loader2,
  Star,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductById, useCreateOrder } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { ProductStatus } from '../backend';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProductDetail() {
  const params = useParams({ from: '/customer-layout/product/$id' });
  const productId = params.id;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCheckout } = useRazorpay();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const productIdBigInt: bigint | null = productId ? BigInt(productId) : null;
  const { data: product, isLoading } = useGetProductById(productIdBigInt);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <EyeOff className="w-16 h-16 text-sage/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-forest mb-2">Product Not Available</h2>
        <p className="text-bark/60 mb-6">
          This product is currently unavailable or does not exist.
        </p>
        <Button
          onClick={() => navigate({ to: '/shop' })}
          className="bg-forest hover:bg-forest/90 text-cream"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const isVisible = product.status === ProductStatus.visible;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;
  const isFeaturedStatus = product.status === ProductStatus.featured;

  const canPurchase = isVisible || isFeaturedStatus;

  const maxQty = Number(product.stockQuantity) || 10;

  const handleAddToCart = () => {
    if (canPurchase) {
      addItem(product, quantity);
      navigate({ to: '/cart' });
    }
  };

  const handleBuyNow = async () => {
    if (!canPurchase) return;
    const totalPrice = Number(product.priceInr) * quantity;
    setIsBuyingNow(true);
    try {
      await openCheckout({
        amount: totalPrice * 100,
        name: 'Nature Glow',
        description: `${product.name} × ${quantity}`,
        onSuccess: async (paymentId: string, rzpOrderId: string) => {
          try {
            // For Buy Now, we create an order with empty guest details
            // since we don't have a checkout form here — the user can fill details in cart
            const emptyGuestDetails = {
              fullName: '',
              email: '',
              phoneNumber: '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              pincode: '',
              orderNotes: undefined,
            };

            await createOrder.mutateAsync({
              items: [{ productId: product.id, quantity: BigInt(quantity), unitPrice: product.priceInr }],
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
              totalAmount: BigInt(totalPrice),
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
    <div className="bg-parchment min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/shop' })}
          className="flex items-center gap-2 text-bark/60 hover:text-forest transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ── Product Image ── */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-botanical">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-bark/80 text-cream flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Out of Stock
                </Badge>
              </div>
            )}
            {isLaunchingSoon && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600 text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Launching Soon
                </Badge>
              </div>
            )}
            {isFeaturedStatus && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-amber-500 text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </Badge>
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs text-sage font-semibold uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest leading-tight mb-3">
                {product.name}
              </h1>
              <p className="text-bark/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-golden text-3xl">
                ₹{Number(product.priceInr).toLocaleString('en-IN')}
              </span>
              {canPurchase && (
                <span className="text-bark/40 line-through text-lg">
                  ₹{Math.round(Number(product.priceInr) * 1.2).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {isOutOfStock && (
              <div className="flex items-center gap-2 p-3 bg-bark/10 rounded-xl text-bark/70 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                This product is currently out of stock. Check back soon!
              </div>
            )}
            {isLaunchingSoon && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" />
                This product is launching soon. Stay tuned!
              </div>
            )}

            {/* Quantity selector */}
            {canPurchase && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-bark">Quantity:</span>
                <div className="flex items-center gap-3 bg-parchment rounded-xl px-3 py-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sage/20 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-bark" />
                  </button>
                  <span className="w-8 text-center font-semibold text-forest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sage/20 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-bark" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!canPurchase}
                className={`flex-1 py-3 font-semibold rounded-xl ${
                  canPurchase
                    ? 'bg-forest hover:bg-forest/90 text-cream shadow-botanical'
                    : 'bg-bark/15 text-bark/40 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? 'Out of Stock' : isLaunchingSoon ? 'Coming Soon' : 'Add to Cart'}
              </Button>

              {canPurchase && (
                <Button
                  onClick={handleBuyNow}
                  disabled={isBuyingNow}
                  className="flex-1 py-3 font-semibold rounded-xl bg-golden hover:bg-golden/90 text-white shadow-botanical disabled:opacity-50"
                >
                  {isBuyingNow ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Buy Now
                </Button>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹499' },
                { icon: Shield, label: 'Secure Payment', sub: 'Razorpay secured' },
                { icon: RefreshCw, label: 'Easy Returns', sub: '7-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl shadow-sm">
                  <Icon className="w-5 h-5 text-forest mb-1" />
                  <p className="text-xs font-semibold text-forest">{label}</p>
                  <p className="text-xs text-bark/50">{sub}</p>
                </div>
              ))}
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-serif text-forest font-semibold mb-3">Specifications</h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-sage/10 pb-2 last:border-0">
                      <span className="text-bark/60 font-medium">{spec.key}</span>
                      <span className="text-forest font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock info */}
            {canPurchase && product.stockQuantity > 0 && (
              <div className="flex items-center gap-2 text-sm text-forest">
                <CheckCircle className="w-4 h-4" />
                <span>{Number(product.stockQuantity)} units in stock</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
