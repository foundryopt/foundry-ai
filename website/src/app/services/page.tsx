import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { services } from '@/data/team';

export const metadata: Metadata = {
  title: 'Services — SHB Studio',
  description:
    'Architecture, interior design, development consulting, and adaptive reuse services from SHB Studio.',
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <Container>
          <p className="text-accent mb-4">What We Do</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            Services
          </h1>
          <p className="mt-6 text-warm-gray text-lg max-w-2xl leading-relaxed">
            We offer a comprehensive range of design services, from initial
            concept through to final delivery. Our collaborative approach
            ensures every project reflects its unique context and purpose.
          </p>
        </Container>
      </section>

      {/* Services List */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="grid grid-cols-1 gap-0 max-w-4xl">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="py-12 border-t border-light-gray first:border-t-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                  <div className="md:col-span-1">
                    <span className="text-accent">0{index + 1}</span>
                  </div>
                  <div className="md:col-span-4">
                    <h2 className="font-serif text-display-sm">{service.title}</h2>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-warm-gray leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="section-padding bg-charcoal text-cream">
        <Container>
          <div className="max-w-4xl">
            <p className="text-accent text-cream/60 mb-4">Our Process</p>
            <h2 className="font-serif text-display-md mb-16">
              How we work together
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <span className="text-accent-red font-serif text-display-sm">01</span>
                <h3 className="font-serif text-xl mt-4 mb-3">Discovery</h3>
                <p className="text-cream/70 leading-relaxed">
                  We begin by understanding your vision, needs, and constraints.
                  Through conversation and site analysis, we establish the
                  foundation for design.
                </p>
              </div>
              <div>
                <span className="text-accent-red font-serif text-display-sm">02</span>
                <h3 className="font-serif text-xl mt-4 mb-3">Concept</h3>
                <p className="text-cream/70 leading-relaxed">
                  We explore ideas and develop a design concept that responds to
                  context, program, and ambition. Options are presented for your
                  feedback.
                </p>
              </div>
              <div>
                <span className="text-accent-red font-serif text-display-sm">03</span>
                <h3 className="font-serif text-xl mt-4 mb-3">Development</h3>
                <p className="text-cream/70 leading-relaxed">
                  The chosen concept is refined and detailed. Materials, systems,
                  and finishes are selected. Documentation is prepared for
                  approvals and construction.
                </p>
              </div>
              <div>
                <span className="text-accent-red font-serif text-display-sm">04</span>
                <h3 className="font-serif text-xl mt-4 mb-3">Delivery</h3>
                <p className="text-cream/70 leading-relaxed">
                  We oversee construction to ensure design intent is realized.
                  Regular site visits and close collaboration with contractors
                  maintain quality.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-padding bg-cream text-center">
        <Container>
          <h2 className="font-serif text-display-sm mb-6">
            Ready to discuss your project?
          </h2>
          <Button href="/contact">Get in Touch</Button>
        </Container>
      </section>
    </>
  );
}
