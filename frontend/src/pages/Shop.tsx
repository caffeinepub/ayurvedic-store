import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import { useGetProducts } from '../hooks/useQueries';
import { ProductStatus } from '../backend';

const CATEGORIES = ['All', 'Face Pack', 'Powder'];
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: ProductStatus.active },
  { label: 'Out of Stock', value: ProductStatus.outOfStock },
  { label: 'Launching Soon', value: ProductStatus.launchingSoon },
];

export default function Shop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: products, isLoading } = useGetProducts();

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesSearch =
        !search.trim() ||
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
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-parchment py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sage text-sm font-medium uppercase tracking-widest mb-2">
            Our Collection
          </p>
          <h1 className="font-serif text-4xl font-bold text-forest">Shop All Products</h1>
          <p className="text-bark/60 mt-3 max-w-xl mx-auto">
            Explore our range of pure Ayurvedic face packs and powders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark/40" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-sage/30 focus:border-forest"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? 'bg-forest text-cream hover:bg-forest/90'
                    : 'border-sage/40 text-bark hover:border-forest hover:text-forest'
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {STATUS_FILTERS.map(sf => (
            <button
              key={sf.value}
              onClick={() => setSelectedStatus(sf.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedStatus === sf.value
                  ? 'bg-terracotta text-cream border-terracotta'
                  : 'border-sage/40 text-bark hover:border-terracotta hover:text-terracotta'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-sage/40 mx-auto mb-4" />
            <p className="text-bark/60 font-medium">No products found</p>
            <p className="text-bark/40 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-bark/60 text-sm mb-4">{filtered.length} products found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
