import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Warranty Support — SHB Studio',
  description:
    'File a warranty claim or check the status of an existing claim for your SHB Studio project.',
};

export default function WarrantyPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <Container>
          <p className="text-accent mb-4">Support</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            Warranty Portal
          </h1>
          <p className="mt-6 text-warm-gray text-lg max-w-2xl leading-relaxed">
            We stand behind the quality of our work. If you&apos;re experiencing
            an issue with your SHB Studio project, we&apos;re here to help.
          </p>
        </Container>
      </section>

      {/* Action Buttons */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* File New Claim */}
            <div className="bg-white p-10 md:p-12 border border-light-gray text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-charcoal rounded-full">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-display-sm mb-4">File a New Claim</h2>
              <p className="text-warm-gray mb-8 leading-relaxed">
                Submit a warranty claim for issues with materials, workmanship,
                or systems in your project.
              </p>
              <Button href="/warranty/new">File a Claim</Button>
            </div>

            {/* Check Status */}
            <div className="bg-white p-10 md:p-12 border border-light-gray text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-charcoal rounded-full">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-display-sm mb-4">Check Claim Status</h2>
              <p className="text-warm-gray mb-8 leading-relaxed">
                Look up the status of an existing warranty claim using your claim
                number or email address.
              </p>
              <Button href="/warranty/status" variant="outline">
                Check Status
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-light-gray/30">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-display-sm mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <div className="border-b border-light-gray pb-8">
                <h3 className="font-serif text-xl mb-3">
                  What does the warranty cover?
                </h3>
                <p className="text-warm-gray leading-relaxed">
                  Our warranty covers defects in materials and workmanship for the
                  duration specified in your contract. This typically includes
                  structural elements, finishes, and installed systems.
                </p>
              </div>

              <div className="border-b border-light-gray pb-8">
                <h3 className="font-serif text-xl mb-3">
                  What is NOT covered?
                </h3>
                <p className="text-warm-gray leading-relaxed">
                  Normal wear and tear, damage caused by misuse or neglect, and
                  issues arising from unauthorized modifications are not covered.
                  Appliances and equipment may have separate manufacturer
                  warranties.
                </p>
              </div>

              <div className="border-b border-light-gray pb-8">
                <h3 className="font-serif text-xl mb-3">
                  How long does the warranty last?
                </h3>
                <p className="text-warm-gray leading-relaxed">
                  Warranty periods vary by component. Structural elements are
                  typically covered for 10 years, while finishes and systems may
                  have shorter coverage periods. Please refer to your contract for
                  specific terms.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl mb-3">
                  How quickly will my claim be addressed?
                </h3>
                <p className="text-warm-gray leading-relaxed">
                  We aim to acknowledge all claims within 2 business days. Our
                  team will assess the issue and schedule any necessary repairs as
                  quickly as possible, typically within 5-10 business days for
                  non-emergency items.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section className="section-padding bg-charcoal text-cream text-center">
        <Container>
          <h2 className="font-serif text-display-sm mb-4">Need Help?</h2>
          <p className="text-cream/70 mb-6">
            Contact our warranty support team directly at{' '}
            <a
              href="mailto:support@shb.studio"
              className="text-cream underline hover:text-accent-red transition-colors"
            >
              support@shb.studio
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
