import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductById } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';
import { ProductStatus } from '../backend';

export default function ProductDetail() {
  const params = useParams({ from: '/customer-layout/product/$productId' });
  const productId = params.productId;
  const navigate = useNavigate();
  const { addItem } = useCart();

  const productIdBigInt = productId ? BigInt(productId) : undefined;
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
        <p className="text-bark/60 text-lg">Product not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/shop' })}
          className="mt-4 border-forest text-forest"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const isActive = product.status === ProductStatus.active;
  const isOutOfStock = product.status === ProductStatus.outOfStock;
  const isLaunchingSoon = product.status === ProductStatus.launchingSoon;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate({ to: '/shop' })}
          className="flex items-center gap-2 text-bark/60 hover:text-forest transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-parchment shadow-botanical-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-bark/80 text-cream flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Out of Stock
                </Badge>
              </div>
            )}
            {isLaunchingSoon && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-terracotta text-cream flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Launching Soon
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-2">
              {product.category}
            </p>
            <h1 className="font-serif text-4xl font-bold text-forest mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-terracotta mb-6">
              ₹{Number(product.priceInr).toLocaleString('en-IN')}
            </p>

            <p className="text-bark/70 leading-relaxed mb-6">{product.description}</p>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {isActive && (
                <>
                  <CheckCircle className="w-4 h-4 text-forest" />
                  <span className="text-forest text-sm font-medium">
                    In Stock ({Number(product.stockQuantity)} available)
                  </span>
                </>
              )}
              {isOutOfStock && (
                <>
                  <AlertCircle className="w-4 h-4 text-bark/60" />
                  <span className="text-bark/60 text-sm font-medium">Currently Out of Stock</span>
                </>
              )}
              {isLaunchingSoon && (
                <>
                  <Clock className="w-4 h-4 text-terracotta" />
                  <span className="text-terracotta text-sm font-medium">Launching Soon</span>
                </>
              )}
            </div>

            <Button
              onClick={() => isActive && addItem(product)}
              disabled={!isActive}
              className={`w-full sm:w-auto px-8 py-3 font-semibold text-base ${
                isActive
                  ? 'bg-terracotta hover:bg-terracotta/90 text-cream'
                  : 'bg-bark/20 text-bark/40 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock
                ? 'Out of Stock'
                : isLaunchingSoon
                ? 'Coming Soon'
                : 'Add to Cart'}
            </Button>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8 border-t border-sage/20 pt-6">
                <h3 className="font-serif font-semibold text-forest mb-4">Specifications</h3>
                <dl className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-4">
                      <dt className="text-bark/60 text-sm w-32 flex-shrink-0">{spec.key}</dt>
                      <dd className="text-bark text-sm font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
