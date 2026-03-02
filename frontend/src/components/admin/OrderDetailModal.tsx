import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MapPin, Phone, Package, User, Hash } from 'lucide-react';
import { useUpdateFulfillmentStatus } from '../../hooks/useQueries';
import type { Order } from '../../backend';
import { toast } from 'sonner';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const FULFILLMENT_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const updateFulfillment = useUpdateFulfillmentStatus();
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);

  const handleFulfillmentChange = async (newStatus: string) => {
    setFulfillmentStatus(newStatus);
    try {
      await updateFulfillment.mutateAsync({ orderId: order.id, status: newStatus });
      toast.success(`Fulfillment status updated to "${newStatus}"`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update status');
      setFulfillmentStatus(order.fulfillmentStatus);
    }
  };

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Use guestDeliveryInfo if available, otherwise fall back to deliveryInfo
  const gdi = order.guestDeliveryInfo;
  const di = order.deliveryInfo;

  const displayName = gdi?.fullName || di?.fullName || 'Not provided';
  const displayPhone = gdi?.phoneNumber || di?.phoneNumber || 'Not provided';
  const displayAddress = gdi?.address || di?.address || 'Not provided';

  const isGuest = order.customerId.toString() === '2vxsx-fae';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-fg flex items-center gap-2">
            <Hash className="w-4 h-4 text-admin-muted" />
            Order #{order.id.toString()}
            {isGuest && (
              <Badge className="bg-slate-100 text-slate-600 border-0 text-xs ml-1">Guest</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700 border-0'
                    : 'bg-amber-100 text-amber-700 border-0'
                }
              >
                Payment: {order.paymentStatus}
              </Badge>
              <span className="text-admin-muted text-xs">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {updateFulfillment.isPending && <Loader2 className="w-4 h-4 animate-spin text-admin-accent" />}
              <Select value={fulfillmentStatus} onValueChange={handleFulfillmentChange} disabled={updateFulfillment.isPending}>
                <SelectTrigger className="w-40 bg-admin-bg border-admin-border text-admin-fg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-admin-border" />

          {/* Delivery Information */}
          <div>
            <h4 className="text-admin-fg font-semibold text-sm mb-3">Delivery Information</h4>
            <div className="space-y-2.5 text-sm bg-admin-bg rounded-lg px-3 py-3">
              <div className="flex items-center gap-2 text-admin-fg">
                <User className="w-4 h-4 text-admin-muted flex-shrink-0" />
                <span className="text-admin-muted text-xs w-16">Name:</span>
                <span className="font-medium">{displayName}</span>
              </div>
              <div className="flex items-center gap-2 text-admin-fg">
                <Phone className="w-4 h-4 text-admin-muted flex-shrink-0" />
                <span className="text-admin-muted text-xs w-16">Phone:</span>
                <span className="font-medium">{displayPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-admin-fg">
                <MapPin className="w-4 h-4 text-admin-muted flex-shrink-0 mt-0.5" />
                <span className="text-admin-muted text-xs w-16">Address:</span>
                <span className="leading-relaxed">{displayAddress}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-admin-border" />

          {/* Order Items */}
          <div>
            <h4 className="text-admin-fg font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-admin-muted" />
              Items Ordered
            </h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-admin-bg rounded-lg px-3 py-2">
                  <div className="text-admin-fg">
                    <span className="font-medium">Product #{item.productId.toString()}</span>
                    <span className="text-admin-muted ml-2">× {item.quantity.toString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-admin-muted text-xs mr-2">
                      ₹{Number(item.unitPrice).toLocaleString('en-IN')} each
                    </span>
                    <span className="text-admin-fg font-medium">
                      {formatCurrency(Number(item.unitPrice) * Number(item.quantity))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-admin-border" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-admin-fg font-semibold">Total Amount</span>
            <span className="text-admin-fg font-bold text-lg">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </div>

          {/* Razorpay IDs */}
          {(order.razorpayOrderId || order.razorpayPaymentId) && (
            <>
              <Separator className="bg-admin-border" />
              <div className="space-y-1 text-xs text-admin-muted">
                {order.razorpayOrderId && (
                  <p>Razorpay Order: <span className="font-mono">{order.razorpayOrderId}</span></p>
                )}
                {order.razorpayPaymentId && (
                  <p>Razorpay Payment: <span className="font-mono">{order.razorpayPaymentId}</span></p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
