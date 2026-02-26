import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Star, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { useGetAllProducts, useDeleteProduct } from '../../hooks/useQueries';
import { Product, ProductStatus } from '../../backend';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: products, isLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!search.trim()) return products;
    return products.filter(
      p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, active: 0, outOfStock: 0, featured: 0 };
    return {
      total: products.length,
      active: products.filter(p => p.status === ProductStatus.active).length,
      outOfStock: products.filter(p => p.status === ProductStatus.outOfStock).length,
      featured: products.filter(p => p.isFeatured).length,
    };
  }, [products]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const statusBadge = (status: ProductStatus) => {
    if (status === ProductStatus.active)
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>;
    if (status === ProductStatus.outOfStock)
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Out of Stock</Badge>;
    return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Launching Soon</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, color: 'text-admin-fg' },
          { label: 'Active', value: stats.active, color: 'text-green-400' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-400' },
          { label: 'Featured', value: stats.featured, color: 'text-yellow-400' },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-admin-card border border-admin-border rounded-xl p-4"
          >
            <p className="text-admin-muted text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-admin-bg border-admin-border text-admin-fg"
          />
        </div>
        <Button
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
          className="bg-admin-accent hover:bg-admin-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full bg-admin-bg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-admin-muted mx-auto mb-3" />
            <p className="text-admin-muted">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 text-admin-muted text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">
                    Stock
                  </th>
                  <th className="text-left p-4 text-admin-muted text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right p-4 text-admin-muted text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filtered.map(product => (
                  <tr key={product.id.toString()} className="hover:bg-admin-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-admin-border"
                        />
                        <div>
                          <p className="text-admin-fg text-sm font-medium">{product.name}</p>
                          {product.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-admin-muted text-sm">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-admin-fg text-sm font-medium">
                        ₹{Number(product.priceInr).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-admin-muted text-sm">
                        {product.stockQuantity.toString()}
                      </span>
                    </td>
                    <td className="p-4">{statusBadge(product.status as ProductStatus)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-admin-muted hover:text-admin-accent transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-1.5 text-admin-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
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
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
