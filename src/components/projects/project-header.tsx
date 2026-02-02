'use client';

import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
  className?: string;
}

/**
 * ProjectHeader displays the project title, description, and status badge
 * at the top of the project detail page.
 */
export function ProjectHeader({ project, className }: ProjectHeaderProps) {
  const { title, description, featured, status, tags } = project;

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {featured && (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
            Featured Project
          </span>
        )}
        {status && (
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full',
              status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
              status === 'in-progress' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
              status === 'planned' && 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
            )}
          >
            {status === 'completed' && 'Completed'}
            {status === 'in-progress' && 'In Progress'}
            {status === 'planned' && 'Planned'}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>

      <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
        {description}
      </p>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm font-medium rounded-md bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
