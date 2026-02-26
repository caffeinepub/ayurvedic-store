import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Clock, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Product, ProductStatus } from '../backend';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCheckout, isLoading: razorpayLoading, isConfigured } = useRazorpay();

  const isActive = product.status === ProductStatus.active;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      addItem(product, 1);
      navigate({ to: '/cart' });
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive || !isConfigured) return;
    await openCheckout({
      productName: product.name,
      amountInr: Number(product.priceInr),
      storeName: 'Nature Glow',
      description: product.name,
    });
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-botanical hover:shadow-botanical-lg transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-parchment">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badges */}
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
            <Badge className="bg-golden text-white text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Launching Soon
            </Badge>
          </div>
        )}
        {product.isFeatured && isActive && (
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
          {isActive && (
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
            disabled={!isActive}
            className={`flex-1 text-xs font-semibold rounded-xl transition-all ${
              isActive
                ? 'bg-forest hover:bg-forest/90 text-cream shadow-sm hover:shadow-botanical'
                : 'bg-bark/15 text-bark/40 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {isOutOfStock ? 'Out of Stock' : isLaunchingSoon ? 'Coming Soon' : 'Add to Cart'}
          </Button>

          {/* Buy Now */}
          {isActive && (
            <Button
              size="sm"
              onClick={handleBuyNow}
              disabled={razorpayLoading || !isConfigured}
              className="flex-1 text-xs font-semibold rounded-xl bg-golden hover:bg-golden/90 text-white shadow-sm hover:shadow-botanical transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {razorpayLoading ? (
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
