import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/generated/hero-botanical.dim_1920x1080.png')" }}
      />
      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/60 to-forest/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />

      {/* Decorative botanical pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.70 0.13 72) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, oklch(0.62 0.07 148) 0%, transparent 40%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-golden/40 bg-golden/10 backdrop-blur-sm transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Leaf className="w-4 h-4 text-golden" />
            <span className="text-golden text-xs font-sans font-semibold uppercase tracking-[0.2em]">
              Pure Ayurvedic Skincare
            </span>
          </div>

          {/* Main headline */}
          <h1
            className={`font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] mb-4 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Nature Glow
          </h1>

          {/* Sub-headline */}
          <h2
            className={`font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-cream/90 leading-snug mb-6 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Radiance Rooted in{' '}
            <span className="text-gradient-gold italic">Ancient Wisdom</span>
          </h2>

          {/* Golden divider */}
          <div
            className={`w-24 h-0.5 bg-golden mb-6 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transformOrigin: 'left' }}
          />

          {/* Description */}
          <p
            className={`font-sans text-cream/80 text-lg leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Discover our handcrafted Ayurvedic face packs and powders, made with pure botanical
            ingredients sourced from the heart of India — for your skin's natural glow.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-700 delay-400 ${
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
            className={`flex flex-wrap gap-6 mt-12 transition-all duration-700 delay-500 ${
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
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-600 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-sans text-cream/50 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
