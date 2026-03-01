import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../context/CartContext';
import { isMobileDevice } from '../utils/deviceDetection';

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

/**
 * Builds device-aware Razorpay display configuration.
 *
 * Desktop: Prioritises Cards → Net Banking → UPI QR code.
 *          UPI collect/intent (push request to phone) is excluded to avoid friction.
 *
 * Mobile:  Keeps the default Razorpay flow which surfaces UPI intent apps
 *          (Google Pay, Paytm, PhonePe), cards, and wallets natively.
 */
function buildRazorpayConfig(mobile: boolean) {
  if (mobile) {
    // Mobile: let Razorpay use its default ordering which surfaces UPI intent apps first
    return {
      config: {
        display: {
          blocks: {
            utib: {
              name: 'Pay via UPI',
              instruments: [
                { method: 'upi', flows: ['intent', 'collect', 'qr'] },
              ],
            },
            other: {
              name: 'Other Payment Methods',
              instruments: [
                { method: 'card' },
                { method: 'wallet' },
                { method: 'netbanking' },
              ],
            },
          },
          sequence: ['block.utib', 'block.other'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
    };
  }

  // Desktop: Cards first, then Net Banking, then UPI QR only (no collect/intent)
  return {
    config: {
      display: {
        blocks: {
          card: {
            name: 'Pay via Card',
            instruments: [{ method: 'card' }],
          },
          netbanking: {
            name: 'Net Banking',
            instruments: [{ method: 'netbanking' }],
          },
          upi_qr: {
            name: 'UPI QR Code',
            instruments: [
              {
                method: 'upi',
                flows: ['qr'],
              },
            ],
          },
          wallet: {
            name: 'Wallets',
            instruments: [{ method: 'wallet' }],
          },
        },
        sequence: ['block.card', 'block.netbanking', 'block.upi_qr', 'block.wallet'],
        preferences: {
          show_default_blocks: false,
        },
      },
    },
  };
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

      const mobile = isMobileDevice();
      const deviceConfig = buildRazorpayConfig(mobile);

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

          // Device-aware payment method configuration
          ...deviceConfig,

          modal: {
            // Prevent accidental dismissal with a confirmation prompt
            confirm_close: true,
            // Allow closing by clicking the backdrop
            backdropclose: false,
            // Smooth animation
            animation: true,
            ondismiss: () => {
              if (options.onDismiss) {
                options.onDismiss();
              } else {
                navigate({ to: '/payment-failure' });
              }
              reject(new Error('Payment dismissed'));
            },
          },

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
        });

        rzp.open();
      });
    },
    [actor, navigate, clearCart, queryClient]
  );

  return { openCheckout };
}
