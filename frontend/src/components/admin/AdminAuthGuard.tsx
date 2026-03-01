import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { Loader2, ShieldX, RefreshCw } from 'lucide-react';

type GuardState = 'loading' | 'authorized' | 'denied' | 'unauthenticated' | 'error';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [guardState, setGuardState] = useState<GuardState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isInitializing || actorFetching) {
      setGuardState('loading');
      return;
    }

    if (!isAuthenticated) {
      setGuardState('unauthenticated');
      navigate({ to: '/admin/login' });
      return;
    }

    if (!actor) {
      setGuardState('loading');
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setGuardState('error');
        setErrorMessage('Admin verification timed out. Please try again.');
      }
    }, 15000);

    const checkAdmin = async () => {
      try {
        let isAdminResult = false;
        try {
          isAdminResult = await actor.isCallerAdmin();
        } catch {
          try {
            isAdminResult = await actor.isAdmin();
          } catch {
            isAdminResult = false;
          }
        }

        if (!cancelled) {
          clearTimeout(timeout);
          if (isAdminResult) {
            setGuardState('authorized');
          } else {
            setGuardState('denied');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          clearTimeout(timeout);
          setGuardState('error');
          setErrorMessage(err?.message || 'Failed to verify admin status.');
        }
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isAuthenticated, isInitializing, actorFetching, actor]);

  if (guardState === 'loading') {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-cream/70 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (guardState === 'denied' || guardState === 'error') {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-400/40 mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-serif text-2xl text-cream mb-2">
            {guardState === 'denied' ? 'Access Denied' : 'Verification Error'}
          </h2>
          <p className="text-cream/60 text-sm mb-6">
            {guardState === 'denied'
              ? 'Your Internet Identity does not have admin privileges for this store.'
              : errorMessage || 'An error occurred while verifying your admin status.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: '/admin/login' })}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Back to Login
            </button>
            <button
              onClick={() => navigate({ to: '/' })}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-cream/80 rounded-xl transition-colors"
            >
              Go to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (guardState === 'unauthenticated') {
    return null;
  }

  if (guardState === 'authorized') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-gold animate-spin" />
    </div>
  );
}
