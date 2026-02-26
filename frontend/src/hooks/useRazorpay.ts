import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetRazorpayKeyId } from './useQueries';
import { useCart } from '../context/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutOptions {
  productName: string;
  amountInr: number; // in INR (will be converted to paise)
  storeName?: string;
  description?: string;
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const openCheckout = useCallback(
    async (options: RazorpayCheckoutOptions) => {
      if (!razorpayKeyId) {
        alert('Payment gateway is not configured. Please contact the store admin.');
        return;
      }

      if (!window.Razorpay) {
        alert('Payment gateway failed to load. Please refresh the page and try again.');
        return;
      }

      setIsLoading(true);

      try {
        const amountInPaise = Math.round(options.amountInr * 100);

        const rzpOptions = {
          key: razorpayKeyId,
          amount: amountInPaise,
          currency: 'INR',
          name: options.storeName || 'Nature Glow',
          description: options.description || options.productName,
          image: '/assets/generated/logo-mark.dim_200x200.png',
          handler: function () {
            clearCart();
            navigate({ to: '/payment-success' });
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              navigate({ to: '/payment-failure' });
            },
          },
          prefill: {},
          theme: {
            color: '#2D5016',
          },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', function () {
          setIsLoading(false);
          navigate({ to: '/payment-failure' });
        });
        rzp.open();
      } catch (err) {
        setIsLoading(false);
        console.error('Razorpay error:', err);
        navigate({ to: '/payment-failure' });
      }
    },
    [razorpayKeyId, clearCart, navigate]
  );

  return { openCheckout, isLoading, isConfigured: !!razorpayKeyId };
}
