import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Leaf } from 'lucide-react';

const pillars = [
  { title: 'Vata', desc: 'Air & Space — governs movement and creativity' },
  { title: 'Pitta', desc: 'Fire & Water — governs transformation and metabolism' },
  { title: 'Kapha', desc: 'Earth & Water — governs structure and stability' },
];

export default function AboutAyurveda() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);

  useEffect(() => {
    const leftObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLeftVisible(true);
          leftObserver.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    const rightObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRightVisible(true);
          rightObserver.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (leftRef.current) leftObserver.observe(leftRef.current);
    if (rightRef.current) rightObserver.observe(rightRef.current);
    return () => {
      leftObserver.disconnect();
      rightObserver.disconnect();
    };
  }, []);

  return (
    <section id="about-ayurveda" className="py-20 bg-parchment overflow-hidden">
      {/* Golden top divider */}
      <div className="golden-divider w-full mb-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text content */}
          <div
            ref={leftRef}
            className={`transition-all duration-800 ease-out ${
              leftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <p className="font-sans text-golden text-xs font-bold uppercase tracking-[0.25em] mb-4">
              Our Philosophy
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest leading-tight mb-6">
              The Ancient Science of{' '}
              <span className="italic text-gradient-gold">Ayurveda</span>
            </h2>

            {/* Golden accent line */}
            <div className="w-20 h-0.5 bg-golden mb-6" />

            <p className="font-sans text-bark/75 text-base leading-relaxed mb-5">
              Ayurveda — the "Science of Life" — is a 5,000-year-old holistic healing system that
              originated in ancient India. It teaches us that true beauty comes from within, and
              that the skin is a reflection of our inner health and harmony.
            </p>
            <p className="font-sans text-bark/75 text-base leading-relaxed mb-5">
              At Nature Glow, we honor this ancient wisdom by crafting skincare products that work
              in harmony with your body's natural rhythms. Every ingredient we use has been
              celebrated in Ayurvedic texts for centuries — turmeric for its anti-inflammatory
              properties, sandalwood for its cooling and brightening effects, neem for its
              purifying power.
            </p>
            <p className="font-sans text-bark/75 text-base leading-relaxed mb-8">
              We believe that the best skincare is not about masking imperfections, but about
              nurturing your skin back to its natural state of balance and radiance.
            </p>

            {/* Three Doshas */}
            <div className="space-y-3 mb-8">
              <p className="font-serif text-forest font-semibold text-sm uppercase tracking-wider mb-3">
                The Three Doshas
              </p>
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-golden mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-forest text-sm">{pillar.title}</span>
                    <span className="font-sans text-bark/60 text-sm"> — {pillar.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/shop">
              <button className="group inline-flex items-center gap-2 bg-forest hover:bg-forest/90 text-cream font-sans font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-300 hover:shadow-botanical-lg min-h-[48px]">
                Explore Our Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Right: Image */}
          <div
            ref={rightRef}
            className={`relative transition-all duration-800 ease-out delay-200 ${
              rightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-botanical-lg">
              <img
                src="/assets/generated/about-ayurveda.dim_800x600.png"
                alt="Ayurvedic herbs and ingredients"
                className="w-full h-full object-cover"
                style={{ minHeight: '400px' }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/30 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-5 shadow-golden max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-forest" />
                <span className="font-serif text-forest font-bold text-sm">5000+ Years</span>
              </div>
              <p className="font-sans text-bark/70 text-xs leading-relaxed">
                Of Ayurvedic wisdom in every product we craft
              </p>
            </div>

            {/* Decorative golden circle */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2 border-golden/30 opacity-60"
            />
            <div
              className="absolute -top-2 -right-2 w-16 h-16 rounded-full border border-golden/20 opacity-40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
