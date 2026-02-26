import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import AdminLayout from './components/admin/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Customer layout wrapper
function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Customer layout route
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
  path: '/product/$productId',
  component: ProductDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/cart',
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/checkout',
  component: Checkout,
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

// Admin routes (no layout guard for login)
const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/login' });
  },
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLogin,
});

// Protected admin layout wrapper
function ProtectedAdminLayout() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminAuthGuard>
  );
}

const adminProtectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-protected',
  component: ProtectedAdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminProtectedRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminProtectedRoute,
  path: '/admin/products',
  component: AdminProducts,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminProtectedRoute,
  path: '/admin/orders',
  component: AdminOrders,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminProtectedRoute,
  path: '/admin/users',
  component: AdminUsers,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminProtectedRoute,
  path: '/admin/settings',
  component: AdminSettings,
});

const routeTree = rootRoute.addChildren([
  customerLayoutRoute.addChildren([
    homeRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
  ]),
  adminIndexRoute,
  adminLoginRoute,
  adminProtectedRoute.addChildren([
    adminDashboardRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminUsersRoute,
    adminSettingsRoute,
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
