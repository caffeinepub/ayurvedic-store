import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, Home, ShoppingBag, Package, LogOut, LogIn } from 'lucide-react';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function MobileNavDrawer({ open, onClose, isAuthenticated, onLogout }: MobileNavDrawerProps) {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate({ to: path });
    onClose();
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    ...(isAuthenticated ? [{ label: 'My Orders', path: '/orders', icon: Package }] : []),
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-72 bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="font-serif text-xl text-primary font-bold">Nature Glow</span>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors min-h-[44px] text-left font-medium"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="px-4 pb-6 border-t border-border pt-4">
          {isAuthenticated ? (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors min-h-[44px] font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleNav('/admin/login')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors min-h-[44px] font-medium"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
