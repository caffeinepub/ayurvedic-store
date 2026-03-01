import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Leaf, Star, Shield, Sparkles } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBenefits = () => {
    const el = document.getElementById('benefits');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ken Burns background */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-kenburns"
        style={{
          backgroundImage: `url('/assets/generated/hero-spices.dim_1920x1080.jpg')`,
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest/50 to-forest-deep/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 via-transparent to-forest-deep/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/40 text-gold text-sm font-medium mb-6 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Leaf className="w-4 h-4" />
          100% Natural Ayurvedic Skincare
        </div>

        {/* Brand name */}
        <h1
          className={`font-serif text-6xl md:text-8xl text-cream mb-2 transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Nature{' '}
          <span className="text-gold relative">
            Glow
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
          </span>
        </h1>

        {/* Tagline */}
        <p
          className={`font-serif text-xl md:text-2xl text-cream/80 italic mb-4 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Ancient Wisdom, Modern Radiance
        </p>

        {/* Description */}
        <p
          className={`text-cream/70 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Handcrafted Ayurvedic face packs and skincare products made with pure botanical
          ingredients. Reveal your skin's natural radiance with centuries-old wisdom.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="px-8 py-4 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-full text-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5"
          >
            Shop Now
          </button>
          <button
            onClick={scrollToBenefits}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-cream font-semibold rounded-full text-lg border border-white/30 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
          >
            Learn More
          </button>
        </div>

        {/* Trust badges */}
        <div
          className={`flex flex-wrap justify-center gap-6 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {[
            { icon: Star, text: '4.9★ Rating' },
            { icon: Shield, text: 'Chemical-Free' },
            { icon: Sparkles, text: 'Dermatologist Tested' },
            { icon: Leaf, text: 'Cruelty-Free' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-cream/70 text-sm"
            >
              <Icon className="w-4 h-4 text-gold" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
