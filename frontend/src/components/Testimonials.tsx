import React, { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The Neem Face Pack has completely transformed my skin! My acne has reduced significantly and my skin feels so much cleaner.',
    product: 'Neem Face Pack',
    avatar: 'PS',
  },
  {
    name: 'Ananya Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'I\'ve been using the Sandalwood Glow Cream for 3 months now. My skin tone has evened out and I get so many compliments!',
    product: 'Sandalwood Glow Cream',
    avatar: 'AP',
  },
  {
    name: 'Kavitha Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'The Turmeric Ubtan is absolutely magical. My skin glows like never before. Completely natural and smells divine!',
    product: 'Turmeric Ubtan',
    avatar: 'KR',
  },
  {
    name: 'Meera Nair',
    location: 'Kochi',
    rating: 5,
    text: 'Finally found skincare that actually works without harsh chemicals. The Rose Water Toner is so refreshing and gentle.',
    product: 'Rose Water Toner',
    avatar: 'MN',
  },
  {
    name: 'Sunita Joshi',
    location: 'Pune',
    rating: 5,
    text: 'As someone with sensitive skin, I was skeptical. But Nature Glow products are so gentle yet effective. Highly recommend!',
    product: 'Anti-Acne Gel',
    avatar: 'SJ',
  },
  {
    name: 'Deepa Krishnan',
    location: 'Chennai',
    rating: 5,
    text: 'The packaging is beautiful and eco-friendly. The products smell amazing and my skin has never felt better. Worth every rupee!',
    product: 'Neem Face Pack',
    avatar: 'DK',
  },
];

export default function Testimonials() {
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
      { threshold: 0.1 }
    );
    const cards = sectionRef.current?.querySelectorAll('[data-index]');
    cards?.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-forest/60 text-sm font-medium tracking-widest uppercase mb-2 block">
            Customer Love
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-forest mb-4">
            What Our Customers Say
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-4" />
          <p className="text-forest/70 max-w-xl mx-auto">
            Real stories from real customers who have experienced the Nature Glow difference.
          </p>
        </div>

        {/* Trust Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '50+', label: 'Products' },
            { value: '100%', label: 'Natural Ingredients' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-serif text-3xl text-forest font-bold">{value}</div>
              <div className="text-forest/60 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const isVisible = visibleItems.has(index);
            return (
              <div
                key={testimonial.name}
                data-index={index}
                className={`p-6 rounded-2xl bg-white border border-forest/10 hover:border-gold/30 hover:shadow-botanical transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-forest/75 text-sm leading-relaxed mb-4 italic">
                  "{testimonial.text}"
                </p>

                {/* Product tag */}
                <span className="inline-block px-3 py-1 bg-sage/30 text-forest/70 text-xs rounded-full mb-4">
                  {testimonial.product}
                </span>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center text-forest font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-forest text-sm">{testimonial.name}</div>
                    <div className="text-forest/50 text-xs">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
