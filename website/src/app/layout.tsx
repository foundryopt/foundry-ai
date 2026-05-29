import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SHB Studio — Architecture & Design',
  description: 'Premium architecture and interior design studio creating timeless spaces that inspire.',
  keywords: ['architecture', 'design', 'interior design', 'luxury', 'development'],
  openGraph: {
    title: 'SHB Studio — Architecture & Design',
    description: 'Premium architecture and interior design studio creating timeless spaces that inspire.',
    url: 'https://www.shb.studio',
    siteName: 'SHB Studio',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
