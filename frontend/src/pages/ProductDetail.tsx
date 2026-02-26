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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductById } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { ProductStatus } from '../backend';

export default function ProductDetail() {
  const params = useParams({ from: '/customer-layout/product/$productId' });
  const productId = params.productId;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCheckout, isLoading: razorpayLoading, isConfigured } = useRazorpay();

  const [quantity, setQuantity] = useState(1);

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
        <AlertCircle className="w-16 h-16 text-sage/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-forest mb-2">Product not found</h2>
        <p className="text-bark/60 mb-6">The product you're looking for doesn't exist.</p>
        <Button
          onClick={() => navigate({ to: '/shop' })}
          className="bg-forest hover:bg-forest/90 text-cream"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const isActive = product.status === ProductStatus.active;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;
  const maxQty = Number(product.stockQuantity) || 10;

  const handleAddToCart = () => {
    if (isActive) {
      addItem(product, quantity);
      navigate({ to: '/cart' });
    }
  };

  const handleBuyNow = async () => {
    if (!isActive) return;
    const totalPrice = Number(product.priceInr) * quantity;
    await openCheckout({
      productName: product.name,
      amountInr: totalPrice,
      storeName: 'Nature Glow',
      description: `${product.name} × ${quantity}`,
    });
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
                <Badge className="bg-bark/80 text-cream text-sm font-medium flex items-center gap-1 px-3 py-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </Badge>
              </div>
            )}
            {isLaunchingSoon && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-golden text-white text-sm font-bold flex items-center gap-1 px-3 py-1">
                  <Clock className="w-3.5 h-3.5" />
                  Launching Soon
                </Badge>
              </div>
            )}
            {product.isFeatured && isActive && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-forest text-cream text-xs font-medium px-3 py-1">
                  ⭐ Featured
                </Badge>
              </div>
            )}
          </div>

          {/* ── Product Details ── */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-2">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-bark/70 leading-relaxed mb-5 text-sm md:text-base">
              {product.description}
            </p>

            {/* ── Price ── */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-bold text-golden text-3xl md:text-4xl">
                ₹{Number(product.priceInr).toLocaleString('en-IN')}
              </span>
              <span className="text-bark/40 text-sm line-through">
                ₹{Math.round(Number(product.priceInr) * 1.2).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold bg-forest/10 text-forest px-2 py-0.5 rounded-full">
                20% OFF
              </span>
            </div>

            {/* Stock info */}
            {isActive && (
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle className="w-4 h-4 text-forest" />
                <span className="text-forest text-sm font-medium">
                  In Stock ({Number(product.stockQuantity)} available)
                </span>
              </div>
            )}

            {/* ── Quantity Selector ── */}
            {isActive && (
              <div className="mb-6">
                <label className="text-bark/70 text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-0 border-2 border-sage/40 rounded-xl w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-parchment hover:bg-sage/20 transition-colors text-bark disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-base font-bold text-forest bg-white h-10 flex items-center justify-center border-x-2 border-sage/40">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center bg-parchment hover:bg-sage/20 transition-colors text-bark disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!isActive}
                className={`flex-1 py-3 text-base font-semibold rounded-xl shadow-botanical transition-all ${
                  isActive
                    ? 'bg-forest hover:bg-forest/90 text-cream hover:shadow-botanical-lg'
                    : 'bg-bark/20 text-bark/40 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isOutOfStock ? 'Out of Stock' : isLaunchingSoon ? 'Coming Soon' : 'Add to Cart'}
              </Button>

              {/* Buy Now */}
              <Button
                onClick={handleBuyNow}
                disabled={!isActive || razorpayLoading || !isConfigured}
                className={`flex-1 py-3 text-base font-semibold rounded-xl transition-all ${
                  isActive && isConfigured
                    ? 'bg-golden hover:bg-golden/90 text-white shadow-botanical hover:shadow-botanical-lg'
                    : 'bg-bark/20 text-bark/40 cursor-not-allowed'
                }`}
              >
                {razorpayLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {/* ── Specifications ── */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-8 bg-white rounded-2xl p-5 shadow-botanical">
                <h3 className="font-serif font-semibold text-forest mb-3 text-lg">
                  Specifications
                </h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-3 text-sm border-b border-sage/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-bark/50 w-32 flex-shrink-0 font-medium">{spec.key}</span>
                      <span className="text-bark font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Delivery & Returns ── */}
            <div className="bg-white rounded-2xl p-5 shadow-botanical">
              <h3 className="font-serif font-semibold text-forest mb-4 text-lg">
                Delivery & Returns
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-forest" />
                  </div>
                  <div>
                    <p className="text-bark font-semibold text-sm">Estimated Delivery</p>
                    <p className="text-bark/60 text-xs mt-0.5">
                      3–7 business days across India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-golden/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-golden" />
                  </div>
                  <div>
                    <p className="text-bark font-semibold text-sm">Free Shipping</p>
                    <p className="text-bark/60 text-xs mt-0.5">
                      On all orders above ₹499. Standard shipping ₹49 below that.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-bark font-semibold text-sm">Easy Returns</p>
                    <p className="text-bark/60 text-xs mt-0.5">
                      7-day hassle-free return policy. Contact us for any issues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
