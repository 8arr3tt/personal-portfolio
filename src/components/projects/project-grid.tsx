import { cn } from '@/lib/utils';
import { ProjectCard } from './project-card';
import type { Project } from '@/types';

interface ProjectGridProps {
  projects: Project[];
  className?: string;
}

/**
 * ProjectGrid displays a responsive grid of ProjectCards.
 * Layout: 1 column on mobile, 2 on tablet, 3 on desktop.
 */
export function ProjectGrid({ projects, className }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects to display.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
