export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  image: string;
  images: string[];
  featured: boolean;
  details: {
    area?: string;
    status?: string;
    client?: string;
  };
}

export const projects: Project[] = [
  {
    id: '1',
    slug: 'harbourview-residence',
    title: 'Harbourview Residence',
    category: 'Residential',
    location: 'Toronto, ON',
    year: '2025',
    description:
      'A waterfront penthouse where every detail celebrates the panoramic harbour views. Floor-to-ceiling glass, warm timber accents, and a seamless indoor-outdoor flow create a sanctuary of contemporary elegance.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
    ],
    featured: true,
    details: {
      area: '4,200 sq ft',
      status: 'Completed',
      client: 'Private',
    },
  },
  {
    id: '2',
    slug: 'the-annex-tower',
    title: 'The Annex Tower',
    category: 'Multi-Residential',
    location: 'Toronto, ON',
    year: '2024',
    description:
      'A 32-storey residential tower that reimagines urban living. Sculpted balconies, a vertical garden facade, and thoughtfully designed amenity spaces define this landmark development.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80',
    ],
    featured: true,
    details: {
      area: '320,000 sq ft',
      status: 'Completed',
      client: 'SHB Group',
    },
  },
  {
    id: '3',
    slug: 'king-west-lofts',
    title: 'King West Lofts',
    category: 'Adaptive Reuse',
    location: 'Toronto, ON',
    year: '2024',
    description:
      'Heritage warehouse transformed into luxury loft residences. Exposed brick, soaring ceilings, and industrial steel frames meet refined contemporary finishes.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80',
    ],
    featured: true,
    details: {
      area: '45,000 sq ft',
      status: 'Completed',
      client: 'Private Developer',
    },
  },
  {
    id: '4',
    slug: 'yorkville-boutique',
    title: 'Yorkville Boutique Hotel',
    category: 'Hospitality',
    location: 'Toronto, ON',
    year: '2023',
    description:
      'An intimate 48-room boutique hotel in the heart of Yorkville. Curated art, bespoke furnishings, and impeccable service create an atmosphere of understated luxury.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
    ],
    featured: false,
    details: {
      area: '38,000 sq ft',
      status: 'Completed',
      client: 'Hospitality Group',
    },
  },
  {
    id: '5',
    slug: 'forest-hill-house',
    title: 'Forest Hill House',
    category: 'Residential',
    location: 'Toronto, ON',
    year: '2023',
    description:
      'A family home that embraces its mature garden setting. Natural materials, generous glazing, and a flowing open plan create harmony between architecture and landscape.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80',
    ],
    featured: false,
    details: {
      area: '6,800 sq ft',
      status: 'Completed',
      client: 'Private',
    },
  },
  {
    id: '6',
    slug: 'distillery-offices',
    title: 'Distillery District Offices',
    category: 'Commercial',
    location: 'Toronto, ON',
    year: '2022',
    description:
      'Creative workspace within a heritage building. Original timber beams and brick complement modern workspaces designed for collaboration and focus.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80',
    ],
    featured: false,
    details: {
      area: '22,000 sq ft',
      status: 'Completed',
      client: 'Tech Company',
    },
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectCategories(): string[] {
  return [...new Set(projects.map((p) => p.category))];
}
