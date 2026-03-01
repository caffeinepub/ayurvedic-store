import React, { useRef, useEffect, useState } from 'react';
import { Leaf, Droplets, BookOpen, Recycle, Heart, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'Every ingredient is sourced from nature — no synthetic additives, no compromises.',
  },
  {
    icon: Droplets,
    title: 'Chemical-Free',
    description: 'Free from parabens, sulfates, and harsh chemicals that damage your skin barrier.',
  },
  {
    icon: BookOpen,
    title: 'Ayurvedic Wisdom',
    description: 'Formulated using ancient Ayurvedic texts and time-tested botanical knowledge.',
  },
  {
    icon: Recycle,
    title: 'Sustainable',
    description: 'Eco-friendly packaging and ethically sourced ingredients for a greener planet.',
  },
  {
    icon: Heart,
    title: 'Cruelty-Free',
    description: 'Never tested on animals. We believe beauty should be kind to all living beings.',
  },
  {
    icon: Sparkles,
    title: 'Handcrafted',
    description: 'Each batch is carefully handcrafted in small quantities to ensure premium quality.',
  },
];

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-index]');
    cards?.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="benefits" ref={sectionRef} className="py-20 bg-sage/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-forest/60 text-sm font-medium tracking-widest uppercase mb-2 block">
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-forest mb-4">
            The Nature Glow Difference
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-4" />
          <p className="text-forest/70 max-w-xl mx-auto">
            We believe that the best skincare comes from nature. Here's what makes
            our products truly special.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isVisible = visibleItems.has(index);
            return (
              <div
                key={benefit.title}
                data-index={index}
                className={`group p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-forest/10 hover:border-gold/40 hover:shadow-botanical transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-forest/10 group-hover:bg-gold/20 flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-forest group-hover:text-gold transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-xl text-forest mb-2">{benefit.title}</h3>
                <p className="text-forest/65 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
