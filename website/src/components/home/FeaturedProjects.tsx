import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import { getFeaturedProjects } from '@/data/projects';

export default function FeaturedProjects() {
  const projects = getFeaturedProjects();

  return (
    <section className="section-padding bg-cream">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <p className="text-accent mb-4">Selected Work</p>
            <h2 className="font-serif text-display-md md:text-display-lg">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="mt-6 md:mt-0 text-accent link-underline"
          >
            View All Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group block"
            >
              <article className="relative">
                <div className="aspect-[4/5] relative overflow-hidden bg-light-gray">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-600 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/20" />
                </div>
                <div className="mt-6">
                  <p className="text-accent mb-2">
                    {project.category} — {project.location}
                  </p>
                  <h3 className="font-serif text-display-sm group-hover:text-accent-red transition-colors duration-300">
                    {project.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
