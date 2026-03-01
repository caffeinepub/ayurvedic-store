import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { Leaf, Shield, AlertCircle, Loader2 } from 'lucide-react';

type LoginState = 'idle' | 'logging-in' | 'checking' | 'claiming' | 'success' | 'denied' | 'error';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated || actorFetching || !actor) return;
    if (loginState !== 'checking' && loginState !== 'claiming') return;

    const verifyAndClaim = async () => {
      try {
        setLoginState('checking');

        // First check if the caller is already admin
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

        if (isAdminResult) {
          setLoginState('success');
          setTimeout(() => navigate({ to: '/admin/products' }), 500);
          return;
        }

        // Not admin yet — attempt to bootstrap/claim admin
        // This works when no admin is set (e.g., after a canister upgrade resets state)
        setLoginState('claiming');
        try {
          const principal = identity!.getPrincipal();
          await actor.setAdmin(principal);

          // Verify the claim succeeded
          let verifyResult = false;
          try {
            verifyResult = await actor.isCallerAdmin();
          } catch {
            try {
              verifyResult = await actor.isAdmin();
            } catch {
              verifyResult = false;
            }
          }

          if (verifyResult) {
            setLoginState('success');
            setTimeout(() => navigate({ to: '/admin/products' }), 500);
          } else {
            setLoginState('denied');
            setErrorMessage('Admin access is already claimed by another principal. Please use the designated admin identity.');
          }
        } catch (claimError: any) {
          // setAdmin failed — admin is already set and caller is not admin
          setLoginState('denied');
          setErrorMessage('Admin access is already claimed by another principal. Please use the designated admin identity.');
        }
      } catch (err: any) {
        setLoginState('error');
        setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      }
    };

    verifyAndClaim();
  }, [isAuthenticated, actorFetching, actor, loginState]);

  const handleLogin = async () => {
    if (isAuthenticated) {
      setLoginState('checking');
      return;
    }
    setLoginState('logging-in');
    try {
      await login();
      setLoginState('checking');
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        setLoginState('checking');
      } else {
        setLoginState('error');
        setErrorMessage(err?.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    setLoginState('idle');
    setErrorMessage('');
  };

  const handleRetry = () => {
    setLoginState('checking');
    setErrorMessage('');
  };

  const isLoading =
    loginState === 'logging-in' ||
    loginState === 'checking' ||
    loginState === 'claiming' ||
    loginState === 'success' ||
    actorFetching;

  const getStatusMessage = () => {
    switch (loginState) {
      case 'logging-in': return 'Connecting to Internet Identity...';
      case 'checking': return 'Verifying admin privileges...';
      case 'claiming': return 'Setting up admin access...';
      case 'success': return 'Access granted! Redirecting...';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-forest-dark to-forest-deep flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 border border-gold/40 mb-4">
            <Leaf className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl text-gold mb-1">Nature Glow</h1>
          <p className="text-cream/60 text-sm">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl text-cream">Admin Access</h2>
          </div>

          {/* Error / Denied State */}
          {(loginState === 'denied' || loginState === 'error') && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">
                  {loginState === 'denied' ? 'Access Denied' : 'Error'}
                </p>
                <p className="text-red-300/80 text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-gold animate-spin flex-shrink-0" />
              <p className="text-cream/80 text-sm">{getStatusMessage()}</p>
            </div>
          )}

          {/* Description */}
          {!isLoading && loginState !== 'denied' && loginState !== 'error' && (
            <p className="text-cream/70 text-sm mb-6 leading-relaxed">
              {isAuthenticated
                ? 'You are connected. Click below to verify your admin privileges.'
                : 'Sign in with your Internet Identity to access the admin panel. Only the designated admin principal has access.'}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginState === 'logging-in' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Login with Internet Identity'
                )}
              </button>
            ) : (
              <>
                {(loginState === 'idle' || loginState === 'denied' || loginState === 'error') && (
                  <button
                    onClick={handleRetry}
                    disabled={actorFetching}
                    className="w-full py-3 px-6 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actorFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Verify Admin Access'
                    )}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-cream/80 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Sign Out & Use Different Identity
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-cream/40 text-xs text-center">
              Admin access is tied to a specific Internet Identity principal.
              {!isAuthenticated && ' First-time setup: the first authenticated user will become admin.'}
            </p>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-cream/50 hover:text-cream/80 text-sm transition-colors"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
