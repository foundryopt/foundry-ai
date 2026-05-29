import Link from 'next/link';

const footerLinks = {
  studio: [
    { name: 'Projects', href: '/projects' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Warranty', href: '/warranty' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container-site section-padding">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="font-serif text-3xl tracking-tight">
              SHB Studio
            </Link>
            <p className="mt-6 text-warm-gray-light max-w-sm leading-relaxed">
              Creating timeless architecture and interior spaces that inspire,
              elevate, and endure.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-accent text-cream/60 mb-6">Studio</h4>
            <ul className="space-y-4">
              {footerLinks.studio.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/80 hover:text-cream transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h4 className="text-accent text-cream/60 mb-6">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/80 hover:text-cream transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="text-accent text-cream/60 mb-6">Contact</h4>
            <div className="space-y-4 text-cream/80">
              <p>
                <a
                  href="mailto:hello@shb.studio"
                  className="hover:text-cream transition-colors duration-300"
                >
                  hello@shb.studio
                </a>
              </p>
              <p>
                <a
                  href="tel:+14165551234"
                  className="hover:text-cream transition-colors duration-300"
                >
                  +1 416 555 1234
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/40 text-sm">
            &copy; {new Date().getFullYear()} SHB Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a
              href="https://instagram.com/shbstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/40 hover:text-cream transition-colors duration-300 text-sm"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com/company/shbstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/40 hover:text-cream transition-colors duration-300 text-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
