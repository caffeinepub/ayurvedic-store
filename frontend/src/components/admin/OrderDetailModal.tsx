import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order } from '../../backend';
import { useUpdateFulfillmentStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const FULFILLMENT_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetailModal({ order, open, onClose }: OrderDetailModalProps) {
  const updateFulfillment = useUpdateFulfillmentStatus();

  if (!order) return null;

  const handleStatusChange = async (status: string) => {
    try {
      await updateFulfillment.mutateAsync({ orderId: order.id, status });
      toast.success('Fulfillment status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const paymentBadgeClass =
    order.paymentStatus === 'paid'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-fg font-bold">
            Order #{order.id.toString()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-admin-fg font-semibold text-sm mb-3">Customer Information</h3>
            <div className="bg-admin-bg rounded-lg p-4 space-y-1">
              <p className="text-admin-fg text-sm">
                <span className="text-admin-muted">Name: </span>
                {order.shippingDetails.fullName}
              </p>
              <p className="text-admin-fg text-sm">
                <span className="text-admin-muted">Email: </span>
                {order.shippingDetails.email}
              </p>
              <p className="text-admin-fg text-sm">
                <span className="text-admin-muted">Phone: </span>
                {order.shippingDetails.phoneNumber}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-admin-fg font-semibold text-sm mb-3">Shipping Address</h3>
            <div className="bg-admin-bg rounded-lg p-4">
              <p className="text-admin-fg text-sm">
                {order.shippingDetails.addressLine1}
                {order.shippingDetails.addressLine2 && `, ${order.shippingDetails.addressLine2}`}
              </p>
              <p className="text-admin-fg text-sm">
                {order.shippingDetails.city}, {order.shippingDetails.state} -{' '}
                {order.shippingDetails.pincode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-admin-fg font-semibold text-sm mb-3">Order Items</h3>
            <div className="bg-admin-bg rounded-lg divide-y divide-admin-border">
              {order.items.map((item, i) => (
                <div key={i} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="text-admin-fg text-sm">Product #{item.productId.toString()}</p>
                    <p className="text-admin-muted text-xs">Qty: {item.quantity.toString()}</p>
                  </div>
                  <p className="text-admin-fg text-sm font-medium">
                    ₹{(Number(item.unitPrice) * Number(item.quantity)).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              <div className="p-3 flex justify-between items-center">
                <p className="text-admin-fg font-semibold text-sm">Total</p>
                <p className="text-admin-accent font-bold">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-admin-fg font-semibold text-sm mb-2">Payment Status</h3>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${paymentBadgeClass}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <h3 className="text-admin-fg font-semibold text-sm mb-2">Fulfillment Status</h3>
              <Select
                value={order.fulfillmentStatus}
                onValueChange={handleStatusChange}
                disabled={updateFulfillment.isPending}
              >
                <SelectTrigger className="bg-admin-bg border-admin-border text-admin-fg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  {FULFILLMENT_STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="text-admin-fg">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
