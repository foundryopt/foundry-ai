import Container from '@/components/ui/Container';

export default function Philosophy() {
  return (
    <section className="section-padding bg-charcoal text-cream">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent text-cream/60 mb-8">Our Philosophy</p>
          <blockquote className="font-serif text-display-sm md:text-display-md leading-tight">
            &ldquo;We believe architecture should be both timeless and of its
            time — rooted in craft and material truth, yet responsive to how
            people live today.&rdquo;
          </blockquote>
          <p className="mt-8 text-warm-gray-light">
            — Sarah Chen, Principal Architect
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="text-center">
            <p className="font-serif text-display-lg text-accent-red">25+</p>
            <p className="mt-2 text-cream/60">Years of Practice</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-display-lg text-accent-red">120+</p>
            <p className="mt-2 text-cream/60">Projects Completed</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-display-lg text-accent-red">15</p>
            <p className="mt-2 text-cream/60">Design Awards</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
