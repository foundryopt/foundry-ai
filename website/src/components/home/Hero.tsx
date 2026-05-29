'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-charcoal/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-site text-center text-cream">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-accent text-cream/80 mb-6">Architecture & Design</p>
          <h1 className="font-serif text-display-lg md:text-display-xl mb-8 max-w-4xl mx-auto">
            Creating spaces that inspire
          </h1>
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            We design architecture and interiors that elevate the human
            experience, crafting timeless environments where life unfolds
            beautifully.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/projects"
              className="bg-cream text-charcoal hover:bg-accent-red hover:text-cream"
            >
              View Our Work
            </Button>
            <Button href="/contact" variant="outline" className="border-cream text-cream hover:bg-cream hover:text-charcoal">
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-cream/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-cream animate-pulse" />
        </div>
      </div>
    </section>
  );
}
