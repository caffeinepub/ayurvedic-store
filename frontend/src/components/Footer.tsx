import { Link } from '@tanstack/react-router';
import { Leaf, Heart, Mail, Phone, MapPin, Instagram } from 'lucide-react';
import { SiInstagram, SiFacebook, SiYoutube } from 'react-icons/si';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'nature-glow');

  return (
    <footer className="bg-forest text-cream/80 mt-auto">
      {/* Golden top divider */}
      <div className="golden-divider w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-golden/20 border border-golden/30 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-golden" />
              </div>
              <span className="font-serif text-2xl font-bold text-cream tracking-wide">
                Nature Glow
              </span>
            </div>
            <p className="font-sans text-sm text-cream/55 leading-relaxed mb-6">
              Pure Ayurvedic skincare rooted in 5,000 years of ancient wisdom. Crafted with love
              for your skin's natural radiance.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: SiInstagram, label: 'Instagram' },
                { Icon: SiFacebook, label: 'Facebook' },
                { Icon: SiYoutube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center text-cream/50 hover:text-golden hover:border-golden/50 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-cream font-semibold text-base mb-5 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Shop', to: '/shop' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-sans text-sm text-cream/55 hover:text-golden transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-golden transition-all duration-200 overflow-hidden" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Products */}
          <div>
            <h3 className="font-serif text-cream font-semibold text-base mb-5 tracking-wide">
              Our Products
            </h3>
            <ul className="space-y-3">
              {[
                'Ubtan Face Pack',
                'Anti-Acne Pack',
                'Sandalwood Powder',
                'Neem Powder',
              ].map((product) => (
                <li key={product}>
                  <Link
                    to="/shop"
                    className="font-sans text-sm text-cream/55 hover:text-golden transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-golden transition-all duration-200 overflow-hidden" />
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-cream font-semibold text-base mb-5 tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-golden mt-0.5 flex-shrink-0" />
                <span className="font-sans text-sm text-cream/55">support@natureglow.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-golden mt-0.5 flex-shrink-0" />
                <span className="font-sans text-sm text-cream/55">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-golden mt-0.5 flex-shrink-0" />
                <span className="font-sans text-sm text-cream/55">
                  Mumbai, Maharashtra, India
                </span>
              </li>
            </ul>

            {/* Newsletter hint */}
            <div className="mt-6 p-4 rounded-xl border border-golden/20 bg-golden/5">
              <p className="font-sans text-xs text-cream/50 leading-relaxed">
                🌿 Free shipping on orders above ₹499. Use code{' '}
                <span className="text-golden font-semibold">NATURE10</span> for 10% off your first
                order.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-cream/35">
            © {year} Nature Glow. All rights reserved. | Pure Ayurvedic Skincare
          </p>
          <p className="font-sans text-xs text-cream/35 flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-golden fill-golden" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-golden transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
