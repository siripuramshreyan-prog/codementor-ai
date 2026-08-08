import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { TrustedBy } from '../components/sections/TrustedBy';
import { Features } from '../components/sections/Features';
import { Stats } from '../components/sections/Stats';
import { Roadmap } from '../components/sections/Roadmap';
import { Testimonials } from '../components/sections/Testimonials';
import { Pricing } from '../components/sections/Pricing';
import { FAQ } from '../components/sections/FAQ';
import { CTA } from '../components/sections/CTA';

export default function Landing() {
  useEffect(() => {
    if (!window.location.hash) return;
    // Runs after the initial paint so the target section exists in the DOM.
    const id = window.location.hash;
    const timeout = window.setTimeout(() => {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-void">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Stats />
      <Roadmap />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
