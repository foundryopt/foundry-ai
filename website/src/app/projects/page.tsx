import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/projects/ProjectCard';
import { projects, getProjectCategories } from '@/data/projects';

export const metadata: Metadata = {
  title: 'Projects — SHB Studio',
  description:
    'Explore our portfolio of residential, commercial, and hospitality architecture and design projects.',
};

export default function ProjectsPage() {
  const categories = getProjectCategories();

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <Container>
          <p className="text-accent mb-4">Our Work</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            Projects
          </h1>
          <p className="mt-6 text-warm-gray text-lg max-w-2xl leading-relaxed">
            A selection of residential, commercial, and hospitality projects
            that demonstrate our commitment to design excellence and
            craftsmanship.
          </p>
        </Container>
      </section>

      {/* Projects Grid */}
      <section className="section-padding bg-cream">
        <Container>
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button className="px-4 py-2 text-sm font-medium bg-charcoal text-cream rounded-full">
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 text-sm font-medium text-charcoal border border-charcoal rounded-full hover:bg-charcoal hover:text-cream transition-colors duration-300"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                priority={index < 3}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
