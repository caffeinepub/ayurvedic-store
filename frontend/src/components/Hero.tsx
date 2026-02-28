import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ken Burns animated background image — uploaded herbs & spices photo */}
      <div
        className="absolute inset-0 animate-kenburns"
        style={{
          backgroundImage: "url('/assets/3312bc175a87a2f9f067b6b442cc28e4.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/60 to-forest/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/65 via-transparent to-forest/35" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">

          {/* Site name — "Nature Glow" — prominent brand overlay */}
          <div
            className={`mb-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <h1
              className="font-serif font-bold leading-none tracking-wide"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                color: 'oklch(0.70 0.13 72)',
                textShadow:
                  '0 2px 24px oklch(0.28 0.08 148 / 0.7), 0 1px 4px oklch(0.10 0.04 148 / 0.9)',
                letterSpacing: '0.04em',
              }}
            >
              Nature Glow
            </h1>
            {/* Decorative golden underline beneath the brand name */}
            <div
              className={`mt-2 h-[3px] rounded-full transition-all duration-700 delay-150 ${
                mounted ? 'opacity-100 w-48' : 'opacity-0 w-0'
              }`}
              style={{
                background:
                  'linear-gradient(90deg, oklch(0.70 0.13 72), oklch(0.70 0.13 72 / 0))',
                transition: 'width 0.8s ease 0.15s, opacity 0.7s ease 0.15s',
              }}
            />
          </div>

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-golden/40 bg-golden/10 backdrop-blur-sm transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-golden text-xs font-sans font-semibold uppercase tracking-[0.2em]">
              🌿 Pure Ayurvedic Skincare
            </span>
          </div>

          {/* Sub-headline */}
          <h2
            className={`font-serif text-2xl sm:text-3xl font-medium text-cream leading-snug mb-4 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Ancient Wisdom for Modern Living
          </h2>

          {/* Golden divider */}
          <div
            className={`w-32 h-px mb-5 transition-all duration-700 delay-350 ${
              mounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{
              background: 'oklch(0.97 0.012 85)',
              transformOrigin: 'left',
            }}
          />

          {/* Tagline */}
          <p
            className={`font-serif text-xl sm:text-2xl font-medium mb-6 transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: 'oklch(0.97 0.012 85)' }}
          >
            Unlock Your Natural Radiance
          </p>

          {/* Description */}
          <p
            className={`font-sans text-cream/80 text-lg leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-450 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Discover our handcrafted Ayurvedic face packs and powders, made with pure botanical
            ingredients sourced from the heart of India — for your skin's natural glow.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link to="/shop">
              <button className="group inline-flex items-center gap-2 bg-golden hover:bg-golden/90 text-forest font-sans font-bold px-8 py-4 rounded-full text-base transition-all duration-300 shadow-golden hover:shadow-golden hover:scale-105 min-h-[52px]">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#about-ayurveda">
              <button className="inline-flex items-center gap-2 border-2 border-cream/50 hover:border-cream text-cream font-sans font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 hover:bg-cream/10 min-h-[52px]">
                <Sparkles className="w-4 h-4" />
                Our Story
              </button>
            </a>
          </div>

          {/* Trust indicators */}
          <div
            className={`flex flex-wrap gap-8 mt-12 transition-all duration-700 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {[
              { value: '100%', label: 'Natural' },
              { value: 'Chemical', label: 'Free' },
              { value: 'Hand', label: 'Crafted' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl font-bold text-golden">{stat.value}</div>
                <div className="font-sans text-cream/70 text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-700 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-sans text-cream/50 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
