import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isChecking = isInitializing || adminLoading;

  useEffect(() => {
    if (!isChecking) {
      if (!isAuthenticated || isAdmin === false) {
        navigate({ to: '/admin/login' });
      }
    }
  }, [isChecking, isAuthenticated, isAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  if (!isAuthenticated || isAdmin === false) {
    return null;
  }

  return <>{children}</>;
}
