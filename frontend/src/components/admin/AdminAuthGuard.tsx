import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

type GuardState = 'loading' | 'verified' | 'denied' | 'error' | 'timeout';

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const [guardState, setGuardState] = useState<GuardState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    // Not authenticated at all — redirect to login
    if (!isAuthenticated) {
      navigate({ to: '/admin/login' });
      return;
    }

    // Still waiting for actor
    if (actorFetching || !actor) {
      return;
    }

    // Actor is ready — verify admin status
    verifyAdmin(actor);
  }, [isAuthenticated, actor, actorFetching]);

  // Timeout: if still loading after 15 seconds, show timeout UI
  useEffect(() => {
    if (guardState !== 'loading') return;

    const id = setTimeout(() => {
      setGuardState('timeout');
    }, 15_000);

    return () => clearTimeout(id);
  }, [guardState]);

  const verifyAdmin = async (actorInstance: NonNullable<typeof actor>) => {
    try {
      let isAdmin = false;
      try {
        isAdmin = await actorInstance.isCallerAdmin();
      } catch {
        try {
          isAdmin = await actorInstance.isAdmin();
        } catch {
          isAdmin = false;
        }
      }

      if (isAdmin) {
        setGuardState('verified');
      } else {
        setGuardState('denied');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Failed to verify admin status.');
      setGuardState('error');
    }
  };

  const handleRetry = () => {
    setGuardState('loading');
    setErrorMessage('');
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    queryClient.invalidateQueries({ queryKey: ['actor'] });
  };

  const handleBackToLogin = () => {
    navigate({ to: '/admin/login' });
  };

  if (guardState === 'verified') {
    return <>{children}</>;
  }

  if (guardState === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-cream mb-2">Access Denied</h2>
          <p className="text-cream/60 text-sm mb-6">
            You do not have admin privileges to access this area.
          </p>
          <Button
            onClick={handleBackToLogin}
            className="bg-gold hover:bg-gold/90 text-forest-dark font-semibold rounded-xl"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (guardState === 'error' || guardState === 'timeout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-cream mb-2">
            {guardState === 'timeout' ? 'Connection Timeout' : 'Verification Error'}
          </h2>
          <p className="text-cream/60 text-sm mb-6">
            {guardState === 'timeout'
              ? 'Could not verify admin status in time. Please retry.'
              : errorMessage || 'An error occurred while verifying your admin status.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRetry}
              className="bg-gold hover:bg-gold/90 text-forest-dark font-semibold rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="border-white/20 text-cream hover:bg-white/10 rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
        <p className="text-cream/70 text-sm">Verifying admin access...</p>
      </div>
    </div>
  );
}
