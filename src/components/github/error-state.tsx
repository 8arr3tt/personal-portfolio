'use client';

import { AlertCircle, RefreshCw, WifiOff, Clock, Lock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  GitHubErrorType,
  getErrorMessage,
  getErrorType,
  isRetryableError,
  isRateLimitError,
  GitHubRateLimitError,
} from '@/lib/github/errors';

export interface ErrorStateProps {
  /** The error to display */
  error: unknown;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Optional custom title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Whether to show the retry button (shown by default for retryable errors) */
  showRetry?: boolean;
}

/**
 * Get the icon for an error type
 */
function getErrorIcon(type: GitHubErrorType) {
  switch (type) {
    case 'RATE_LIMIT':
      return Clock;
    case 'NOT_FOUND':
      return AlertCircle;
    case 'NETWORK':
      return WifiOff;
    case 'AUTH':
      return Lock;
    case 'SERVER':
      return Server;
    default:
      return AlertCircle;
  }
}

/**
 * Get the default title for an error type
 */
function getErrorTitle(type: GitHubErrorType): string {
  switch (type) {
    case 'RATE_LIMIT':
      return 'Rate Limit Exceeded';
    case 'NOT_FOUND':
      return 'Not Found';
    case 'NETWORK':
      return 'Connection Error';
    case 'AUTH':
      return 'Authentication Error';
    case 'SERVER':
      return 'Server Error';
    default:
      return 'Something Went Wrong';
  }
}

/**
 * ErrorState component displays user-friendly error messages
 * with retry functionality for GitHub API errors
 */
export function ErrorState({
  error,
  onRetry,
  title,
  className,
  size = 'default',
  showRetry,
}: ErrorStateProps) {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const canRetry = showRetry ?? isRetryableError(error);
  const Icon = getErrorIcon(errorType);
  const displayTitle = title ?? getErrorTitle(errorType);

  // Get rate limit info if available
  const rateLimitInfo = isRateLimitError(error)
    ? (error as GitHubRateLimitError)
    : null;

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-sm font-medium',
      message: 'text-xs',
      button: 'h-8 text-xs',
    },
    default: {
      container: 'p-6',
      icon: 'h-12 w-12',
      title: 'text-lg font-semibold',
      message: 'text-sm',
      button: 'h-9 text-sm',
    },
    lg: {
      container: 'p-8',
      icon: 'h-16 w-16',
      title: 'text-xl font-semibold',
      message: 'text-base',
      button: 'h-10 text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className={cn('border-destructive/50', className)}>
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center text-center',
          classes.container
        )}
      >
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Icon className={cn('text-destructive', classes.icon)} />
        </div>

        <h3 className={cn('text-foreground mb-2', classes.title)}>
          {displayTitle}
        </h3>

        <p className={cn('text-muted-foreground max-w-md mb-4', classes.message)}>
          {errorMessage}
        </p>

        {rateLimitInfo && (
          <p className={cn('text-muted-foreground mb-4', classes.message)}>
            Rate limit: {rateLimitInfo.rateLimit.remaining}/
            {rateLimitInfo.rateLimit.limit} requests remaining
          </p>
        )}

        {canRetry && onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className={classes.button}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline error display for smaller contexts
 */
export interface InlineErrorProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const canRetry = isRetryableError(error);
  const Icon = getErrorIcon(errorType);

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{errorMessage}</span>
      {canRetry && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
