import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from './useQueries';
import { OrderInput } from '../backend';
import { isMobileDevice } from '../utils/deviceDetection';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  keyId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  orderInput: OrderInput;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: () => void;
  onFailure?: () => void;
}

export function useRazorpay() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const openCheckout = useCallback(
    async (options: RazorpayOptions) => {
      if (!window.Razorpay) {
        console.error('Razorpay SDK not loaded');
        navigate({ to: '/payment-failure' });
        return;
      }

      const isMobile = isMobileDevice();

      // Payment method configuration — UPI is enabled on both mobile and desktop
      const paymentConfig = isMobile
        ? {
            method: {
              upi: true,
              card: true,
              wallet: true,
              netbanking: true,
            },
            upi: {
              flow: 'intent',
            },
          }
        : {
            method: {
              upi: true,
              card: true,
              wallet: true,
              netbanking: true,
            },
            upi: {
              flow: 'collect',
              collect: true,
              intent: true,
              qr: true,
            },
          };

      const razorpayOptions = {
        key: options.keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Nature Glow',
        description: options.description || 'Ayurvedic Skincare Products',
        image: '/assets/generated/logo-mark.dim_200x200.png',
        ...paymentConfig,
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.contact || '',
        },
        theme: {
          color: '#5C7A4E',
          backdrop_color: 'rgba(0,0,0,0.7)',
        },
        modal: {
          ondismiss: () => {
            if (options.onFailure) {
              options.onFailure();
            } else {
              navigate({ to: '/payment-failure' });
            }
          },
          confirm_close: true,
          animation: true,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            const orderInput: OrderInput = {
              ...options.orderInput,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id || options.orderInput.razorpayOrderId || `order_${Date.now()}`,
            };
            await createOrder.mutateAsync(orderInput);
            if (options.onSuccess) {
              options.onSuccess();
            } else {
              navigate({ to: '/payment-success' });
            }
          } catch (err) {
            console.error('Failed to create order after payment:', err);
            navigate({ to: '/payment-success' }); // Payment succeeded even if order creation had issues
          }
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        if (options.onFailure) {
          options.onFailure();
        } else {
          navigate({ to: '/payment-failure' });
        }
      });
      rzp.open();
    },
    [navigate, createOrder]
  );

  return { openCheckout, isCreatingOrder: createOrder.isPending };
}
