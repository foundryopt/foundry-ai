import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Contact — SHB Studio',
  description:
    'Get in touch with SHB Studio to discuss your architecture or design project.',
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <Container>
          <p className="text-accent mb-4">Get in Touch</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            Contact
          </h1>
          <p className="mt-6 text-warm-gray text-lg max-w-2xl leading-relaxed">
            We&apos;d love to hear about your project. Reach out to start a
            conversation.
          </p>
        </Container>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Form */}
            <div>
              <h2 className="font-serif text-display-sm mb-8">
                Send us a message
              </h2>
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Name" name="name" required />
                  <Input label="Email" name="email" type="email" required />
                </div>
                <Input label="Phone" name="phone" type="tel" />
                <Input label="Subject" name="subject" />
                <Input
                  label="Tell us about your project"
                  name="message"
                  type="textarea"
                  rows={6}
                  required
                />
                <Button type="submit">Send Message</Button>
              </form>
            </div>

            {/* Info */}
            <div>
              <h2 className="font-serif text-display-sm mb-8">Visit us</h2>

              <div className="space-y-12">
                <div>
                  <p className="text-accent mb-3">Address</p>
                  <address className="not-italic text-lg leading-relaxed">
                    123 Design Street
                    <br />
                    Suite 400
                    <br />
                    Toronto, ON M5V 1A1
                    <br />
                    Canada
                  </address>
                </div>

                <div>
                  <p className="text-accent mb-3">Contact</p>
                  <div className="space-y-2 text-lg">
                    <p>
                      <a
                        href="mailto:hello@shb.studio"
                        className="link-underline"
                      >
                        hello@shb.studio
                      </a>
                    </p>
                    <p>
                      <a href="tel:+14165551234" className="link-underline">
                        +1 416 555 1234
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-accent mb-3">Hours</p>
                  <p className="text-lg">
                    Monday – Friday
                    <br />
                    9:00 AM – 6:00 PM
                  </p>
                </div>

                <div>
                  <p className="text-accent mb-3">Follow</p>
                  <div className="flex gap-6">
                    <a
                      href="https://instagram.com/shbstudio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://linkedin.com/company/shbstudio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map placeholder */}
      <section className="h-96 bg-light-gray flex items-center justify-center">
        <p className="text-warm-gray">Map integration placeholder</p>
      </section>
    </>
  );
}
