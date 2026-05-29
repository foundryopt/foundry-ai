import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { projects, getProjectBySlug } from '@/data/projects';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title} — SHB Studio`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = projects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 2);

  return (
    <>
      {/* Hero Image */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src={project.images[0]}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 to-transparent" />
      </section>

      {/* Content */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <Link href="/projects" className="text-accent link-underline">
                &larr; All Projects
              </Link>
            </nav>

            {/* Title */}
            <p className="text-accent mb-4">
              {project.category} — {project.year}
            </p>
            <h1 className="font-serif text-display-lg md:text-display-xl">
              {project.title}
            </h1>
            <p className="mt-2 text-warm-gray text-lg">{project.location}</p>

            {/* Description */}
            <p className="mt-10 text-xl leading-relaxed">{project.description}</p>

            {/* Details */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-light-gray">
              {project.details.area && (
                <div>
                  <p className="text-accent mb-2">Area</p>
                  <p className="font-medium">{project.details.area}</p>
                </div>
              )}
              {project.details.status && (
                <div>
                  <p className="text-accent mb-2">Status</p>
                  <p className="font-medium">{project.details.status}</p>
                </div>
              )}
              {project.details.client && (
                <div>
                  <p className="text-accent mb-2">Client</p>
                  <p className="font-medium">{project.details.client}</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="pb-16 md:pb-24 bg-cream">
        <Container>
          <div className="space-y-8">
            {project.images.slice(1).map((image, index) => (
              <div key={index} className="relative aspect-video overflow-hidden">
                <Image
                  src={image}
                  alt={`${project.title} - Image ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="section-padding bg-light-gray/30">
          <Container>
            <h2 className="font-serif text-display-sm mb-12">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedProjects.map((related) => (
                <Link
                  key={related.id}
                  href={`/projects/${related.slug}`}
                  className="group block"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={related.image}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-600 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-accent mb-1">{related.category}</p>
                    <h3 className="font-serif text-xl group-hover:text-accent-red transition-colors duration-300">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-charcoal text-cream text-center">
        <Container>
          <h2 className="font-serif text-display-sm mb-6">
            Ready to start your project?
          </h2>
          <Button
            href="/contact"
            className="bg-cream text-charcoal hover:bg-accent-red hover:text-cream"
          >
            Get in Touch
          </Button>
        </Container>
      </section>
    </>
  );
}
