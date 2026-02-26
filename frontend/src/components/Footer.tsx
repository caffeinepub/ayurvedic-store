import { Link } from '@tanstack/react-router';
import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'nature-glow');

  return (
    <footer className="bg-forest text-cream/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-cream" />
              </div>
              <span className="font-serif text-xl font-bold text-cream">Nature Glow</span>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed">
              Pure Ayurvedic skincare rooted in ancient wisdom. Crafted with love for your skin's
              natural radiance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-cream font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-cream/60 hover:text-cream transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-sm text-cream/60 hover:text-cream transition-colors"
                >
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-cream font-semibold mb-4">Contact</h3>
            <p className="text-sm text-cream/60">support@natureglow.com</p>
            <p className="text-sm text-cream/60 mt-1">+91 98765 43210</p>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/40">
            © {year} Nature Glow. All rights reserved.
          </p>
          <p className="text-xs text-cream/40 flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-terracotta fill-terracotta" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/60 hover:text-cream transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
