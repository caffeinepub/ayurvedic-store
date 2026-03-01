import React from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDashboard from './pages/admin/AdminDashboard';

// Admin Components
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import AdminLayout from './components/admin/AdminLayout';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// Root layout for customer-facing pages
function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

// Admin layout wrapper
function AdminLayoutWrapper() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminAuthGuard>
  );
}

// Admin root redirect component — must be uppercase to use hooks
function AdminRootRedirect() {
  React.useEffect(() => {
    window.location.replace('/admin/products');
  }, []);
  return null;
}

// Routes
const rootRoute = createRootRoute();

const customerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'customer-layout',
  component: CustomerLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/',
  component: Home,
});

const shopRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/shop',
  component: Shop,
});

const productDetailRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/product/$id',
  component: ProductDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/cart',
  component: Cart,
});

const ordersRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/orders',
  component: Orders,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

// Admin routes
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLogin,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/products' });
  },
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: AdminLayoutWrapper,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/products',
  component: AdminProducts,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/orders',
  component: AdminOrders,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/settings',
  component: AdminSettings,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/users',
  component: AdminUsers,
});

const routeTree = rootRoute.addChildren([
  customerLayoutRoute.addChildren([
    homeRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    ordersRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
  ]),
  adminIndexRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminSettingsRoute,
    adminUsersRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
