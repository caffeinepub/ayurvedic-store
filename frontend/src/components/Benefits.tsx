import { useEffect, useRef, useState } from 'react';
import { Leaf, ShieldCheck, Sparkles, FlaskConical, Heart, Sun } from 'lucide-react';

const benefits = [
  {
    icon: Leaf,
    title: '100% Natural',
    description:
      'Every ingredient is sourced directly from nature — no synthetic additives, no artificial fragrances. Pure botanical goodness in every product.',
    color: 'text-forest',
    bg: 'bg-forest/10',
  },
  {
    icon: ShieldCheck,
    title: 'Chemical-Free',
    description:
      'We believe your skin deserves only the purest care. Our formulations are completely free from parabens, sulfates, and harmful chemicals.',
    color: 'text-golden',
    bg: 'bg-golden/10',
  },
  {
    icon: Heart,
    title: 'Handmade with Love',
    description:
      'Each product is carefully handcrafted in small batches to preserve the potency of natural ingredients and ensure the highest quality.',
    color: 'text-terracotta',
    bg: 'bg-terracotta/10',
  },
  {
    icon: FlaskConical,
    title: 'Dermatologist Tested',
    description:
      'Our formulations are tested and approved by dermatologists, making them safe for all skin types including sensitive and acne-prone skin.',
    color: 'text-forest',
    bg: 'bg-forest/10',
  },
  {
    icon: Sun,
    title: 'Ancient Recipes',
    description:
      'Rooted in 5,000 years of Ayurvedic wisdom, our recipes are time-tested formulations adapted for modern skincare needs.',
    color: 'text-golden',
    bg: 'bg-golden/10',
  },
  {
    icon: Sparkles,
    title: 'Cruelty-Free',
    description:
      'We are committed to ethical beauty. None of our products are tested on animals — because kindness extends to all living beings.',
    color: 'text-terracotta',
    bg: 'bg-terracotta/10',
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = benefit.icon;

  return (
    <div
      ref={ref}
      className={`glass-card-sage rounded-2xl p-8 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl ${benefit.bg} flex items-center justify-center mb-5`}>
        <Icon className={`w-7 h-7 ${benefit.color}`} />
      </div>
      <h3 className="font-serif text-xl font-bold text-forest mb-3">{benefit.title}</h3>
      <p className="font-sans text-bark/70 text-sm leading-relaxed">{benefit.description}</p>
    </div>
  );
}

export default function Benefits() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: 'oklch(0.62 0.07 148 / 0.12)' }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/generated/benefits-texture.dim_1200x400.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-14 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="font-sans text-golden text-xs font-bold uppercase tracking-[0.25em] mb-3">
            Why Choose Us
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest mb-4">
            The Nature Glow Promise
          </h2>
          <div className="golden-divider w-32 mx-auto mb-4" />
          <p className="font-sans text-bark/60 text-lg max-w-xl mx-auto">
            We believe beauty should be pure, honest, and rooted in nature's wisdom.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
