import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { useCreateOrder } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CheckoutForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  orderNotes: string;
}

const emptyForm: CheckoutForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  orderNotes: '',
};

type FormErrors = Partial<Omit<CheckoutForm, 'addressLine2' | 'orderNotes'>>;

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { openCheckout } = useRazorpay();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const shippingCost = totalAmount >= 499 ? 0 : 49;
  const grandTotal = totalAmount + shippingCost;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!form.pincode.trim()) errors.pincode = 'Pincode is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToCheckout = () => {
    setShowCheckout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      await openCheckout({
        amount: grandTotal * 100,
        name: 'Nature Glow',
        description: `Order for ${items.length} item(s)`,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phoneNumber,
        },
        onSuccess: async (paymentId: string, rzpOrderId: string) => {
          try {
            const orderItems = items.map((item) => ({
              productId: item.product.id,
              quantity: BigInt(item.quantity),
              unitPrice: item.product.priceInr,
            }));

            const guestDetails = {
              fullName: form.fullName,
              email: form.email,
              phoneNumber: form.phoneNumber,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
              orderNotes: form.orderNotes.trim() || undefined,
            };

            await createOrder.mutateAsync({
              items: orderItems,
              shippingDetails: {
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
              },
              guestDetails,
              totalAmount: BigInt(grandTotal),
              razorpayOrderId: rzpOrderId || `rzp_${Date.now()}`,
              razorpayPaymentId: paymentId,
            });

            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
          } catch (err) {
            console.error('Failed to save order:', err);
          }
          clearCart();
          navigate({ to: '/payment-success' });
        },
        onDismiss: () => {
          setIsProcessing(false);
          navigate({ to: '/payment-failure' });
        },
      });
    } catch (err: any) {
      if (err?.message !== 'Payment dismissed') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h2 className="font-serif text-3xl text-foreground mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Discover our Ayurvedic skincare collection and add products to your cart.
          </p>
          <Button
            onClick={() => navigate({ to: '/shop' })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium"
          >
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => showCheckout ? setShowCheckout(false) : navigate({ to: '/shop' })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{showCheckout ? 'Back to Cart' : 'Continue Shopping'}</span>
          </button>
          <h1 className="font-serif text-3xl text-foreground">
            {showCheckout ? 'Checkout Details' : 'Your Cart'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items or Checkout Form */}
          <div className="lg:col-span-2">
            {!showCheckout ? (
              /* Cart Items */
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id.toString()}
                    className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-start"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/generated/product-ubtan.dim_600x600.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-foreground truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.product.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-primary">
                            {formatPrice(Number(item.product.priceInr) * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Checkout Form */
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-1">Customer & Delivery Details</h2>
                  <p className="text-sm text-muted-foreground">No account needed — fill in your details to complete the order.</p>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Your full name"
                        className={formErrors.fullName ? 'border-destructive' : ''}
                      />
                      {formErrors.fullName && (
                        <p className="text-destructive text-xs mt-1">{formErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="your@email.com"
                        className={formErrors.email ? 'border-destructive' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-destructive text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="phoneNumber">Phone Number <span className="text-destructive">*</span></Label>
                      <Input
                        id="phoneNumber"
                        value={form.phoneNumber}
                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className={formErrors.phoneNumber ? 'border-destructive' : ''}
                      />
                      {formErrors.phoneNumber && (
                        <p className="text-destructive text-xs mt-1">{formErrors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="addressLine1">Street Address <span className="text-destructive">*</span></Label>
                      <Input
                        id="addressLine1"
                        value={form.addressLine1}
                        onChange={(e) => updateField('addressLine1', e.target.value)}
                        placeholder="House/Flat No., Street"
                        className={formErrors.addressLine1 ? 'border-destructive' : ''}
                      />
                      {formErrors.addressLine1 && (
                        <p className="text-destructive text-xs mt-1">{formErrors.addressLine1}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="addressLine2">Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input
                        id="addressLine2"
                        value={form.addressLine2}
                        onChange={(e) => updateField('addressLine2', e.target.value)}
                        placeholder="Landmark, Area"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                        className={formErrors.city ? 'border-destructive' : ''}
                      />
                      {formErrors.city && (
                        <p className="text-destructive text-xs mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="State"
                        className={formErrors.state ? 'border-destructive' : ''}
                      />
                      {formErrors.state && (
                        <p className="text-destructive text-xs mt-1">{formErrors.state}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode <span className="text-destructive">*</span></Label>
                      <Input
                        id="pincode"
                        value={form.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        placeholder="6-digit pincode"
                        className={formErrors.pincode ? 'border-destructive' : ''}
                      />
                      {formErrors.pincode && (
                        <p className="text-destructive text-xs mt-1">{formErrors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <Label htmlFor="orderNotes">Order Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea
                    id="orderNotes"
                    value={form.orderNotes}
                    onChange={(e) => updateField('orderNotes', e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="font-serif text-xl text-foreground mb-5">Order Summary</h2>

              {/* Items summary */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product.id.toString()} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[60%]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-foreground font-medium">
                      {formatPrice(Number(item.product.priceInr) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-green-600">🎉 Free shipping on orders above ₹499!</p>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {!showCheckout ? (
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-medium"
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || createOrder.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-medium"
                >
                  {isProcessing || createOrder.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatPrice(grandTotal)}`
                  )}
                </Button>
              )}

              <button
                onClick={() => navigate({ to: '/orders' })}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Package className="w-4 h-4" />
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
