import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getAllProjectSlugs } from '@/data/projects';
import { ProjectHeader } from '@/components/projects/project-header';
import { ProjectLinks } from '@/components/projects/project-links';
import { getProjectMDX } from '@/lib/mdx';

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

  // Load MDX content for this project
  const mdxModule = await getProjectMDX(slug);
  const MDXContent = mdxModule?.default;

  return (
    <div className="min-h-screen">
      {/* Hero section with subtle background */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="container mx-auto px-4 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Back navigation */}
            <div className="mb-8">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
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
              <div className="mt-8 pt-8 border-t border-border/60">
                <ProjectLinks links={project.links} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Content Area */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h2:text-2xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-3 prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-7 prose-li:leading-7 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border/60 prose-table:border prose-table:border-border/60 prose-th:bg-muted/50 prose-th:border prose-th:border-border/60 prose-td:border prose-td:border-border/60">
            {MDXContent ? (
              <MDXContent />
            ) : (
              <>
                <h2>Documentation</h2>
                <p className="text-muted-foreground">
                  Documentation for this project is coming soon.
                </p>
              </>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
