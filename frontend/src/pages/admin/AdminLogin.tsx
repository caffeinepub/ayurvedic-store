import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Leaf, LogIn, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated && !adminLoading && isAdmin === true) {
      navigate({ to: '/admin/products' });
    }
  }, [isAuthenticated, isAdmin, adminLoading]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isInitializing || (isAuthenticated && adminLoading)) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-admin-accent/10 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-admin-accent" />
            </div>
            <h1 className="text-2xl font-bold text-admin-fg">Nature Glow</h1>
            <p className="text-admin-muted text-sm mt-1">Admin Dashboard</p>
          </div>

          {/* Access denied state */}
          {isAuthenticated && isAdmin === false && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">Access Denied</p>
                <p className="text-red-400/70 text-xs mt-1">
                  Your account does not have admin privileges.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isAuthenticated ? (
              <>
                <p className="text-admin-muted text-sm text-center mb-6">
                  Sign in with your Internet Identity to access the admin panel.
                </p>
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-admin-accent hover:bg-admin-accent/90 text-white font-semibold py-3"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-admin-border text-admin-fg hover:bg-admin-hover"
              >
                Sign out and try another account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
