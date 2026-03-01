import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useGetProducts } from '../hooks/useQueries';
import { ProductStatus } from '../backend';
import ProductCard from '../components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['All', 'Face Pack', 'Cream', 'Ubtan', 'Toner', 'Gel', 'Oil', 'Serum', 'Powder'];
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: ProductStatus.visible },
  { label: 'Featured', value: ProductStatus.featured },
  { label: 'Out of Stock', value: ProductStatus.outOfStock },
  { label: 'Coming Soon', value: ProductStatus.launchingSoon },
];

export default function Shop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: products, isLoading } = useGetProducts([]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p) => p.status !== ProductStatus.notVisible)
      .filter((p) => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStatus =
          selectedStatus === 'all' || p.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [products, search, selectedCategory, selectedStatus]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-gold/70 text-sm font-medium tracking-widest uppercase mb-2 block">
            Our Collection
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Shop All Products
          </h1>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-4" />
          <p className="text-cream/70 max-w-xl mx-auto">
            Discover our complete range of Ayurvedic skincare products, crafted with
            pure botanical ingredients.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-forest/20 bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedStatus(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === value
                    ? 'bg-forest text-cream'
                    : 'bg-white text-forest/70 border border-forest/20 hover:border-forest/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-gold text-forest font-semibold'
                  : 'bg-white text-forest/70 border border-forest/20 hover:border-gold/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-forest/50 text-sm mb-6">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-forest/30 text-6xl mb-4">🌿</div>
            <h3 className="font-serif text-xl text-forest/60 mb-2">No products found</h3>
            <p className="text-forest/40 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedStatus('all');
              }}
              className="mt-4 px-6 py-2 bg-forest text-cream rounded-full text-sm hover:bg-forest/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
