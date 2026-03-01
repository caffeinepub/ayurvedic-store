import { useRef, useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';
import { useGetFeaturedProducts } from '../hooks/useQueries';
import { ProductStatus } from '../backend';

export default function FeaturedProducts() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter: show products that are featured status OR have isFeatured flag, excluding notVisible
  const displayProducts = featuredProducts?.filter(
    p => p.status !== ProductStatus.notVisible
  ) ?? [];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-14 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="font-sans text-golden text-xs font-bold uppercase tracking-[0.25em] mb-3">
            Our Bestsellers
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest mb-4">
            Featured Products
          </h2>
          <div className="golden-divider w-32 mx-auto mb-4" />
          <p className="font-sans text-bark/60 text-lg max-w-xl mx-auto">
            Handpicked Ayurvedic formulations loved by thousands of customers across India.
          </p>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-botanical">
                <Skeleton className="aspect-square w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-sans text-bark/50 text-lg">Products loading...</p>
          </div>
        )}

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link to="/shop">
            <button className="group inline-flex items-center gap-2 border-2 border-forest text-forest hover:bg-forest hover:text-cream font-sans font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-300 min-h-[48px]">
              View All Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
