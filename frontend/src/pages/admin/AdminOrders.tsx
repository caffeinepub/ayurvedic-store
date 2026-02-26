import { useState, useMemo } from 'react';
import { useGetOrders } from '../../hooks/useQueries';
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
import { ShoppingCart, Search, TrendingUp, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import type { Order } from '../../backend';

type SortKey = 'date' | 'total' | 'payment' | 'fulfillment';
type SortDir = 'asc' | 'desc';

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useGetOrders();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      result = result.filter(
        (o) =>
          o.id.toString().includes(q) ||
          o.shippingDetails.fullName.toLowerCase().includes(q) ||
          o.customerId.toString().toLowerCase().includes(q)
      );
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

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const fulfillmentStatuses = [...new Set(orders.map((o) => o.fulfillmentStatus))];

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-admin-muted">
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Orders</h1>
        <p className="text-admin-muted text-sm mt-1">Manage and track customer orders</p>
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
            placeholder="Search by order ID, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-admin-card border-admin-border text-admin-fg"
          />
        </div>
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

      {/* Table */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-base">
            Orders ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-admin-muted mx-auto mb-3 opacity-40" />
              <p className="text-admin-muted">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Order ID</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Customer</th>
                    <th
                      className="text-left py-3 px-3 text-admin-muted font-medium cursor-pointer hover:text-admin-fg select-none"
                      onClick={() => toggleSort('date')}
                    >
                      Date <SortIcon col="date" />
                    </th>
                    <th
                      className="text-left py-3 px-3 text-admin-muted font-medium cursor-pointer hover:text-admin-fg select-none"
                      onClick={() => toggleSort('total')}
                    >
                      Amount <SortIcon col="total" />
                    </th>
                    <th
                      className="text-left py-3 px-3 text-admin-muted font-medium cursor-pointer hover:text-admin-fg select-none"
                      onClick={() => toggleSort('payment')}
                    >
                      Payment <SortIcon col="payment" />
                    </th>
                    <th
                      className="text-left py-3 px-3 text-admin-muted font-medium cursor-pointer hover:text-admin-fg select-none"
                      onClick={() => toggleSort('fulfillment')}
                    >
                      Fulfillment <SortIcon col="fulfillment" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id.toString()}
                      className="border-b border-admin-border/50 hover:bg-admin-hover/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-3 text-admin-fg font-mono">#{order.id.toString()}</td>
                      <td className="py-3 px-3 text-admin-fg">{order.shippingDetails.fullName}</td>
                      <td className="py-3 px-3 text-admin-muted">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-3 text-admin-fg font-medium">{formatCurrency(Number(order.totalAmount))}</td>
                      <td className="py-3 px-3">
                        <Badge
                          className={
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 border-0'
                              : 'bg-amber-100 text-amber-700 border-0'
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs">
                          {order.fulfillmentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
