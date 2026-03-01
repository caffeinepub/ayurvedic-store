import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../context/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (paymentId: string, orderId: string) => void;
  onDismiss?: () => void;
}

export function useRazorpay() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const queryClient = useQueryClient();

  const openCheckout = useCallback(
    async (options: RazorpayOptions) => {
      if (!actor) throw new Error('Actor not available');

      const keyId = await actor.getRazorpayKeyId();
      if (!keyId) throw new Error('Razorpay key not configured');

      return new Promise<{ paymentId: string; orderId: string }>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name || 'Nature Glow',
          description: options.description || 'Purchase',
          order_id: options.orderId,
          prefill: options.prefill || {},
          theme: { color: '#8B6914' },
          handler: async (response: any) => {
            const paymentId: string = response.razorpay_payment_id || '';
            const rzpOrderId: string = response.razorpay_order_id || options.orderId || '';

            // Invalidate orders cache so the orders page refreshes
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });

            clearCart();

            if (options.onSuccess) {
              options.onSuccess(paymentId, rzpOrderId);
            } else {
              navigate({ to: '/payment-success' });
            }

            resolve({ paymentId, orderId: rzpOrderId });
          },
          modal: {
            ondismiss: () => {
              if (options.onDismiss) {
                options.onDismiss();
              } else {
                navigate({ to: '/payment-failure' });
              }
              reject(new Error('Payment dismissed'));
            },
          },
        });

        rzp.open();
      });
    },
    [actor, navigate, clearCart, queryClient]
  );

  return { openCheckout };
}
