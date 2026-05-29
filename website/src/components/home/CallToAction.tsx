import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function CallToAction() {
  return (
    <section className="section-padding bg-cream">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent mb-4">Start a Conversation</p>
          <h2 className="font-serif text-display-md md:text-display-lg mb-6">
            Let&apos;s create something remarkable together
          </h2>
          <p className="text-warm-gray text-lg leading-relaxed mb-10">
            Whether you&apos;re envisioning a new home, a commercial space, or a
            transformative renovation, we&apos;d love to hear about your project.
          </p>
          <Button href="/contact">Get in Touch</Button>
        </div>
      </Container>
    </section>
  );
}
