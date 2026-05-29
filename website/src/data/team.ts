export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export const team: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Principal Architect',
    bio: 'With over 20 years of experience, Sarah leads our design vision with a commitment to creating spaces that elevate the human experience.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
  },
  {
    id: '2',
    name: 'Michael Brooks',
    role: 'Design Director',
    bio: 'Michael brings a deep understanding of materiality and craft to every project, ensuring each detail contributes to the whole.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Senior Architect',
    bio: 'Elena specializes in residential design, creating homes that perfectly balance aesthetic beauty with functional living.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Project Architect',
    bio: 'David oversees project delivery with precision and care, ensuring our designs are realized to the highest standards.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  },
];

export const services = [
  {
    id: '1',
    title: 'Architecture',
    description:
      'From concept to completion, we design buildings that inspire and endure. Our architectural practice spans residential, commercial, hospitality, and mixed-use developments.',
  },
  {
    id: '2',
    title: 'Interior Design',
    description:
      'We craft interior environments that reflect the character of their occupants and enhance daily life. Every material, finish, and furnishing is carefully considered.',
  },
  {
    id: '3',
    title: 'Development Consulting',
    description:
      'Strategic guidance for developers seeking to maximize the potential of their projects. We bring design thinking to the development process from the earliest stages.',
  },
  {
    id: '4',
    title: 'Adaptive Reuse',
    description:
      'Breathing new life into heritage and existing structures. We honor the past while creating spaces that serve contemporary needs.',
  },
];
