import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
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

// Customer layout
function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Admin layout wrapper
function AdminProtectedLayout() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminAuthGuard>
  );
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
  path: '/product/$productId',
  component: ProductDetail,
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

// Admin routes
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLogin,
});

const adminLoginAltRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLogin,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: AdminProtectedLayout,
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

const routeTree = rootRoute.addChildren([
  customerLayoutRoute.addChildren([
    homeRoute,
    shopRoute,
    productDetailRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
  ]),
  adminLoginRoute,
  adminLoginAltRoute,
  adminLayoutRoute.addChildren([
    adminProductsRoute,
    adminOrdersRoute,
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
          <Toaster />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
