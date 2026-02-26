import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
  ];

  const handleCartClick = () => {
    navigate({ to: '/cart' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 text-cream" />
            </div>
            <span className="font-serif text-xl font-bold text-forest tracking-wide">
              Nature Glow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-bark hover:text-forest transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-forest after:transition-all hover:after:w-full"
                activeProps={{ className: 'text-forest font-semibold' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Icon → navigates to /cart */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-bark hover:text-forest transition-colors rounded-lg hover:bg-sage/10"
              aria-label="Go to cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-forest text-cream text-xs rounded-full flex items-center justify-center font-bold px-1 shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-bark hover:text-forest rounded-lg hover:bg-sage/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-sage/20">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-bark hover:text-forest hover:bg-sage/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setMobileOpen(false); handleCartClick(); }}
                className="text-sm font-medium text-bark hover:text-forest hover:bg-sage/10 px-3 py-2 rounded-lg transition-colors text-left flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {totalItems > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 bg-forest text-cream text-xs rounded-full flex items-center justify-center font-bold px-1">
                    {totalItems}
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
