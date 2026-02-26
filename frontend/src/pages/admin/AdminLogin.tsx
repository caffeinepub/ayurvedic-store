import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { Leaf, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LoginPhase =
  | 'idle'
  | 'logging-in'
  | 'waiting-actor'
  | 'claiming-admin'
  | 'checking-admin'
  | 'access-denied'
  | 'redirecting';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [phase, setPhase] = useState<LoginPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  // Main auth flow effect
  useEffect(() => {
    if (phase === 'idle') return;
    if (phase === 'logging-in') return; // waiting for loginStatus to change
    if (phase === 'access-denied') return;
    if (phase === 'redirecting') return;

    // After login succeeds, wait for actor to be ready
    if (phase === 'waiting-actor') {
      if (loginStatus === 'logging-in') return; // still logging in
      if (!identity) return; // not authenticated yet
      if (actorFetching) return; // actor still initializing
      if (!actor) return; // actor not ready
      // Actor is ready, proceed to claim/check admin
      setPhase('claiming-admin');
      return;
    }

    if (phase === 'claiming-admin') {
      const claimAndCheck = async () => {
        try {
          const principal = identity!.getPrincipal().toString();
          // Try to set admin (works if no admin set yet, or if already admin)
          await actor!.setAdmin(identity!.getPrincipal() as any);
          setPhase('checking-admin');
        } catch {
          // setAdmin failed — might already be set to someone else
          setPhase('checking-admin');
        }
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
        } catch (err) {
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

  const isLoading =
    phase === 'logging-in' ||
    phase === 'waiting-actor' ||
    phase === 'claiming-admin' ||
    phase === 'checking-admin' ||
    phase === 'redirecting' ||
    isInitializing;

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

        {/* Error state */}
        {phase === 'access-denied' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm">Access Denied</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* General error */}
        {error && phase === 'idle' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mb-6 flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
            <p className="text-gray-600 text-sm text-center">{loadingMessage()}</p>
          </div>
        )}

        {/* Action buttons */}
        {!isLoading && (
          <div className="space-y-3">
            {phase === 'access-denied' ? (
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
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-500 text-sm justify-center mb-4">
                  <Shield className="w-4 h-4" />
                  <span>Secure admin access via Internet Identity</span>
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
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
