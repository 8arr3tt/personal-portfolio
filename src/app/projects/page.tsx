import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse my portfolio of projects and work.',
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Explore my work and side projects.
        </p>

        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🚧</div>
            <h2 className="text-2xl font-semibold">Coming Soon</h2>
            <p className="text-muted-foreground">
              Project listings are currently being prepared. Check back soon to see my latest work!
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="text-primary hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
