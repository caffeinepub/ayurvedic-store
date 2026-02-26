import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Clock, AlertCircle } from 'lucide-react';
import { Product, ProductStatus } from '../backend';
import { useCart } from '../context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const isActive = product.status === ProductStatus.active;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      addItem(product);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-botanical hover:shadow-botanical-lg transition-all duration-300 cursor-pointer"
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
            <Badge className="bg-terracotta text-cream text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Launching Soon
            </Badge>
          </div>
        )}
        {product.isFeatured && isActive && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-forest text-cream text-xs font-medium">Featured</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-sage font-medium uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-forest font-semibold text-base leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-bark/60 text-xs leading-relaxed mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-terracotta text-lg">
            ₹{Number(product.priceInr).toLocaleString('en-IN')}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!isActive}
            className={`text-xs font-medium ${
              isActive
                ? 'bg-forest hover:bg-forest/90 text-cream'
                : 'bg-bark/20 text-bark/40 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {isOutOfStock ? 'Out of Stock' : isLaunchingSoon ? 'Coming Soon' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
