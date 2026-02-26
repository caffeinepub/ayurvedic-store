import { Link } from '@tanstack/react-router';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-terracotta" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest mb-3">Payment Failed</h1>
        <p className="text-bark/70 leading-relaxed mb-8">
          We couldn't process your payment. Don't worry — your cart is still saved. Please try
          again or contact us if the issue persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/checkout">
            <Button className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold px-6">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link to="/shop">
            <Button
              variant="outline"
              className="border-forest text-forest hover:bg-forest hover:text-cream font-semibold px-6"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
