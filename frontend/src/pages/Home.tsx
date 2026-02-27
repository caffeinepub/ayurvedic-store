import SeedProducts from '../components/SeedProducts';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import AboutAyurveda from '../components/AboutAyurveda';

export default function Home() {
  return (
    <div className="bg-background">
      <SeedProducts />
      <Hero />
      <FeaturedProducts />
      <Benefits />
      <Testimonials />
      <AboutAyurveda />
    </div>
  );
}
