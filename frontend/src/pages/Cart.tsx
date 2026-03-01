import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useGetRazorpayKeyId } from '../hooks/useQueries';
import { useRazorpay } from '../hooks/useRazorpay';
import { OrderInput } from '../backend';
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

const INITIAL_FORM: CheckoutForm = {
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

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { openCheckout, isCreatingOrder } = useRazorpay();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Valid email is required';
    if (!form.phoneNumber.trim() || !/^\d{10}$/.test(form.phoneNumber.replace(/\s/g, '')))
      newErrors.phoneNumber = 'Valid 10-digit phone number is required';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      newErrors.pincode = 'Valid 6-digit pincode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm() || !razorpayKeyId) return;
    setIsProcessing(true);
    try {
      const shippingDetails = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      const orderInput: OrderInput = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: BigInt(item.quantity),
          unitPrice: item.priceInr,
        })),
        shippingDetails,
        guestDetails: {
          ...shippingDetails,
          orderNotes: form.orderNotes || undefined,
        },
        totalAmount: totalPrice,
        razorpayOrderId: `order_${Date.now()}`,
        razorpayPaymentId: '',
      };

      await openCheckout({
        keyId: razorpayKeyId,
        amount: Number(totalPrice) * 100,
        name: 'Nature Glow',
        description: `Order of ${items.length} item(s)`,
        orderInput,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phoneNumber,
        },
        onSuccess: () => {
          clearCart();
          navigate({ to: '/payment-success' });
        },
        onFailure: () => {
          navigate({ to: '/payment-failure' });
        },
      });
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-forest/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-forest mb-2">Your cart is empty</h2>
          <p className="text-forest/60 mb-6">Add some products to get started!</p>
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="px-6 py-3 bg-forest text-cream rounded-full hover:bg-forest-dark transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => step === 'checkout' ? setStep('cart') : navigate({ to: '/shop' })}
            className="flex items-center gap-2 text-forest/60 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'checkout' ? 'Back to Cart' : 'Continue Shopping'}
          </button>
          <h1 className="font-serif text-3xl text-forest">
            {step === 'cart' ? 'Your Cart' : 'Checkout'}
          </h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'cart' ? 'text-forest' : 'text-forest/40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'cart' ? 'bg-forest text-cream' : 'bg-forest/20 text-forest/60'}`}>1</div>
            Cart
          </div>
          <div className="flex-1 h-px bg-forest/20" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'checkout' ? 'text-forest' : 'text-forest/40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'checkout' ? 'bg-forest text-cream' : 'bg-forest/20 text-forest/60'}`}>2</div>
            Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId.toString()} className="bg-white rounded-2xl p-4 flex gap-4 border border-forest/10">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-sage/20 flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-forest/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-forest font-medium">{item.name}</h3>
                      <p className="text-forest/60 text-sm">₹{item.priceInr.toString()} each</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 border border-forest/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 hover:bg-forest/10 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-forest" />
                          </button>
                          <span className="px-3 py-1 text-forest text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 hover:bg-forest/10 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-forest" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-forest">
                        ₹{(item.priceInr * BigInt(item.quantity)).toString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Checkout Form */
              <div className="bg-white rounded-2xl p-6 border border-forest/10">
                <h2 className="font-serif text-xl text-forest mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-forest/70 text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="Your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-forest/70 text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-forest/70 text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="block text-forest/70 text-sm font-medium mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={form.addressLine1}
                      onChange={(e) => updateField('addressLine1', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.addressLine1 ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="House/Flat no., Street name"
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block text-forest/70 text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={form.addressLine2}
                      onChange={(e) => updateField('addressLine2', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-forest/20 focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest"
                      placeholder="Landmark, Area"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-forest/70 text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-forest/70 text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="State"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-forest/70 text-sm font-medium mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => updateField('pincode', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.pincode ? 'border-red-400' : 'border-forest/20'} focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>

                  {/* Order Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-forest/70 text-sm font-medium mb-1">Order Notes (Optional)</label>
                    <textarea
                      value={form.orderNotes}
                      onChange={(e) => updateField('orderNotes', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-forest/20 focus:outline-none focus:ring-2 focus:ring-forest/30 text-forest resize-none"
                      placeholder="Any special instructions..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-forest/10 sticky top-24">
              <h2 className="font-serif text-xl text-forest mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId.toString()} className="flex justify-between text-sm">
                    <span className="text-forest/70 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                    <span className="text-forest font-medium">₹{(item.priceInr * BigInt(item.quantity)).toString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-forest/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-forest">Total</span>
                  <span className="font-bold text-forest text-xl">₹{totalPrice.toString()}</span>
                </div>
                <p className="text-forest/40 text-xs mt-1">Inclusive of all taxes</p>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 bg-forest hover:bg-forest-dark text-cream font-semibold rounded-xl transition-colors"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || isCreatingOrder || !razorpayKeyId}
                  className="w-full py-3.5 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing || isCreatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              )}

              {!razorpayKeyId && step === 'checkout' && (
                <p className="text-red-500 text-xs mt-2 text-center">
                  Payment gateway not configured. Please contact support.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
