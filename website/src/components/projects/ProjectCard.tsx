import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectCard({ project, priority }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <article className="relative">
        <div className="aspect-[4/5] relative overflow-hidden bg-light-gray">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-600 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/20" />
        </div>
        <div className="mt-6">
          <p className="text-accent mb-2">
            {project.category} — {project.year}
          </p>
          <h3 className="font-serif text-display-sm group-hover:text-accent-red transition-colors duration-300">
            {project.title}
          </h3>
          <p className="mt-2 text-warm-gray">{project.location}</p>
        </div>
      </article>
    </Link>
  );
}
