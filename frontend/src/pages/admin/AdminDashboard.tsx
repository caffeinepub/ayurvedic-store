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
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = 0;
    }
    orders
      .filter((o) => o.paymentStatus === 'paid')
      .forEach((o) => {
        const d = new Date(Number(o.createdAt) / 1_000_000);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthMap) {
          monthMap[key] += Number(o.totalAmount);
        }
      });
    return Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  // Recent orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 8);
  }, [orders]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Dashboard</h1>
        <p className="text-admin-muted text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-admin-card border-admin-border">
            <CardContent className="p-5">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-admin-muted text-xs font-medium uppercase tracking-wide">{card.title}</p>
                    <p className="text-admin-fg text-2xl font-bold mt-0.5">{card.value}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2 bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-admin-fg text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-admin-accent" />
              Revenue Over Time (INR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fulfillment Pie */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-admin-fg text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : fulfillmentData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-admin-muted text-sm">No orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
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
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || `hsl(${index * 60}, 60%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-admin-muted text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Order ID</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Customer</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Date</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Amount</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Payment</th>
                    <th className="text-left py-2 px-3 text-admin-muted font-medium">Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id.toString()} className="border-b border-admin-border/50 hover:bg-admin-hover/30">
                      <td className="py-2.5 px-3 text-admin-fg font-mono">#{order.id.toString()}</td>
                      <td className="py-2.5 px-3 text-admin-fg">{order.shippingDetails.fullName}</td>
                      <td className="py-2.5 px-3 text-admin-muted">{formatDate(order.createdAt)}</td>
                      <td className="py-2.5 px-3 text-admin-fg font-medium">{formatCurrency(Number(order.totalAmount))}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className={order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
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
    </div>
  );
}
