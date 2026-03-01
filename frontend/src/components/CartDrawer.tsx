import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const handleCheckout = () => {
    closeCart();
    navigate({ to: '/cart' });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-cream">
        <SheetHeader className="border-b border-forest/10 pb-4">
          <SheetTitle className="font-serif text-forest flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-12 h-12 text-forest/20 mb-3" />
              <p className="text-forest/50 font-medium">Your cart is empty</p>
              <p className="text-forest/30 text-sm mt-1">Add some products to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId.toString()}
                className="flex gap-3 bg-white rounded-xl p-3 border border-forest/10"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-sage/20 shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-forest/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-forest text-sm truncate">{item.name}</h4>
                  <p className="text-forest/60 text-xs">₹{item.priceInr.toString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 border border-forest/20 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-forest/10 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-forest" />
                      </button>
                      <span className="px-2 text-forest text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-forest/10 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-forest" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-forest text-sm">
                    ₹{(item.priceInr * BigInt(item.quantity)).toString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-forest/10 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-serif text-forest font-semibold">Total</span>
              <span className="font-bold text-forest text-xl">₹{totalPrice.toString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-forest hover:bg-forest/90 text-cream font-semibold rounded-xl transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
