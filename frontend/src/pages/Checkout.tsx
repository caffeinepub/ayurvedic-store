import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '../context/CartContext';
import { useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { ShoppingItem } from '../backend';
import { toast } from 'sonner';

interface ShippingForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!stripeConfigured) {
      toast.error('Payment gateway not configured. Please contact support.');
      return;
    }

    try {
      const shoppingItems: ShoppingItem[] = items.map(item => ({
        productName: item.product.name,
        productDescription: item.product.description.slice(0, 100),
        quantity: BigInt(item.quantity),
        priceInCents: BigInt(Number(item.product.priceInr) * 100),
        currency: 'inr',
      }));

      const session = await createCheckoutSession.mutateAsync(shoppingItems);
      if (!session?.url) {
        throw new Error('Payment session URL missing');
      }
      clearCart();
      window.location.href = session.url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-sage/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-forest mb-2">Your cart is empty</h2>
        <p className="text-bark/60 mb-6">Add some products before checking out</p>
        <Button
          onClick={() => navigate({ to: '/shop' })}
          className="bg-forest hover:bg-forest/90 text-cream"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-forest mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping Form */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest mb-6">
              Shipping Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-bark font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 border-sage/30 focus:border-forest"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-bark font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="mt-1 border-sage/30 focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-bark font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 border-sage/30 focus:border-forest"
                />
              </div>

              <div>
                <Label htmlFor="addressLine1" className="text-bark font-medium">
                  Address Line 1 *
                </Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  required
                  className="mt-1 border-sage/30 focus:border-forest"
                />
              </div>

              <div>
                <Label htmlFor="addressLine2" className="text-bark font-medium">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  className="mt-1 border-sage/30 focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-bark font-medium">
                    City *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="mt-1 border-sage/30 focus:border-forest"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-bark font-medium">
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="mt-1 border-sage/30 focus:border-forest"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode" className="text-bark font-medium">
                    Pincode *
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    className="mt-1 border-sage/30 focus:border-forest"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createCheckoutSession.isPending}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-cream font-semibold py-3 text-base mt-4"
              >
                {createCheckoutSession.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{totalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest mb-6">Order Summary</h2>
            <div className="bg-parchment rounded-2xl p-6 space-y-4">
              {items.map(item => (
                <div
                  key={item.product.id.toString()}
                  className="flex items-center gap-3"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-serif font-semibold text-forest text-sm">
                      {item.product.name}
                    </p>
                    <p className="text-bark/60 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-terracotta text-sm">
                    ₹{(Number(item.product.priceInr) * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}

              <div className="border-t border-sage/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-semibold text-forest">Total</span>
                  <span className="font-bold text-terracotta text-xl">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {!stripeConfigured && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm">
                  ⚠️ Payment gateway is not configured. Please contact the store admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
