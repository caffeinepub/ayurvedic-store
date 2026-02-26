import { useState } from 'react';
import { useGetAllProducts, useDeleteProduct } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';
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
    active: products.filter((p) => p.status === ProductStatus.active).length,
    outOfStock: products.filter((p) => p.status === ProductStatus.outOfStock).length,
    launchingSoon: products.filter((p) => p.status === ProductStatus.launchingSoon).length,
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

  const getStatusBadge = (product: Product) => {
    if (product.status === ProductStatus.outOfStock) {
      return <Badge className="bg-red-100 text-red-700 border-0 text-xs">Out of Stock</Badge>;
    }
    if (product.status === ProductStatus.launchingSoon) {
      return <Badge className="bg-purple-100 text-purple-700 border-0 text-xs font-bold">🚀 Launching Soon</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Active</Badge>;
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-admin-fg' },
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600' },
          { label: 'Launching Soon', value: stats.launchingSoon, color: 'text-purple-600' },
        ].map((s) => (
          <Card key={s.label} className="bg-admin-card border-admin-border">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-admin-muted text-xs mt-1">{s.label}</p>
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
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-admin-accent" />
            Product Catalog ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-admin-muted mx-auto mb-3 opacity-40" />
              <p className="text-admin-muted">
                {search ? 'No products match your search' : 'No products yet. Add your first product!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Product</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Category</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Price</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Stock</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Status</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id.toString()} className="border-b border-admin-border/50 hover:bg-admin-hover/30">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-admin-border flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-admin-bg border border-admin-border flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-admin-muted" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-admin-fg font-medium">{product.name}</span>
                              {product.isFeatured && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-admin-muted">{product.category}</td>
                      <td className="py-3 px-3 text-admin-fg font-medium">
                        ₹{Number(product.priceInr).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-admin-muted">{Number(product.stockQuantity)}</td>
                      <td className="py-3 px-3">{getStatusBadge(product)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingProduct(product); setShowForm(true); }}
                            className="w-8 h-8 text-admin-muted hover:text-admin-fg hover:bg-admin-hover"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(product.id)}
                            className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
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
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(undefined); }}
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
            <AlertDialogCancel className="border-admin-border text-admin-fg hover:bg-admin-hover">
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
