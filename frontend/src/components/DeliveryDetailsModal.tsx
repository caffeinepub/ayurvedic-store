import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Phone, User } from 'lucide-react';

export interface DeliveryFormData {
  fullName: string;
  address: string;
  phoneNumber: string;
}

interface DeliveryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryFormData) => void;
  isLoading?: boolean;
  productName?: string;
}

const INITIAL_FORM: DeliveryFormData = {
  fullName: '',
  address: '',
  phoneNumber: '',
};

export default function DeliveryDetailsModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  productName,
}: DeliveryDetailsModalProps) {
  const [form, setForm] = useState<DeliveryFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<DeliveryFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<DeliveryFormData> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phoneNumber.trim() || !/^\d{10}$/.test(form.phoneNumber.replace(/[\s\-]/g, '')))
      newErrors.phoneNumber = 'Valid 10-digit phone number is required';
    if (!form.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const updateField = (field: keyof DeliveryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    if (!isLoading) {
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-cream border-forest/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-forest flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            Delivery Details
          </DialogTitle>
          <DialogDescription className="text-forest/60 text-sm">
            {productName
              ? `Please provide your delivery details for "${productName}"`
              : 'Please provide your delivery details to proceed with payment'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="delivery-name" className="text-forest/80 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="delivery-name"
              type="text"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`border-forest/20 focus:ring-forest/30 text-forest bg-white ${
                errors.fullName ? 'border-red-400 focus:ring-red-300' : ''
              }`}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="delivery-phone" className="text-forest/80 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="delivery-phone"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              placeholder="10-digit mobile number"
              className={`border-forest/20 focus:ring-forest/30 text-forest bg-white ${
                errors.phoneNumber ? 'border-red-400 focus:ring-red-300' : ''
              }`}
              disabled={isLoading}
              maxLength={10}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <Label htmlFor="delivery-address" className="text-forest/80 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Delivery Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="delivery-address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="House/Flat no., Street, Area, City, State, Pincode"
              className={`border-forest/20 focus:ring-forest/30 text-forest bg-white resize-none ${
                errors.address ? 'border-red-400 focus:ring-red-300' : ''
              }`}
              rows={3}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-forest/20 text-forest hover:bg-forest/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gold hover:bg-gold/90 text-forest font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
