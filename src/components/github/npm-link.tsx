'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  );
}

export interface NpmLinkProps extends Omit<ButtonProps, 'asChild'> {
  /** The URL to the npm package */
  href: string;
  /** Optional label - defaults to "View on npm" */
  label?: string;
  /** Whether to show the label text (icon-only if false) */
  showLabel?: boolean;
}

/**
 * NpmLink component displays a link to an npm package
 * with the npm icon and consistent styling.
 */
export function NpmLink({
  href,
  label = 'View on npm',
  showLabel = true,
  size = 'default',
  variant = 'outline',
  className,
  ...props
}: NpmLinkProps) {
  return (
    <Button
      variant={variant}
      size={showLabel ? size : 'icon'}
      asChild
      className={cn(className)}
      {...props}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={showLabel ? undefined : label}
      >
        <NpmIcon />
        {showLabel && <span>{label}</span>}
      </a>
    </Button>
  );
}

export { NpmIcon };
