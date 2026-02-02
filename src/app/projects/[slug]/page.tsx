import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ProjectPageProps
): Promise<Metadata> {
  return {
    title: `Project: ${params.slug}`,
    description: `Details for project ${params.slug}`,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            ← Back to Projects
          </Link>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Project: {params.slug}</h1>
              <p className="text-muted-foreground">
                Dynamic route parameter: <code className="bg-muted px-2 py-1 rounded">{params.slug}</code>
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-3">Coming Soon</h2>
              <p className="text-muted-foreground">
                Individual project pages are currently being developed.
                This page will soon display detailed information about specific projects.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a placeholder page demonstrating
                Next.js dynamic routing with the [slug] parameter.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
