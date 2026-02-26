import { Link, useNavigate } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useRazorpay } from '../hooks/useRazorpay';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart();
  const navigate = useNavigate();
  const { openCheckout, isLoading, isConfigured } = useRazorpay();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const description = items.map(i => `${i.product.name} x${i.quantity}`).join(', ');
    await openCheckout({
      productName: description,
      amountInr: totalAmount,
      storeName: 'Nature Glow',
      description: `Order: ${description}`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-forest/40" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest mb-3">Your Cart is Empty</h1>
          <p className="text-bark/60 leading-relaxed mb-8">
            Looks like you haven't added any products yet. Explore our Ayurvedic collection!
          </p>
          <Link to="/shop">
            <Button className="bg-forest hover:bg-forest/90 text-cream font-semibold px-8 py-3 text-base shadow-botanical">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-parchment min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="flex items-center gap-2 text-bark/60 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Continue Shopping</span>
          </button>
          <div className="h-4 w-px bg-sage/30" />
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-forest">
            Shopping Cart
            <span className="ml-2 text-lg font-normal text-bark/50">({totalItems} items)</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.product.id.toString()}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-botanical flex gap-4 items-start"
              >
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-parchment flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-sage font-medium uppercase tracking-wider mb-0.5">
                    {item.product.category}
                  </p>
                  <h3 className="font-serif font-semibold text-forest text-base leading-snug mb-1 line-clamp-2">
                    {item.product.name}
                  </h3>
                  <p className="text-golden font-bold text-base mb-3">
                    ₹{Number(item.product.priceInr).toLocaleString('en-IN')}
                    <span className="text-bark/40 text-xs font-normal ml-1">/ unit</span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-sage/40 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-parchment hover:bg-sage/20 transition-colors text-bark"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-forest">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-parchment hover:bg-sage/20 transition-colors text-bark"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 text-bark/30 hover:text-terracotta transition-colors rounded-lg hover:bg-terracotta/10"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Line Subtotal */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-terracotta text-lg">
                    ₹{(Number(item.product.priceInr) * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-botanical sticky top-24">
              <h2 className="font-serif text-xl font-bold text-forest mb-5">Order Summary</h2>

              {/* Items breakdown */}
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product.id.toString()} className="flex justify-between text-sm">
                    <span className="text-bark/70 line-clamp-1 flex-1 mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-bark font-medium flex-shrink-0">
                      ₹{(Number(item.product.priceInr) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-sage/20 pt-4 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-bark/60 text-sm">Subtotal</span>
                  <span className="text-bark font-medium">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-bark/60 text-sm">Shipping</span>
                  <span className="text-forest text-sm font-medium">
                    {totalAmount >= 499 ? 'FREE' : '₹49'}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-sage/20 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-forest text-lg">Total</span>
                  <span className="font-bold text-golden text-2xl">
                    ₹{(totalAmount >= 499 ? totalAmount : totalAmount + 49).toLocaleString('en-IN')}
                  </span>
                </div>
                {totalAmount < 499 && (
                  <p className="text-xs text-sage mt-1">
                    Add ₹{(499 - totalAmount).toLocaleString('en-IN')} more for free shipping!
                  </p>
                )}
              </div>

              {!isConfigured && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-xs">
                    ⚠️ Payment gateway not configured. Contact the store admin.
                  </p>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={isLoading || !isConfigured}
                className="w-full bg-forest hover:bg-forest/90 text-cream font-semibold py-3 text-base shadow-botanical-lg rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>

              {/* Trust badges */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-bark/50">
                  <Shield className="w-3.5 h-3.5 text-forest/60" />
                  <span>Secure payment via Razorpay</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-bark/50">
                  <Truck className="w-3.5 h-3.5 text-forest/60" />
                  <span>Free shipping on orders above ₹499</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-bark/50">
                  <RefreshCw className="w-3.5 h-3.5 text-forest/60" />
                  <span>Easy 7-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
