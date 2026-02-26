import { Link } from '@tanstack/react-router';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-forest" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest mb-3">
          Order Confirmed! 🌿
        </h1>
        <p className="text-bark/70 leading-relaxed mb-8">
          Thank you for your purchase! Your Ayurvedic skincare products are on their way. You'll
          receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop">
            <Button className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold px-6">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/">
            <Button
              variant="outline"
              className="border-forest text-forest hover:bg-forest hover:text-cream font-semibold px-6"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
