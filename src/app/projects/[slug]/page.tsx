import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getAllProjectSlugs } from '@/data/projects';
import { ProjectHeader } from '@/components/projects/project-header';
import { ProjectLinks } from '@/components/projects/project-links';
import { Separator } from '@/components/ui/separator';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all project slugs
 */
export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for the project page
 */
export async function generateMetadata(
  { params }: ProjectPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'article',
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // Return 404 for invalid slugs
  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Project Links */}
        {project.links && project.links.length > 0 && (
          <>
            <Separator className="my-8" />
            <ProjectLinks links={project.links} />
          </>
        )}

        {/* Documentation Content Area */}
        <Separator className="my-8" />
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Documentation</h2>
          <p className="text-muted-foreground">
            Project documentation will be displayed here. The full documentation with
            usage examples, API reference, and interactive demos will be added in the next ticket.
          </p>
        </section>
      </div>
    </div>
  );
}
