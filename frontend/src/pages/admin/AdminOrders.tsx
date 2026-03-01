import { useState, useMemo } from 'react';
import { useGetOrders, useUpdateFulfillmentStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ShoppingCart,
  Search,
  CheckCircle,
  Clock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Mail,
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

  // Prefer guestDetails for display, fall back to shippingDetails
  const gd = order.guestDetails;
  const sd = order.shippingDetails;

  const displayName = gd?.fullName || sd.fullName || '—';
  const displayEmail = gd?.email || sd.email || '—';
  const displayPhone = gd?.phoneNumber || sd.phoneNumber || '—';
  const displayAddress1 = gd?.addressLine1 || sd.addressLine1 || '';
  const displayAddress2 = gd?.addressLine2 || sd.addressLine2 || '';
  const displayCity = gd?.city || sd.city || '';
  const displayState = gd?.state || sd.state || '';
  const displayPincode = gd?.pincode || sd.pincode || '';
  const displayNotes = gd?.orderNotes;

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
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{displayEmail}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-admin-muted">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{displayPhone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-admin-muted">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {[displayAddress1, displayAddress2, displayCity, displayState, displayPincode]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded: Items + Notes */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-admin-border/60 space-y-4 pt-3">
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

          {/* Order Notes */}
          {displayNotes && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <StickyNote className="w-3.5 h-3.5 text-admin-muted" />
                <span className="text-xs font-semibold text-admin-fg uppercase tracking-wide">Order Notes</span>
              </div>
              <p className="text-sm text-admin-muted bg-admin-hover/20 rounded-lg px-3 py-2 italic">
                {displayNotes}
              </p>
            </div>
          )}

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
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.paymentStatus === 'paid').length;
    const pending = orders.filter((o) => o.paymentStatus === 'pending').length;
    const revenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return { total, paid, pending, revenue };
  }, [orders]);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const gd = o.guestDetails;
        const sd = o.shippingDetails;
        const name = (gd?.fullName || sd.fullName || '').toLowerCase();
        const email = (gd?.email || sd.email || '').toLowerCase();
        const phone = (gd?.phoneNumber || sd.phoneNumber || '').toLowerCase();
        return (
          o.id.toString().includes(q) ||
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          o.customerId.toString().toLowerCase().includes(q)
        );
      });
    }

    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    if (fulfillmentFilter !== 'all') {
      result = result.filter((o) => o.fulfillmentStatus === fulfillmentFilter);
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
  }, [orders, search, paymentFilter, fulfillmentFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const fulfillmentStatuses = [...new Set(orders.map((o) => o.fulfillmentStatus))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Orders</h1>
        <p className="text-admin-muted text-sm mt-1">Manage and track customer orders — all details visible inline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Paid', value: stats.paid, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <Card key={s.label} className="bg-admin-card border-admin-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-admin-muted text-xs">{s.label}</p>
                  <p className={`font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
          <Input
            placeholder="Search by order ID, name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-admin-card border-admin-border text-admin-fg"
          />
        </div>

        {/* Sort */}
        <Select value={`${sortKey}-${sortDir}`} onValueChange={(v) => {
          const [k, d] = v.split('-') as [SortKey, SortDir];
          setSortKey(k);
          setSortDir(d);
        }}>
          <SelectTrigger className="w-full sm:w-44 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="total-desc">Highest Amount</SelectItem>
            <SelectItem value="total-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-admin-card border-admin-border text-admin-fg">
            <SelectValue placeholder="Fulfillment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {fulfillmentStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-base flex items-center justify-between">
            <span>Orders ({filtered.length})</span>
            <span className="text-xs font-normal text-admin-muted">Click any order to expand items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-admin-muted mx-auto mb-3 opacity-40" />
              <p className="text-admin-muted">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <OrderCard key={order.id.toString()} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
