import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in' || loginStatus === 'success';

  useEffect(() => {
    // Don't redirect during initialization or login transitions
    if (isInitializing || isLoggingIn || actorFetching || adminLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate({ to: '/admin/login' });
      return;
    }

    // If admin check is done and user is not admin, redirect to login
    if (adminFetched && isAdmin === false) {
      navigate({ to: '/admin/login' });
    }
  }, [isAuthenticated, isInitializing, isLoggingIn, actorFetching, adminLoading, adminFetched, isAdmin, navigate]);

  // Show loading while checking
  if (isInitializing || isLoggingIn || actorFetching || adminLoading || !adminFetched) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-admin-accent animate-spin" />
          <p className="text-admin-muted text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If authenticated and admin, render children
  if (isAuthenticated && isAdmin) {
    return <>{children}</>;
  }

  // Fallback loading while redirect happens
  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-admin-accent animate-spin" />
    </div>
  );
}
