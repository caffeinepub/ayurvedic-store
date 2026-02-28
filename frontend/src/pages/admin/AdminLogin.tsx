import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Leaf, Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LoginPhase =
  | 'idle'
  | 'logging-in'
  | 'waiting-actor'
  | 'claiming-admin'
  | 'checking-admin'
  | 'access-denied'
  | 'redirecting'
  | 'timeout';

const INIT_TIMEOUT_MS = 12000;

export default function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [phase, setPhase] = useState<LoginPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!identity;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Timeout guard: if stuck in waiting-actor for too long, show error
  useEffect(() => {
    if (phase === 'waiting-actor') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPhase('timeout');
        setError('Connection timed out. The secure connection could not be established. Please retry.');
      }, INIT_TIMEOUT_MS);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [phase]);

  // Main auth flow effect
  useEffect(() => {
    if (phase === 'idle') return;
    if (phase === 'logging-in') return;
    if (phase === 'access-denied') return;
    if (phase === 'redirecting') return;
    if (phase === 'timeout') return;

    // After login succeeds, wait for actor to be ready
    if (phase === 'waiting-actor') {
      if (loginStatus === 'logging-in') return;
      if (!identity) return;
      if (actorFetching) return;
      if (!actor) return;
      // Actor is ready, proceed to claim/check admin
      setPhase('claiming-admin');
      return;
    }

    if (phase === 'claiming-admin') {
      const claimAndCheck = async () => {
        try {
          await actor!.setAdmin(identity!.getPrincipal() as any);
        } catch {
          // setAdmin failed — might already be set to someone else, that's fine
        }
        setPhase('checking-admin');
      };
      claimAndCheck();
      return;
    }

    if (phase === 'checking-admin') {
      const checkAdmin = async () => {
        try {
          const isAdmin = await actor!.isCallerAdmin();
          if (isAdmin) {
            setPhase('redirecting');
            navigate({ to: '/admin/dashboard' });
          } else {
            setPhase('access-denied');
            setError('Your account does not have admin privileges. Please sign in with the authorized admin account.');
          }
        } catch {
          setPhase('access-denied');
          setError('Failed to verify admin status. Please try again.');
        }
      };
      checkAdmin();
      return;
    }
  }, [phase, loginStatus, identity, actor, actorFetching, navigate]);

  const handleLogin = async () => {
    setError(null);
    setPhase('logging-in');
    try {
      await login();
      setPhase('waiting-actor');
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        setPhase('waiting-actor');
      } else {
        setPhase('idle');
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    await clear();
    setPhase('idle');
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setPhase('idle');
    // Invalidate actor query to force re-initialization
    queryClient.invalidateQueries({ queryKey: ['actor'] });
  };

  // Show loading only during active login flow phases
  const isActivelyLoading =
    phase === 'logging-in' ||
    phase === 'waiting-actor' ||
    phase === 'claiming-admin' ||
    phase === 'checking-admin' ||
    phase === 'redirecting';

  const showAccessDenied = phase === 'access-denied';
  const showTimeout = phase === 'timeout';

  const loadingMessage = () => {
    switch (phase) {
      case 'logging-in': return 'Connecting to Internet Identity...';
      case 'waiting-actor': return 'Initializing secure connection...';
      case 'claiming-admin': return 'Setting up admin access...';
      case 'checking-admin': return 'Verifying admin privileges...';
      case 'redirecting': return 'Redirecting to dashboard...';
      default: return 'Loading...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-sidebar flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-admin-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nature Glow</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Access Denied error */}
        {showAccessDenied && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm">Access Denied</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Timeout error */}
        {showTimeout && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 font-semibold text-sm">Connection Timeout</p>
              <p className="text-amber-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* General idle error */}
        {error && phase === 'idle' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isActivelyLoading && (
          <div className="mb-6 flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
            <p className="text-gray-600 text-sm text-center">{loadingMessage()}</p>
          </div>
        )}

        {/* Action buttons */}
        {!isActivelyLoading && (
          <div className="space-y-3">
            {showAccessDenied ? (
              <>
                <p className="text-center text-gray-500 text-sm">
                  Sign in with the authorized admin account
                </p>
                <Button
                  onClick={handleSignOut}
                  className="w-full bg-admin-accent hover:bg-admin-accent/90 text-white rounded-xl py-3 font-semibold"
                >
                  Sign in with different account
                </Button>
              </>
            ) : showTimeout ? (
              <>
                <Button
                  onClick={handleRetry}
                  className="w-full bg-admin-accent hover:bg-admin-accent/90 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Connection
                </Button>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full rounded-xl py-3 font-semibold"
                >
                  Try Login Anyway
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-500 text-sm justify-center mb-4">
                  <Shield className="w-4 h-4" />
                  <span>Secure admin access via Internet Identity</span>
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={isActivelyLoading}
                  className="w-full bg-admin-accent hover:bg-admin-accent/90 text-white rounded-xl py-3 font-semibold"
                >
                  Sign in with Internet Identity
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
