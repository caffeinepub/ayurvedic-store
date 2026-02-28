import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const GUARD_TIMEOUT_MS = 15000;

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();
  const [timedOut, setTimedOut] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in' || loginStatus === 'success';
  const isStillLoading = isInitializing || isLoggingIn || actorFetching || adminLoading || !adminFetched;

  // Timeout guard: if stuck loading for too long, show error
  useEffect(() => {
    if (!isStillLoading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, GUARD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isStillLoading]);

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

  const handleRetry = () => {
    setTimedOut(false);
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
  };

  // Show timeout error
  if (timedOut && isStillLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 text-center">Connection Timeout</h2>
          <p className="text-gray-500 text-sm text-center">
            The admin panel is taking too long to load. Please check your connection and try again.
          </p>
          <Button
            onClick={handleRetry}
            className="w-full bg-admin-accent hover:bg-admin-accent/90 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/admin/login' })}
            className="w-full rounded-xl"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while checking
  if (isStillLoading) {
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
