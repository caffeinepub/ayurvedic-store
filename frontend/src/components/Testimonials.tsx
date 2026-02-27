import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    rating: 5,
    quote:
      'The Ubtan Face Pack has completely transformed my skin! After just two weeks of use, my complexion is visibly brighter and my skin feels incredibly soft. I love that it\'s made with pure, natural ingredients.',
    product: 'Ubtan Face Pack',
    avatar: 'PS',
  },
  {
    name: 'Ananya Krishnan',
    location: 'Bangalore, India',
    rating: 5,
    quote:
      'I\'ve struggled with acne for years and tried countless products. The Anti-Acne Pack from Nature Glow is the only thing that has genuinely helped. My skin is clearer than it\'s been in a decade!',
    product: 'Anti-Acne Pack',
    avatar: 'AK',
  },
  {
    name: 'Meera Patel',
    location: 'Ahmedabad, India',
    rating: 5,
    quote:
      'Pure Sandalwood Powder is absolutely divine. The fragrance is authentic and the cooling effect on my skin is unmatched. I use it as a face mask every weekend — it\'s become my self-care ritual.',
    product: 'Pure Sandalwood Powder',
    avatar: 'MP',
  },
  {
    name: 'Deepika Nair',
    location: 'Chennai, India',
    rating: 5,
    quote:
      'What I love most about Nature Glow is the transparency. You can see and smell the real ingredients. The Neem Powder has helped control my oily skin without stripping it of moisture.',
    product: 'Neem Powder',
    avatar: 'DN',
  },
  {
    name: 'Sunita Verma',
    location: 'Delhi, India',
    rating: 5,
    quote:
      'I gifted the Ubtan Face Pack to my mother and she absolutely loves it. She says it reminds her of the traditional beauty rituals her grandmother used to follow. Truly authentic Ayurvedic care.',
    product: 'Ubtan Face Pack',
    avatar: 'SV',
  },
  {
    name: 'Kavitha Reddy',
    location: 'Hyderabad, India',
    rating: 5,
    quote:
      'The quality is exceptional and the packaging is beautiful. Every product feels premium and luxurious. Nature Glow has become my go-to brand for all my skincare needs.',
    product: 'Multiple Products',
    avatar: 'KR',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-golden fill-golden' : 'text-bark/20'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl p-7 shadow-botanical hover:shadow-botanical-lg transition-all duration-500 flex flex-col ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Quote icon */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-golden/40 fill-golden/20" />
      </div>

      {/* Rating */}
      <StarRating rating={testimonial.rating} />

      {/* Quote text */}
      <p className="font-sans text-bark/75 text-sm leading-relaxed mt-4 flex-1 italic">
        "{testimonial.quote}"
      </p>

      {/* Product tag */}
      <div className="mt-4 mb-5">
        <span className="inline-block bg-sage/15 text-forest text-xs font-sans font-semibold px-3 py-1 rounded-full">
          {testimonial.product}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-bark/10">
        <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-cream text-sm font-bold">{testimonial.avatar}</span>
        </div>
        <div>
          <p className="font-serif font-semibold text-forest text-sm">{testimonial.name}</p>
          <p className="font-sans text-bark/50 text-xs">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
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
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-14 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="font-sans text-golden text-xs font-bold uppercase tracking-[0.25em] mb-3">
            Customer Love
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest mb-4">
            What Our Customers Say
          </h2>
          <div className="golden-divider w-32 mx-auto mb-4" />
          <p className="font-sans text-bark/60 text-lg max-w-xl mx-auto">
            Real stories from real people who have experienced the power of Ayurvedic skincare.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Trust stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '100%', label: 'Natural Ingredients' },
            { value: '5★', label: 'Verified Reviews' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-white shadow-botanical">
              <div className="font-serif text-3xl font-bold text-golden mb-1">{stat.value}</div>
              <div className="font-sans text-bark/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
