import SeedProducts from '../components/SeedProducts';
import FeaturedProducts from '../components/FeaturedProducts';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import AboutAyurveda from '../components/AboutAyurveda';
import { useNavigate } from '@tanstack/react-router';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      <SeedProducts />

      {/* Static Photorealistic Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/assets/generated/ayurvedic_hero_photo.dim_1920x900.jpg"
          alt="Ayurvedic herbal facepack with natural ingredients"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-bark/80 via-bark/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/60 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start justify-center py-20">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p className="text-golden font-sans text-sm md:text-base uppercase tracking-widest mb-4 font-semibold">
              Pure · Natural · Ayurvedic
            </p>

            {/* Headline */}
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
              Glow with{' '}
              <span className="text-golden">Nature's</span>{' '}
              Wisdom
            </h1>

            {/* Subheadline */}
            <p className="font-sans text-cream/90 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Handcrafted Ayurvedic facepacks made from ancient herbal recipes — turmeric, neem, sandalwood, and rose — for radiant, healthy skin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate({ to: '/shop' })}
                className="px-8 py-4 bg-golden text-bark font-sans font-semibold text-base rounded-none hover:bg-golden/90 transition-colors duration-200 shadow-lg"
              >
                Shop Now
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-cream text-cream font-sans font-semibold text-base rounded-none hover:bg-cream/10 transition-colors duration-200"
              >
                Explore Products
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: '🌿', label: '100% Natural' },
                { icon: '✨', label: 'Chemical-Free' },
                { icon: '🏺', label: 'Ancient Recipes' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <span className="text-xl">{badge.icon}</span>
                  <span className="font-sans text-cream/80 text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="font-sans text-cream/60 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-cream/40" />
        </div>
      </section>

      <div id="products">
        <FeaturedProducts />
      </div>
      <Benefits />
      <Testimonials />
      <AboutAyurveda />
    </div>
  );
}
