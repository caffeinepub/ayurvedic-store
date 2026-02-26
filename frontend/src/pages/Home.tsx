import { Link } from '@tanstack/react-router';
import { ArrowRight, Leaf, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import SeedProducts from '../components/SeedProducts';
import { useGetFeaturedProducts, useGetProducts } from '../hooks/useQueries';

export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();
  const { data: allProducts } = useGetProducts();

  return (
    <div className="bg-background">
      <SeedProducts />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/generated/hero-banner.dim_1440x600.png')" }}
        />
        <div className="absolute inset-0 bg-forest/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-sage" />
              <span className="text-sage text-sm font-medium uppercase tracking-widest">
                Pure Ayurvedic Skincare
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-cream leading-tight mb-4">
              Nature Glow
            </h1>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream leading-tight mb-6">
              Radiance Rooted in
              <span className="text-golden block">Ancient Wisdom</span>
            </h2>
            <p className="text-cream/80 text-lg leading-relaxed mb-8 max-w-lg">
              Discover our handcrafted Ayurvedic face packs and powders, made with pure botanical
              ingredients for your skin's natural glow.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold px-8 py-3 text-base">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-parchment py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Leaf className="w-6 h-6 text-forest" />,
                title: '100% Natural',
                desc: 'Pure botanical ingredients, no harmful chemicals',
              },
              {
                icon: <Shield className="w-6 h-6 text-forest" />,
                title: 'Dermatologist Tested',
                desc: 'Safe for all skin types including sensitive skin',
              },
              {
                icon: <Star className="w-6 h-6 text-forest" />,
                title: 'Ancient Recipes',
                desc: 'Time-tested Ayurvedic formulations for modern skin',
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-botanical"
              >
                <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-forest mb-1">{feature.title}</h3>
                  <p className="text-bark/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sage text-sm font-medium uppercase tracking-widest mb-2">
              Our Bestsellers
            </p>
            <h2 className="font-serif text-4xl font-bold text-forest">Featured Products</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-bark/60">Loading products...</p>
          )}

          <div className="text-center mt-10">
            <Link to="/shop">
              <Button
                variant="outline"
                className="border-forest text-forest hover:bg-forest hover:text-cream font-semibold px-8"
              >
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/generated/ingredients-section.dim_900x500.png')",
          }}
        />
        <div className="absolute inset-0 bg-forest/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl font-bold text-cream mb-4">
            The Power of Nature
          </h2>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto mb-8">
            Every ingredient is carefully sourced from trusted farms across India. We believe in
            transparency — what goes on your skin matters.
          </p>
          <Link to="/shop">
            <Button className="bg-cream text-forest hover:bg-cream/90 font-semibold px-8">
              Explore Our Range
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
