/**
 * Custom error classes for GitHub API failures
 * Provides typed errors with user-friendly messages
 */

import { GitHubRateLimit } from './types';

/**
 * Error type enumeration for categorizing GitHub API errors
 */
export type GitHubErrorType =
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'AUTH'
  | 'SERVER'
  | 'UNKNOWN';

/**
 * Base error class for GitHub API errors
 */
export class GitHubApiError extends Error {
  readonly type: GitHubErrorType;
  readonly statusCode?: number;
  readonly isRetryable: boolean;

  constructor(
    message: string,
    type: GitHubErrorType = 'UNKNOWN',
    statusCode?: number,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'GitHubApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }

  /**
   * Get a user-friendly error message suitable for display
   */
  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Error thrown when GitHub API rate limit is exceeded
 */
export class GitHubRateLimitError extends GitHubApiError {
  readonly rateLimit: GitHubRateLimit;

  constructor(message: string, rateLimit: GitHubRateLimit) {
    super(message, 'RATE_LIMIT', 403, false);
    this.name = 'GitHubRateLimitError';
    this.rateLimit = rateLimit;
  }

  /**
   * Get the time until rate limit resets
   */
  getResetTime(): Date {
    return new Date(this.rateLimit.reset * 1000);
  }

  /**
   * Get minutes until rate limit resets
   */
  getMinutesUntilReset(): number {
    const now = Date.now();
    const resetTime = this.rateLimit.reset * 1000;
    return Math.ceil((resetTime - now) / (1000 * 60));
  }

  getUserMessage(): string {
    const minutes = this.getMinutesUntilReset();
    if (minutes <= 0) {
      return 'GitHub API rate limit exceeded. Please try again.';
    }
    return `GitHub API rate limit exceeded. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class GitHubNotFoundError extends GitHubApiError {
  readonly resource: string;

  constructor(message: string, resource: string = 'resource') {
    super(message, 'NOT_FOUND', 404, false);
    this.name = 'GitHubNotFoundError';
    this.resource = resource;
  }

  getUserMessage(): string {
    switch (this.resource) {
      case 'repository':
        return 'Repository not found. It may be private or may have been deleted.';
      case 'file':
        return 'File not found. It may have been moved or deleted.';
      case 'branch':
        return 'Branch not found. It may have been renamed or deleted.';
      default:
        return 'The requested resource could not be found.';
    }
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class GitHubAuthError extends GitHubApiError {
  constructor(message: string) {
    super(message, 'AUTH', 401, false);
    this.name = 'GitHubAuthError';
  }

  getUserMessage(): string {
    return 'Authentication failed. The GitHub token may be invalid or expired.';
  }
}

/**
 * Error thrown when a network error occurs
 */
export class GitHubNetworkError extends GitHubApiError {
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(
      message || originalError?.message || 'A network error occurred',
      'NETWORK',
      undefined,
      true
    );
    this.name = 'GitHubNetworkError';
    this.originalError = originalError;
  }

  getUserMessage(): string {
    return 'Unable to connect to GitHub. Please check your internet connection and try again.';
  }
}

/**
 * Error thrown when GitHub server returns a 5xx error
 */
export class GitHubServerError extends GitHubApiError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'SERVER', statusCode, true);
    this.name = 'GitHubServerError';
  }

  getUserMessage(): string {
    return 'GitHub is experiencing issues. Please try again later.';
  }
}

/**
 * Type guard to check if an error is a GitHubApiError
 */
export function isGitHubError(error: unknown): error is GitHubApiError {
  return error instanceof GitHubApiError;
}

/**
 * Type guard for rate limit errors
 */
export function isRateLimitError(error: unknown): error is GitHubRateLimitError {
  return error instanceof GitHubRateLimitError;
}

/**
 * Type guard for not found errors
 */
export function isNotFoundError(error: unknown): error is GitHubNotFoundError {
  return error instanceof GitHubNotFoundError;
}

/**
 * Type guard for network errors
 */
export function isNetworkError(error: unknown): error is GitHubNetworkError {
  return error instanceof GitHubNetworkError;
}

/**
 * Convert any error into a GitHubApiError
 * Useful for wrapping unknown errors in catch blocks
 */
export function toGitHubError(error: unknown): GitHubApiError {
  // Already a GitHub error
  if (isGitHubError(error)) {
    return error;
  }

  // Network/fetch errors
  if (error instanceof TypeError) {
    return new GitHubNetworkError(error.message, error);
  }

  // Generic errors
  if (error instanceof Error) {
    return new GitHubApiError(error.message, 'UNKNOWN', undefined, false);
  }

  // Unknown error type
  return new GitHubApiError(
    String(error) || 'An unexpected error occurred',
    'UNKNOWN',
    undefined,
    false
  );
}

/**
 * Get a user-friendly error message for any error
 */
export function getErrorMessage(error: unknown): string {
  if (isGitHubError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get the error type for categorization
 */
export function getErrorType(error: unknown): GitHubErrorType {
  if (isGitHubError(error)) {
    return error.type;
  }
  return 'UNKNOWN';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isGitHubError(error)) {
    return error.isRetryable;
  }
  // Network errors are generally retryable
  if (error instanceof TypeError) {
    return true;
  }
  return false;
}
