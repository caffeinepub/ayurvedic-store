import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import AboutAyurveda from '../components/AboutAyurveda';
import SeedProducts from '../components/SeedProducts';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <SeedProducts />
      <Hero />
      <FeaturedProducts />
      <Benefits />
      <Testimonials />
      <AboutAyurveda />
    </div>
  );
}
