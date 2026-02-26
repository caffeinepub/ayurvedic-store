import React, { useState } from 'react';
import { useGetOrders } from '../../hooks/useQueries';
import type { Order } from '../../backend';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingBag, RefreshCw, Search, TrendingUp, DollarSign,
  Clock, CheckCircle2, Eye
} from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import { formatINR, formatDate } from '../../utils/formatters';

function PaymentBadge({ status }: { status: string }) {
  const isPaid = status.toLowerCase() === 'paid';
  return (
    <Badge
      variant="outline"
      className={isPaid
        ? 'bg-green-50 text-green-700 border-green-200 text-xs'
        : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'}
    >
      {isPaid ? '✓ Paid' : '⏳ Pending'}
    </Badge>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-slate-50 text-slate-600 border-slate-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs ${colors[status.toLowerCase()] || 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </Badge>
  );
}

export default function AdminOrders() {
  const { data: orders = [], isLoading, refetch, isFetching } = useGetOrders();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(o =>
    o.shippingDetails.fullName.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toString().includes(search) ||
    o.shippingDetails.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.paymentStatus.toLowerCase() === 'paid').length;
  const pendingOrders = orders.filter(o => o.fulfillmentStatus.toLowerCase() === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus.toLowerCase() === 'paid')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-fg">Orders</h1>
          <p className="text-sm text-admin-muted mt-0.5">Manage customer orders and fulfillment</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-admin-border text-admin-fg hover:bg-admin-hover self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600' },
          { label: 'Paid Orders', value: paidOrders, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pending Fulfillment', value: pendingOrders, icon: Clock, color: 'text-amber-600' },
          { label: 'Total Revenue', value: formatINR(totalRevenue), icon: DollarSign, color: 'text-admin-accent' },
        ].map(stat => (
          <Card key={stat.label} className="bg-admin-card border-admin-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-admin-muted font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-admin-fg mt-0.5">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-semibold text-admin-fg">All Orders</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, ID…"
                className="pl-9 bg-admin-bg border-admin-border text-admin-fg placeholder:text-admin-muted"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-admin-muted/40 mb-3" />
              <p className="text-admin-fg font-medium">No orders found</p>
              <p className="text-sm text-admin-muted mt-1">
                {search ? 'Try a different search term' : 'Orders will appear here once customers place them'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-admin-border hover:bg-transparent">
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider">Order ID</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider">Total</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Payment</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider">Fulfillment</TableHead>
                    <TableHead className="text-admin-muted font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(order => (
                    <TableRow
                      key={order.id.toString()}
                      className="border-admin-border hover:bg-admin-hover/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-admin-accent bg-admin-accent/10 px-2 py-1 rounded">
                          #{order.id.toString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-admin-fg text-sm">{order.shippingDetails.fullName}</p>
                          <p className="text-xs text-admin-muted">{order.shippingDetails.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-admin-muted">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold text-admin-fg text-sm">
                        {formatINR(order.totalAmount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <PaymentBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <FulfillmentBadge status={order.fulfillmentStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="h-8 w-8 text-admin-muted hover:text-admin-fg hover:bg-admin-hover"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
