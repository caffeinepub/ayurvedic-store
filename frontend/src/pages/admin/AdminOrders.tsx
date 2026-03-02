import { useState, useMemo } from 'react';
import { useGetOrders, useUpdateFulfillmentStatus } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  User,
  Package,
  StickyNote,
  Loader2,
} from 'lucide-react';
import type { Order } from '../../backend';
import { toast } from 'sonner';

type SortKey = 'date' | 'total' | 'payment' | 'fulfillment';
type SortDir = 'asc' | 'desc';

const FULFILLMENT_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const updateFulfillment = useUpdateFulfillmentStatus();
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);

  const handleFulfillmentChange = async (newStatus: string) => {
    setFulfillmentStatus(newStatus);
    try {
      await updateFulfillment.mutateAsync({ orderId: order.id, status: newStatus });
      toast.success(`Order #${order.id} status updated to "${newStatus}"`);
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
    <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
      {/* Order Header Row — always visible */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-admin-hover/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Order ID */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="text-admin-muted text-xs">Order</span>
          <span className="font-mono font-bold text-admin-fg text-sm">#{order.id.toString()}</span>
          {isGuest && (
            <Badge className="bg-slate-100 text-slate-600 border-0 text-xs px-1.5 py-0">Guest</Badge>
          )}
        </div>

        {/* Customer Name */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
          <User className="w-3.5 h-3.5 text-admin-muted flex-shrink-0" />
          <span className="text-admin-fg text-sm font-medium truncate">{displayName}</span>
        </div>

        {/* Date */}
        <div className="text-admin-muted text-xs hidden sm:block min-w-[130px]">
          {formatDate(order.createdAt)}
        </div>

        {/* Amount */}
        <div className="font-semibold text-admin-fg text-sm min-w-[80px] text-right">
          {formatCurrency(Number(order.totalAmount))}
        </div>

        {/* Payment Badge */}
        <Badge
          className={
            order.paymentStatus === 'paid'
              ? 'bg-emerald-100 text-emerald-700 border-0 text-xs'
              : 'bg-amber-100 text-amber-700 border-0 text-xs'
          }
        >
          {order.paymentStatus}
        </Badge>

        {/* Fulfillment Status Dropdown */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {updateFulfillment.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-admin-accent" />}
          <Select value={fulfillmentStatus} onValueChange={handleFulfillmentChange} disabled={updateFulfillment.isPending}>
            <SelectTrigger className="h-7 text-xs w-32 bg-admin-bg border-admin-border text-admin-fg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FULFILLMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expand toggle */}
        <div className="ml-auto text-admin-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Inline Customer Details — always visible below header */}
      <div className="px-4 pb-3 border-t border-admin-border/40 bg-admin-bg/30">
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2.5">
          <div className="flex items-center gap-1.5 text-xs text-admin-muted">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{displayPhone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-admin-muted">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-xs">{displayAddress}</span>
          </div>
        </div>
      </div>

      {/* Expanded: Items + Notes */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-admin-border/60 space-y-4 pt-3">
          {/* Delivery Info Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-admin-muted" />
              <span className="text-xs font-semibold text-admin-fg uppercase tracking-wide">Delivery Information</span>
            </div>
            <div className="bg-admin-hover/20 rounded-lg px-3 py-2.5 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-admin-muted flex-shrink-0" />
                <span className="text-admin-muted text-xs">Name:</span>
                <span className="text-admin-fg font-medium">{displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-admin-muted flex-shrink-0" />
                <span className="text-admin-muted text-xs">Phone:</span>
                <span className="text-admin-fg font-medium">{displayPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-admin-muted flex-shrink-0 mt-0.5" />
                <span className="text-admin-muted text-xs">Address:</span>
                <span className="text-admin-fg">{displayAddress}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Package className="w-3.5 h-3.5 text-admin-muted" />
              <span className="text-xs font-semibold text-admin-fg uppercase tracking-wide">Items Ordered</span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-admin-hover/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-admin-fg font-medium">Product #{item.productId.toString()}</span>
                    <span className="text-admin-muted text-xs">× {item.quantity.toString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-admin-muted text-xs mr-2">
                      ₹{Number(item.unitPrice).toLocaleString('en-IN')} each
                    </span>
                    <span className="text-admin-fg font-semibold text-sm">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
                        Number(item.unitPrice) * Number(item.quantity)
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-admin-border/40">
              <span className="text-sm font-semibold text-admin-fg">Order Total</span>
              <span className="text-sm font-bold text-admin-fg">
                {formatCurrency(Number(order.totalAmount))}
              </span>
            </div>
          </div>

          {/* Razorpay IDs */}
          {(order.razorpayOrderId || order.razorpayPaymentId) && (
            <div className="space-y-1 text-xs text-admin-muted border-t border-admin-border/40 pt-2">
              {order.razorpayOrderId && (
                <p>Razorpay Order: <span className="font-mono">{order.razorpayOrderId}</span></p>
              )}
              {order.razorpayPaymentId && (
                <p>Razorpay Payment: <span className="font-mono">{order.razorpayPaymentId}</span></p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useGetOrders();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const gdi = o.guestDeliveryInfo;
        const di = o.deliveryInfo;
        const name = (gdi?.fullName || di?.fullName || '').toLowerCase();
        const phone = (gdi?.phoneNumber || di?.phoneNumber || '').toLowerCase();
        const address = (gdi?.address || di?.address || '').toLowerCase();
        return (
          o.id.toString().includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          address.includes(q)
        );
      });
    }

    if (filterPayment !== 'all') {
      result = result.filter((o) => o.paymentStatus === filterPayment);
    }
    if (filterFulfillment !== 'all') {
      result = result.filter((o) => o.fulfillmentStatus === filterFulfillment);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = Number(a.createdAt) - Number(b.createdAt);
      else if (sortKey === 'total') cmp = Number(a.totalAmount) - Number(b.totalAmount);
      else if (sortKey === 'payment') cmp = a.paymentStatus.localeCompare(b.paymentStatus);
      else if (sortKey === 'fulfillment') cmp = a.fulfillmentStatus.localeCompare(b.fulfillmentStatus);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [orders, search, sortKey, sortDir, filterPayment, filterFulfillment]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const pendingCount = orders.filter((o) => o.fulfillmentStatus === 'Pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Orders</h1>
        <p className="text-admin-muted text-sm mt-1">
          {orders.length} total orders · ₹{totalRevenue.toLocaleString('en-IN')} revenue · {pendingCount} pending
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
          <Input
            placeholder="Search by order ID, name, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-admin-card border-admin-border text-admin-fg placeholder:text-admin-muted"
          />
        </div>

        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-36 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterFulfillment} onValueChange={setFilterFulfillment}>
          <SelectTrigger className="w-40 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Fulfillment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {FULFILLMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${sortKey}-${sortDir}`}
          onValueChange={(v) => {
            const [key, dir] = v.split('-') as [SortKey, SortDir];
            setSortKey(key);
            setSortDir(dir);
          }}
        >
          <SelectTrigger className="w-44 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="total-desc">Highest Amount</SelectItem>
            <SelectItem value="total-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-admin-muted">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders found</p>
          <p className="text-sm mt-1">
            {search || filterPayment !== 'all' || filterFulfillment !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start purchasing'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id.toString()} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
