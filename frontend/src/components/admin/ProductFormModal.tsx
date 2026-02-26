import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Product, ProductInput, ProductStatus } from '../../backend';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface SpecEntry {
  key: string;
  value: string;
}

const defaultForm = {
  name: '',
  description: '',
  priceInr: '',
  imageUrl: '',
  category: '',
  stockQuantity: '',
  isFeatured: false,
  status: ProductStatus.active as ProductStatus,
};

export default function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [specs, setSpecs] = useState<SpecEntry[]>([]);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        priceInr: product.priceInr.toString(),
        imageUrl: product.imageUrl,
        category: product.category,
        stockQuantity: product.stockQuantity.toString(),
        isFeatured: product.isFeatured,
        status: product.status as ProductStatus,
      });
      setSpecs(product.specifications.map(s => ({ key: s.key, value: s.value })));
    } else {
      setForm(defaultForm);
      setSpecs([]);
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: ProductInput = {
      name: form.name,
      description: form.description,
      priceInr: BigInt(form.priceInr || '0'),
      imageUrl: form.imageUrl,
      category: form.category,
      stockQuantity: BigInt(form.stockQuantity || '0'),
      isFeatured: form.isFeatured,
      status: form.status,
      specifications: specs.filter(s => s.key.trim()),
    };

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, input });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync(input);
        toast.success('Product created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-fg font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-admin-fg text-sm">Product Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
              />
            </div>
            <div>
              <Label className="text-admin-fg text-sm">Category *</Label>
              <Input
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                required
                placeholder="e.g. Face Pack, Powder"
                className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
              />
            </div>
          </div>

          <div>
            <Label className="text-admin-fg text-sm">Description *</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={3}
              className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-admin-fg text-sm">Price (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={form.priceInr}
                onChange={e => setForm(p => ({ ...p, priceInr: e.target.value }))}
                required
                className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
              />
            </div>
            <div>
              <Label className="text-admin-fg text-sm">Stock Quantity *</Label>
              <Input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))}
                required
                className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
              />
            </div>
          </div>

          <div>
            <Label className="text-admin-fg text-sm">Image URL *</Label>
            <Input
              value={form.imageUrl}
              onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              required
              placeholder="https://... or /assets/..."
              className="mt-1 bg-admin-bg border-admin-border text-admin-fg"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="mt-2 w-20 h-20 object-cover rounded-lg border border-admin-border"
              />
            )}
          </div>

          <div>
            <Label className="text-admin-fg text-sm">Status *</Label>
            <Select
              value={form.status}
              onValueChange={v => setForm(p => ({ ...p, status: v as ProductStatus }))}
            >
              <SelectTrigger className="mt-1 bg-admin-bg border-admin-border text-admin-fg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-admin-card border-admin-border">
                <SelectItem value={ProductStatus.active} className="text-admin-fg">
                  Active
                </SelectItem>
                <SelectItem value={ProductStatus.outOfStock} className="text-admin-fg">
                  Out of Stock
                </SelectItem>
                <SelectItem value={ProductStatus.launchingSoon} className="text-admin-fg">
                  Launching Soon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={form.isFeatured}
              onCheckedChange={v => setForm(p => ({ ...p, isFeatured: !!v }))}
            />
            <Label htmlFor="featured" className="text-admin-fg text-sm cursor-pointer">
              Featured Product (shown on homepage)
            </Label>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-admin-fg text-sm">Specifications</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSpecs(p => [...p, { key: '', value: '' }])}
                className="border-admin-border text-admin-fg hover:bg-admin-hover text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g. Weight)"
                    value={spec.key}
                    onChange={e => {
                      const updated = [...specs];
                      updated[i] = { ...updated[i], key: e.target.value };
                      setSpecs(updated);
                    }}
                    className="bg-admin-bg border-admin-border text-admin-fg text-sm"
                  />
                  <Input
                    placeholder="Value (e.g. 100g)"
                    value={spec.value}
                    onChange={e => {
                      const updated = [...specs];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setSpecs(updated);
                    }}
                    className="bg-admin-bg border-admin-border text-admin-fg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs(p => p.filter((_, idx) => idx !== i))}
                    className="text-admin-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-admin-border text-admin-fg hover:bg-admin-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-admin-accent hover:bg-admin-accent/90 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
