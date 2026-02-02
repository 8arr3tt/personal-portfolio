import { Metadata } from 'next';
import { ProjectGrid } from '@/components/projects';
import { getPublishedProjects } from '@/data/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse my portfolio of software engineering projects and open source work.',
};

export default function ProjectsPage() {
  const projects = getPublishedProjects();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore my portfolio of software engineering projects. Each project showcases different
            skills and technologies, from identity resolution to web development.
          </p>
        </header>

        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
