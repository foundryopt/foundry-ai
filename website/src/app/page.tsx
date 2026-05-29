import Hero from '@/components/home/Hero';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import Philosophy from '@/components/home/Philosophy';
import CallToAction from '@/components/home/CallToAction';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <Philosophy />
      <CallToAction />
    </>
  );
}
