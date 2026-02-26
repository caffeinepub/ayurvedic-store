import { useState, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Upload, Wand2, X } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useQueries';
import { ProductStatus } from '../../backend';
import type { Product } from '../../backend';
import { toast } from 'sonner';
import AIImageGenerator from './AIImageGenerator';

interface ProductFormModalProps {
  product?: Product;
  onClose: () => void;
}

interface SpecEntry {
  key: string;
  value: string;
}

export default function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [priceInr, setPriceInr] = useState(product ? Number(product.priceInr).toString() : '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [stockQuantity, setStockQuantity] = useState(product ? Number(product.stockQuantity).toString() : '0');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? ProductStatus.active
  );
  const [specs, setSpecs] = useState<SpecEntry[]>(
    product?.specifications?.map((s) => ({ key: s.key, value: s.value })) ?? []
  );
  const [showAI, setShowAI] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const isEditing = !!product;
  const isLoading = createProduct.isPending || updateProduct.isPending;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImageUrl(url);
      setImagePreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const addSpec = () => setSpecs((prev) => [...prev, { key: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceInr || !category.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productInput = {
      name: name.trim(),
      description: description.trim(),
      priceInr: BigInt(Math.round(Number(priceInr))),
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      stockQuantity: BigInt(Math.max(0, Math.round(Number(stockQuantity)))),
      isFeatured,
      status,
      specifications: specs.filter((s) => s.key.trim() && s.value.trim()),
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, productInput });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync(productInput);
        toast.success('Product created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save product');
    }
  };

  const statusOptions = [
    { value: ProductStatus.active, label: 'Active' },
    { value: ProductStatus.outOfStock, label: 'Out of Stock' },
    { value: ProductStatus.launchingSoon, label: 'Launching Soon' },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-fg">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-admin-fg">Product Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ubtan Face Pack"
              className="bg-admin-bg border-admin-border text-admin-fg"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-admin-fg">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
              rows={3}
              className="bg-admin-bg border-admin-border text-admin-fg resize-none"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-admin-fg">Price (INR) *</Label>
              <Input
                type="number"
                min="0"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                placeholder="299"
                className="bg-admin-bg border-admin-border text-admin-fg"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-admin-fg">Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="100"
                className="bg-admin-bg border-admin-border text-admin-fg"
              />
            </div>
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-admin-fg">Category *</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Face Care"
                className="bg-admin-bg border-admin-border text-admin-fg"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-admin-fg">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                <SelectTrigger className="bg-admin-bg border-admin-border text-admin-fg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-2">
            <Label className="text-admin-fg">Product Image</Label>

            {/* Image URL input */}
            <Input
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImagePreviewError(false); }}
              placeholder="https://... or upload below"
              className="bg-admin-bg border-admin-border text-admin-fg"
            />

            {/* Upload + AI buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-admin-border text-admin-fg hover:bg-admin-hover"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAI((v) => !v)}
                className={`border-admin-border hover:bg-admin-hover ${showAI ? 'bg-admin-accent/10 text-admin-accent border-admin-accent' : 'text-admin-fg'}`}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Image preview */}
            {imageUrl && !imagePreviewError && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-admin-border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreviewError(true)}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* AI Generator */}
            {showAI && (
              <AIImageGenerator
                onUseImage={(url) => {
                  setImageUrl(url);
                  setImagePreviewError(false);
                  setShowAI(false);
                }}
              />
            )}
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="featured"
              checked={isFeatured}
              onCheckedChange={(v) => setIsFeatured(!!v)}
            />
            <Label htmlFor="featured" className="text-admin-fg cursor-pointer">
              Mark as Featured Product
            </Label>
          </div>

          {/* Status badges preview */}
          <div className="flex gap-2 flex-wrap">
            {isFeatured && (
              <Badge className="bg-amber-100 text-amber-700 border-0">⭐ Featured</Badge>
            )}
            {status === ProductStatus.outOfStock && (
              <Badge className="bg-red-100 text-red-700 border-0">Out of Stock</Badge>
            )}
            {status === ProductStatus.launchingSoon && (
              <Badge className="bg-purple-100 text-purple-700 border-0 font-bold">🚀 Launching Soon</Badge>
            )}
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-admin-fg">Specifications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpec}
                className="border-admin-border text-admin-fg hover:bg-admin-hover"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Key (e.g. Weight)"
                  value={spec.key}
                  onChange={(e) => updateSpec(i, 'key', e.target.value)}
                  className="bg-admin-bg border-admin-border text-admin-fg text-sm"
                />
                <Input
                  placeholder="Value (e.g. 100g)"
                  value={spec.value}
                  onChange={(e) => updateSpec(i, 'value', e.target.value)}
                  className="bg-admin-bg border-admin-border text-admin-fg text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpec(i)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-admin-border text-admin-fg hover:bg-admin-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-admin-accent hover:bg-admin-accent/90 text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
