import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AdminLoginState =
  | 'idle'
  | 'logging-in'
  | 'waiting-actor'
  | 'checking-admin'
  | 'setting-admin'
  | 'success'
  | 'access-denied'
  | 'error'
  | 'timeout';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const [state, setState] = useState<AdminLoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!identity;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  // When actor becomes available after login, proceed with admin check
  useEffect(() => {
    if (state === 'waiting-actor' && actor && !actorFetching) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      handleAdminCheck(actor);
    }
  }, [actor, actorFetching, state]);

  const handleAdminCheck = async (actorInstance: NonNullable<typeof actor>) => {
    setState('checking-admin');
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
        setState('success');
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        setTimeout(() => navigate({ to: '/admin/products' }), 500);
        return;
      }

      // Not admin yet — try to claim admin (bootstrap: first authenticated user)
      setState('setting-admin');
      try {
        const principal = identity!.getPrincipal();
        await actorInstance.setAdmin(principal);
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        setState('success');
        setTimeout(() => navigate({ to: '/admin/products' }), 500);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Not authorized') || msg.includes('Only admin')) {
          setState('access-denied');
          setErrorMessage('You do not have admin privileges. Only the designated admin can access this panel.');
        } else {
          setState('error');
          setErrorMessage(msg || 'Failed to verify admin status. Please try again.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setState('error');
      setErrorMessage(msg || 'Failed to verify admin status. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (isAuthenticated) {
      if (actor && !actorFetching) {
        setState('checking-admin');
        await handleAdminCheck(actor);
      } else {
        setState('waiting-actor');
        startActorTimeout();
      }
      return;
    }

    setState('logging-in');
    try {
      await login();
      setState('waiting-actor');
      startActorTimeout();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'User is already authenticated') {
        setState('waiting-actor');
        startActorTimeout();
      } else {
        setState('error');
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  const startActorTimeout = () => {
    const id = setTimeout(() => {
      setState('timeout');
    }, 15_000);
    setTimeoutId(id);
  };

  const handleRetry = () => {
    setState('idle');
    setErrorMessage('');
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setState('idle');
    setErrorMessage('');
  };

  const isLoading =
    state === 'logging-in' ||
    state === 'waiting-actor' ||
    state === 'checking-admin' ||
    state === 'setting-admin' ||
    state === 'success';

  const getLoadingMessage = () => {
    switch (state) {
      case 'logging-in': return 'Connecting to Internet Identity...';
      case 'waiting-actor': return 'Initializing secure connection...';
      case 'checking-admin': return 'Verifying admin privileges...';
      case 'setting-admin': return 'Setting up admin access...';
      case 'success': return 'Access granted! Redirecting...';
      default: return 'Loading...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 border border-gold/40 mb-4">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl text-gold mb-1">Nature Glow</h1>
          <p className="text-cream/60 text-sm">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-cream mb-2 text-center">Admin Sign In</h2>
          <p className="text-cream/50 text-sm text-center mb-8">
            Authenticate with Internet Identity to access the admin dashboard.
          </p>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
              <p className="text-cream/70 text-sm text-center">{getLoadingMessage()}</p>
            </div>
          )}

          {/* Error state */}
          {(state === 'error' || state === 'timeout') && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">
                  {state === 'timeout' ? 'Connection timed out' : 'Authentication Error'}
                </p>
                <p className="text-red-300/70 text-xs mt-1">
                  {state === 'timeout'
                    ? 'Could not establish a connection. Please check your network and try again.'
                    : errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Access denied state */}
          {state === 'access-denied' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-sm font-medium">Access Denied</p>
                <p className="text-amber-300/70 text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isLoading && (
            <div className="space-y-3">
              {(state === 'idle' || state === 'error' || state === 'timeout') && (
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gold hover:bg-gold/90 text-forest font-semibold py-3 rounded-xl"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {isAuthenticated ? 'Continue as Admin' : 'Login with Internet Identity'}
                </Button>
              )}

              {(state === 'error' || state === 'timeout') && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full border-white/20 text-cream hover:bg-white/10 py-3 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}

              {state === 'access-denied' && (
                <>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-white/20 text-cream hover:bg-white/10 py-3 rounded-xl"
                  >
                    Logout & Try Different Account
                  </Button>
                  <Button
                    onClick={() => navigate({ to: '/' })}
                    variant="ghost"
                    className="w-full text-cream/50 hover:text-cream hover:bg-white/5 py-3 rounded-xl"
                  >
                    Back to Store
                  </Button>
                </>
              )}

              {isAuthenticated && state === 'idle' && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full text-cream/50 hover:text-cream hover:bg-white/5 py-3 rounded-xl text-sm"
                >
                  Logout current account
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
