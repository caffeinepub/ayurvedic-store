import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate orders cache so the orders page shows the new order
    queryClient.invalidateQueries({ queryKey: ['myOrders'] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>

        <h1 className="font-serif text-4xl text-foreground mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Thank you for your order. Your Ayurvedic skincare products are on their way!
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          You will receive a confirmation shortly.
        </p>

        {/* Divider */}
        <div className="w-16 h-0.5 bg-primary/30 mx-auto mb-8 rounded-full" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate({ to: '/orders' })}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </button>
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted px-6 py-3 rounded-full font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
