import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Menu, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import MobileNavDrawer from './MobileNavDrawer';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    ...(isAuthenticated ? [{ label: 'Orders', path: '/orders' }] : []),
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-botanical border-b border-border/50'
            : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="font-serif text-2xl text-primary font-bold tracking-wide hover:opacity-80 transition-opacity"
            >
              Nature Glow
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path })}
                  className="relative text-foreground/80 hover:text-primary font-medium transition-colors group text-sm"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Orders icon for authenticated users (mobile-friendly) */}
              {isAuthenticated && (
                <button
                  onClick={() => navigate({ to: '/orders' })}
                  className="md:hidden relative p-2 text-foreground/70 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="My Orders"
                >
                  <Package className="w-5 h-5" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate({ to: '/cart' })}
                className="relative p-2 text-foreground/70 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Auth button (desktop) */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground/30"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate({ to: '/admin/login' })}
                  className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground/30"
                >
                  Login
                </button>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
    </>
  );
}
