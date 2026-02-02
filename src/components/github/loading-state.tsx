'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * LoadingState component with spinner and optional message
 */
export function LoadingState({
  message = 'Loading...',
  className,
  size = 'default',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: {
      container: 'p-4',
      spinner: 'h-6 w-6',
      text: 'text-sm',
    },
    default: {
      container: 'p-6',
      spinner: 'h-8 w-8',
      text: 'text-base',
    },
    lg: {
      container: 'p-8',
      spinner: 'h-12 w-12',
      text: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className={className}>
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center',
          classes.container
        )}
      >
        <Loader2
          className={cn('animate-spin text-muted-foreground mb-3', classes.spinner)}
        />
        <p className={cn('text-muted-foreground', classes.text)}>{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Inline loading spinner for smaller contexts
 */
export interface InlineLoadingProps {
  message?: string;
  className?: string;
}

export function InlineLoading({ message, className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

/**
 * Skeleton component for placeholder loading states
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonText - text placeholder with multiple lines
 */
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            // Make last line shorter for natural appearance
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * FileTreeSkeleton - skeleton for file tree loading state
 */
export interface FileTreeSkeletonProps {
  items?: number;
  className?: string;
}

export function FileTreeSkeleton({ items = 8, className }: FileTreeSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* Indent some items to simulate tree structure */}
          <div style={{ width: `${(i % 3) * 16}px` }} />
          <Skeleton className="h-4 w-4" />
          <Skeleton
            className="h-4"
            style={{ width: `${60 + Math.random() * 100}px` }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * CodeSkeleton - skeleton for code viewer loading state
 */
export interface CodeSkeletonProps {
  lines?: number;
  className?: string;
}

export function CodeSkeleton({ lines = 15, className }: CodeSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-4 font-mono text-sm">
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Line number */}
              <Skeleton className="h-4 w-6" />
              {/* Code content with varying widths */}
              <Skeleton
                className="h-4"
                style={{
                  width: `${Math.random() * 40 + 20}%`,
                  marginLeft: `${Math.floor(Math.random() * 4) * 16}px`,
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CardSkeleton - skeleton for card loading state
 */
export interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function CardSkeleton({
  className,
  showHeader = true,
  showFooter = false,
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <SkeletonText lines={4} />
      </CardContent>
      {showFooter && (
        <div className="flex items-center gap-2 p-6 pt-0">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </Card>
  );
}
