import { useState } from 'react';
import { useGetAllProducts, useDeleteProduct } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Package,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { ProductStatus } from '../../backend';
import type { Product } from '../../backend';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    visible: products.filter((p) => p.status === ProductStatus.visible).length,
    featured: products.filter((p) => p.status === ProductStatus.featured).length,
    outOfStock: products.filter((p) => p.status === ProductStatus.outOfStock).length,
    launchingSoon: products.filter((p) => p.status === ProductStatus.launchingSoon).length,
    notVisible: products.filter((p) => p.status === ProductStatus.notVisible).length,
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteProduct.mutateAsync(deletingId);
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-fg">Products</h1>
          <p className="text-admin-muted text-sm mt-1">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
          className="bg-admin-accent hover:bg-admin-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-admin-fg', icon: Package },
          { label: 'Visible', value: stats.visible, color: 'text-emerald-600', icon: Eye },
          { label: 'Featured', value: stats.featured, color: 'text-amber-600', icon: Star },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600', icon: Package },
          { label: 'Launching Soon', value: stats.launchingSoon, color: 'text-blue-600', icon: Package },
          { label: 'Not Visible', value: stats.notVisible, color: 'text-gray-400', icon: EyeOff },
        ].map((s) => (
          <Card key={s.label} className="bg-admin-card border-admin-border">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-admin-muted text-xs mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-admin-card border-admin-border text-admin-fg"
        />
      </div>

      {/* Table */}
      <Card className="bg-admin-card border-admin-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-admin-muted mx-auto mb-3 opacity-40" />
            <p className="text-admin-muted">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                    Price
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                    Stock
                  </th>
                  <th className="text-right p-4 text-admin-muted text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filtered.map((product) => (
                  <tr
                    key={product.id.toString()}
                    className="hover:bg-admin-hover/50 transition-colors"
                  >
                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-admin-bg flex-shrink-0 border border-admin-border">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-admin-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-admin-fg text-sm font-medium truncate max-w-[160px]">
                            {product.name}
                          </p>
                          {product.isFeatured && (
                            <span className="text-amber-500 text-xs flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-500" />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-admin-muted text-sm">{product.category}</span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={product.status} size="sm" />
                    </td>

                    {/* Price */}
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-admin-fg text-sm font-medium">
                        ₹{Number(product.priceInr).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-sm font-medium ${Number(product.stockQuantity) === 0 ? 'text-red-500' : 'text-admin-fg'}`}>
                        {Number(product.stockQuantity)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="w-8 h-8 text-admin-muted hover:text-admin-fg hover:bg-admin-hover"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(product.id)}
                          className="w-8 h-8 text-admin-muted hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(undefined);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-admin-card border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-fg">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-admin-muted">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeletingId(null)}
              className="border-admin-border text-admin-fg hover:bg-admin-hover"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
