'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProjectLink } from '@/types';

interface ProjectLinksProps {
  links: ProjectLink[];
  className?: string;
}

/**
 * Icon components for different link types
 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function getLinkIcon(type: string, className?: string) {
  switch (type) {
    case 'github':
      return <GitHubIcon className={className} />;
    case 'npm':
      return <NpmIcon className={className} />;
    case 'demo':
      return <ExternalLinkIcon className={className} />;
    case 'docs':
      return <DocumentIcon className={className} />;
    case 'code':
      return <CodeIcon className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
}

/**
 * Get styles for different link types
 */
function getLinkStyles(type: string) {
  const baseStyles = "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200";

  switch (type) {
    case 'github':
      return cn(baseStyles, "bg-[#24292f] text-white hover:bg-[#1b1f23] dark:bg-[#2d333b] dark:hover:bg-[#373e47]");
    case 'npm':
      return cn(baseStyles, "border-2 border-[#cb3837] text-[#cb3837] hover:bg-[#cb3837] hover:text-white");
    case 'code':
      return cn(baseStyles, "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border");
    default:
      return cn(baseStyles, "bg-secondary text-secondary-foreground hover:bg-secondary/80");
  }
}

/**
 * Link wrapper component to handle both internal and external links
 */
function ProjectLinkButton({ link }: { link: ProjectLink }) {
  const styles = getLinkStyles(link.type);

  if (link.internal) {
    return (
      <Link href={link.url} className={styles}>
        {getLinkIcon(link.type)}
        <span>{link.label}</span>
      </Link>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles}
    >
      {getLinkIcon(link.type)}
      <span>{link.label}</span>
    </a>
  );
}

/**
 * ProjectLinks displays prominent links for GitHub, npm, and other resources.
 * Primary links (GitHub, npm, code) are displayed as large buttons.
 */
export function ProjectLinks({ links, className }: ProjectLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  // Separate primary links (github, npm, code) from secondary links
  const primaryTypes = ['github', 'npm', 'code'];
  const primaryLinks = links.filter((link) => primaryTypes.includes(link.type));
  const secondaryLinks = links.filter((link) => !primaryTypes.includes(link.type));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Primary Links - Large prominent buttons */}
      {primaryLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {primaryLinks.map((link) => (
            <ProjectLinkButton key={link.url} link={link} />
          ))}
        </div>
      )}

      {/* Secondary Links - Smaller text links */}
      {secondaryLinks.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {secondaryLinks.map((link) =>
            link.internal ? (
              <Link
                key={link.url}
                href={link.url}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {getLinkIcon(link.type)}
                {link.label}
              </Link>
            ) : (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {getLinkIcon(link.type)}
                {link.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
