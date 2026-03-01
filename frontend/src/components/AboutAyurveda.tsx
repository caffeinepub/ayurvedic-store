import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function AboutAyurveda() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLeftVisible(true);
          setTimeout(() => setRightVisible(true), 200);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-forest text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div
            className={`transition-all duration-700 ${
              leftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <span className="text-gold/70 text-sm font-medium tracking-widest uppercase mb-2 block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
              The Art of{' '}
              <span className="text-gold">Ayurveda</span>
            </h2>
            <div className="w-16 h-0.5 bg-gold mb-6" />
            <p className="text-cream/75 leading-relaxed mb-6">
              Ayurveda, the ancient Indian science of life, has guided holistic wellness for over
              5,000 years. At Nature Glow, we honor this wisdom by crafting skincare that works
              in harmony with your body's natural rhythms.
            </p>
            <p className="text-cream/75 leading-relaxed mb-8">
              Our formulations are rooted in the three doshas — Vata, Pitta, and Kapha — ensuring
              that each product addresses your unique skin type and concerns with precision and care.
            </p>

            {/* Doshas */}
            <div className="space-y-4 mb-8">
              {[
                { name: 'Vata', desc: 'Nourishing formulas for dry, delicate skin types', color: 'text-blue-300' },
                { name: 'Pitta', desc: 'Cooling botanicals to calm sensitive, reactive skin', color: 'text-orange-300' },
                { name: 'Kapha', desc: 'Purifying herbs to balance oily, congested skin', color: 'text-green-300' },
              ].map(({ name, desc, color }) => (
                <div key={name} className="flex items-start gap-3">
                  <span className={`font-serif text-lg font-bold ${color} w-16 flex-shrink-0`}>{name}</span>
                  <span className="text-cream/65 text-sm leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate({ to: '/shop' })}
              className="px-8 py-3 bg-gold hover:bg-gold-dark text-forest font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold/30"
            >
              Explore Our Products
            </button>
          </div>

          {/* Right Column */}
          <div
            className={`transition-all duration-700 ${
              rightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative">
              <img
                src="/assets/generated/about-ayurveda.dim_800x600.png"
                alt="Ayurvedic ingredients"
                className="rounded-2xl w-full object-cover shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/herbs-spices-flatlay.dim_1920x1080.jpg';
                }}
              />
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl">
                <div className="text-gold font-serif text-2xl font-bold">5000+</div>
                <div className="text-cream/70 text-xs">Years of Ayurvedic Wisdom</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
