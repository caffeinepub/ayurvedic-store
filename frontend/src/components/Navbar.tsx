import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
  ];

  const handleCartClick = () => {
    navigate({ to: '/cart' });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-botanical border-b border-sage/15'
          : 'bg-white/90 backdrop-blur-sm border-b border-sage/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center shadow-botanical group-hover:shadow-botanical-lg transition-shadow">
              <Leaf className="w-4 h-4 text-cream" />
            </div>
            <span className="font-serif text-xl font-bold text-forest tracking-wide">
              Nature Glow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-sans text-sm font-medium text-bark hover:text-forest transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-golden after:transition-all after:duration-300 hover:after:w-full"
                activeProps={{ className: 'text-forest font-semibold after:w-full' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="relative p-2.5 text-bark hover:text-forest transition-colors rounded-xl hover:bg-sage/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Go to cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-golden text-forest text-xs rounded-full flex items-center justify-center font-bold px-1 shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 text-bark hover:text-forest rounded-xl hover:bg-sage/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-sage/15 bg-white/98">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans text-sm font-medium text-bark hover:text-forest hover:bg-sage/10 px-4 py-3 rounded-xl transition-colors min-h-[44px] flex items-center"
                  activeProps={{ className: 'text-forest bg-sage/10 font-semibold' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
