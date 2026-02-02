import { Project } from '@/types';

/**
 * Project registry containing all portfolio projects.
 * Projects are ordered by priority, with featured projects first.
 */
export const projects: Project[] = [
  {
    id: 'have-we-met',
    slug: 'have-we-met',
    title: 'have-we-met',
    description:
      'An identity resolution library for Node.js that provides deterministic, probabilistic, and ML-based matching for record deduplication and entity resolution.',
    tags: [
      'TypeScript',
      'Node.js',
      'Identity Resolution',
      'Data Quality',
      'Machine Learning',
    ],
    links: [
      {
        type: 'github',
        label: 'View on GitHub',
        url: 'https://github.com/8arr3tt/have-we-met',
      },
      {
        type: 'npm',
        label: 'npm Package',
        url: 'https://www.npmjs.com/package/have-we-met',
      },
    ],
    published: true,
    featured: true,
    status: 'completed',
  },
];

/**
 * Get all published projects
 */
export function getPublishedProjects(): Project[] {
  return projects.filter((project) => project.published);
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured && project.published);
}

/**
 * Get a project by its slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Get a project by its ID
 */
export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

/**
 * Get all project slugs (useful for static generation)
 */
export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
