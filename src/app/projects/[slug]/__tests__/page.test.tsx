import { render, screen } from '@testing-library/react';
import ProjectPage from '../page';

// Mock the notFound function from next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock the project data functions
jest.mock('@/data/projects', () => ({
  getProjectBySlug: (slug: string) => {
    if (slug === 'have-we-met') {
      return {
        id: 'have-we-met',
        slug: 'have-we-met',
        title: 'have-we-met',
        description: 'An identity resolution library for Node.js',
        tags: ['TypeScript', 'Node.js'],
        links: [
          { type: 'github', label: 'View on GitHub', url: 'https://github.com/test/have-we-met' },
          { type: 'npm', label: 'npm Package', url: 'https://www.npmjs.com/package/have-we-met' },
        ],
        published: true,
        featured: true,
        status: 'completed',
      };
    }
    return undefined;
  },
  getAllProjectSlugs: () => ['have-we-met'],
}));

describe('ProjectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the project page with project data', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByRole('heading', { name: 'have-we-met' })).toBeInTheDocument();
    expect(screen.getByText(/identity resolution library/i)).toBeInTheDocument();
  });

  it('displays project tags', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders the back to projects link', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    const backLink = screen.getByText('Back to Projects');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/projects');
  });

  it('displays GitHub and npm links', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
    expect(screen.getByText('npm Package')).toBeInTheDocument();
  });

  it('shows featured badge for featured projects', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByText('Featured Project')).toBeInTheDocument();
  });

  it('shows completed status badge', async () => {
    const params = Promise.resolve({ slug: 'have-we-met' });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls notFound for invalid slugs', async () => {
    const { notFound } = require('next/navigation');
    const params = Promise.resolve({ slug: 'invalid-project' });

    try {
      await ProjectPage({ params });
    } catch {
      // notFound throws, which is expected
    }

    expect(notFound).toHaveBeenCalled();
  });
});
