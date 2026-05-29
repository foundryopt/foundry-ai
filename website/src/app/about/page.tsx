import type { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { team } from '@/data/team';

export const metadata: Metadata = {
  title: 'About — SHB Studio',
  description:
    'Learn about SHB Studio, our team, and our approach to architecture and design.',
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <p className="text-accent mb-4">About Us</p>
              <h1 className="font-serif text-display-lg md:text-display-xl">
                The Studio
              </h1>
            </div>
            <div className="lg:pt-12">
              <p className="text-lg leading-relaxed text-warm-gray">
                SHB Studio is an architecture and interior design practice
                dedicated to creating spaces that inspire, elevate, and endure.
                Founded on the belief that great design improves lives, we bring
                craft, care, and creativity to every project.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=80"
                alt="SHB Studio office"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-accent mb-4">Our Story</p>
              <h2 className="font-serif text-display-md mb-8">
                Design with purpose
              </h2>
              <div className="space-y-6 text-warm-gray leading-relaxed">
                <p>
                  Established in 2001, SHB Studio has grown from a small practice
                  into a recognized name in Canadian architecture. Our work spans
                  residential, commercial, hospitality, and adaptive reuse
                  projects across Ontario and beyond.
                </p>
                <p>
                  We believe architecture should be both timeless and of its
                  time—rooted in craft and material truth, yet responsive to how
                  people live today. Every project begins with listening and ends
                  with spaces that exceed expectations.
                </p>
                <p>
                  Our studio operates as a close-knit team where collaboration is
                  valued and every voice contributes to the design process. This
                  approach ensures that our projects benefit from diverse
                  perspectives and rigorous thinking.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="section-padding bg-charcoal text-cream">
        <Container>
          <p className="text-accent text-cream/60 mb-4">Our Values</p>
          <h2 className="font-serif text-display-md mb-16 max-w-2xl">
            What guides our practice
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-serif text-xl mb-4">Craft</h3>
              <p className="text-cream/70 leading-relaxed">
                We believe in the importance of how things are made. Every detail
                matters, from the overall form to the smallest junction.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-4">Context</h3>
              <p className="text-cream/70 leading-relaxed">
                Architecture exists in relationship to its surroundings. We design
                buildings that respond to place, climate, and culture.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-4">Collaboration</h3>
              <p className="text-cream/70 leading-relaxed">
                Great design emerges from dialogue. We partner closely with
                clients, consultants, and builders throughout the process.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="section-padding bg-cream">
        <Container>
          <p className="text-accent mb-4">Our Team</p>
          <h2 className="font-serif text-display-md mb-16">The people</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <article key={member.id}>
                <div className="aspect-[3/4] relative overflow-hidden bg-light-gray">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-600"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="font-serif text-xl">{member.name}</h3>
                  <p className="text-accent mt-1 mb-3">{member.role}</p>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-padding bg-light-gray/30 text-center">
        <Container>
          <h2 className="font-serif text-display-sm mb-6">
            Join us in creating something beautiful
          </h2>
          <Button href="/contact">Get in Touch</Button>
        </Container>
      </section>
    </>
  );
}
