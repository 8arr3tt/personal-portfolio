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
    <header className={cn('space-y-6', className)}>
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        {featured && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient text-white shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </span>
        )}
        {status && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border',
              status === 'completed' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800',
              status === 'in-progress' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
              status === 'planned' && 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-700'
            )}
          >
            {status === 'completed' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'in-progress' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {status === 'planned' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {status === 'completed' && 'Completed'}
            {status === 'in-progress' && 'In Progress'}
            {status === 'planned' && 'Planned'}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
        {title}
      </h1>

      {/* Description */}
      <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
        {description}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary/80 text-secondary-foreground border border-border/50 hover:bg-secondary transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
