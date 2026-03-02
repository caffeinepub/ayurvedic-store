import { useMemo } from 'react';
import { useGetOrders, useGetAllProducts, useGetAllUsers } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Processing: '#3b82f6',
  Shipped: '#8b5cf6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers();

  const isLoading = ordersLoading || productsLoading || usersLoading;

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending').length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrders,
      pendingOrders,
      totalProducts: products.length,
      totalUsers: users.length,
    };
  }, [orders, products, users]);

  // Fulfillment status breakdown for pie chart
  const fulfillmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.fulfillmentStatus] = (counts[o.fulfillmentStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Revenue by month (last 6 months)
  const revenueByMonth = useMemo(() => {
    const monthMap: Record<string, number> = {};
    orders
      .filter((o) => o.paymentStatus === 'paid')
      .forEach((o) => {
        const date = new Date(Number(o.createdAt) / 1_000_000);
        const key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        monthMap[key] = (monthMap[key] || 0) + Number(o.totalAmount);
      });
    return Object.entries(monthMap)
      .slice(-6)
      .map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Dashboard</h1>
        <p className="text-admin-muted text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-admin-muted text-xs uppercase tracking-wide">Revenue</span>
              <IndianRupee className="w-4 h-4 text-admin-accent" />
            </div>
            <p className="text-2xl font-bold text-admin-fg">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-admin-muted text-xs mt-1">{stats.paidOrders} paid orders</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-admin-muted text-xs uppercase tracking-wide">Orders</span>
              <ShoppingCart className="w-4 h-4 text-admin-accent" />
            </div>
            <p className="text-2xl font-bold text-admin-fg">{stats.totalOrders}</p>
            <p className="text-admin-muted text-xs mt-1">{stats.pendingOrders} pending</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-admin-muted text-xs uppercase tracking-wide">Products</span>
              <Package className="w-4 h-4 text-admin-accent" />
            </div>
            <p className="text-2xl font-bold text-admin-fg">{stats.totalProducts}</p>
            <p className="text-admin-muted text-xs mt-1">in catalogue</p>
          </CardContent>
        </Card>

        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-admin-muted text-xs uppercase tracking-wide">Customers</span>
              <Users className="w-4 h-4 text-admin-accent" />
            </div>
            <p className="text-2xl font-bold text-admin-fg">{stats.totalUsers}</p>
            <p className="text-admin-muted text-xs mt-1">registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-admin-fg text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-admin-accent" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--admin-muted)' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--admin-muted)' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      background: 'var(--admin-card)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#5C7A4E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-admin-muted text-sm">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fulfillment Pie Chart */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-admin-fg text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-admin-accent" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fulfillmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={fulfillmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fulfillmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--admin-card)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-admin-muted text-sm">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-sm font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-admin-muted text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-3 text-admin-muted font-medium text-xs uppercase tracking-wide">Order</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium text-xs uppercase tracking-wide">Customer</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium text-xs uppercase tracking-wide">Amount</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium text-xs uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders]
                    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                    .slice(0, 5)
                    .map((order) => {
                      const gdi = order.guestDeliveryInfo;
                      const di = order.deliveryInfo;
                      const customerName = gdi?.fullName || di?.fullName || 'Unknown';
                      return (
                        <tr key={order.id.toString()} className="border-b border-admin-border/40 hover:bg-admin-hover/20">
                          <td className="py-2.5 px-3 font-mono text-admin-fg text-xs">#{order.id.toString()}</td>
                          <td className="py-2.5 px-3 text-admin-fg">{customerName}</td>
                          <td className="py-2.5 px-3 text-admin-fg font-medium">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(order.totalAmount))}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              className="text-xs border-0"
                              style={{
                                background: `${STATUS_COLORS[order.fulfillmentStatus] || '#94a3b8'}20`,
                                color: STATUS_COLORS[order.fulfillmentStatus] || '#94a3b8',
                              }}
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
