import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from '@tanstack/react-router';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate({ to: '/cart' });
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-cream">
        <SheetHeader>
          <SheetTitle className="font-serif text-forest text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="w-16 h-16 text-sage/40" />
            <p className="text-bark/60 font-medium">Your cart is empty</p>
            <Button
              variant="outline"
              onClick={closeCart}
              className="border-forest text-forest hover:bg-forest hover:text-cream"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map(item => (
                <div
                  key={item.product.id.toString()}
                  className="flex gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-forest text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-terracotta font-bold text-sm mt-0.5">
                      ₹{Number(item.product.priceInr).toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full border border-sage flex items-center justify-center hover:bg-sage/20 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-bark" />
                      </button>
                      <span className="text-sm font-medium text-bark w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-full border border-sage flex items-center justify-center hover:bg-sage/20 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-bark" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-bark/40 hover:text-terracotta transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-sage/20 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-serif text-forest font-semibold">Total</span>
                <span className="font-bold text-terracotta text-lg">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-cream font-semibold py-3"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
