/**
 * TypeScript types for GitHub API responses and client configuration
 */

/**
 * GitHub API rate limit information
 */
export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

/**
 * Configuration options for the GitHub API client
 */
export interface GitHubClientConfig {
  /** GitHub personal access token for authentication (optional but recommended) */
  token?: string;
  /** Base URL for GitHub API (defaults to https://api.github.com) */
  baseUrl?: string;
}

/**
 * Result of a GitHub API request with rate limit info
 */
export interface GitHubApiResult<T> {
  data: T;
  rateLimit: GitHubRateLimit;
}

/**
 * GitHub repository owner information
 */
export interface GitHubOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

/**
 * GitHub repository information
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  default_branch: string;
  visibility: 'public' | 'private' | 'internal';
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

/**
 * Item in a GitHub repository tree (file or directory)
 */
export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number; // Only present for blobs
  url: string;
}

/**
 * GitHub repository tree response
 */
export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

/**
 * GitHub file content response (blob)
 */
export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file';
  content: string; // Base64 encoded
  encoding: 'base64';
}

/**
 * GitHub blob response (raw content from git/blobs endpoint)
 */
export interface GitHubBlob {
  sha: string;
  node_id: string;
  size: number;
  url: string;
  content: string; // Base64 encoded
  encoding: 'base64' | 'utf-8';
}

/**
 * Parsed file content with decoded data
 */
export interface ParsedFileContent {
  /** File name */
  name: string;
  /** File path relative to repository root */
  path: string;
  /** Git SHA hash */
  sha: string;
  /** File size in bytes */
  size: number;
  /** File encoding used by GitHub */
  encoding: 'base64' | 'utf-8';
  /** Decoded file content (null for binary files) */
  content: string | null;
  /** Whether this file is detected as binary */
  isBinary: boolean;
  /** Raw base64 content (always available) */
  rawContent: string;
}

/**
 * GitHub error response
 */
export interface GitHubError {
  message: string;
  documentation_url?: string;
}

/**
 * Parsed tree item with additional metadata
 */
export interface ParsedTreeItem {
  /** File/directory path relative to repository root */
  path: string;
  /** File/directory name (last segment of path) */
  name: string;
  /** Item type */
  type: 'file' | 'directory';
  /** Git SHA hash */
  sha: string;
  /** File size in bytes (only for files) */
  size?: number;
  /** API URL for this item */
  url: string;
}

/**
 * Parsed repository tree with categorized items
 */
export interface ParsedRepositoryTree {
  /** Tree SHA */
  sha: string;
  /** Whether the tree was truncated due to size */
  truncated: boolean;
  /** All files in the repository */
  files: ParsedTreeItem[];
  /** All directories in the repository */
  directories: ParsedTreeItem[];
  /** All items (directories first, then files) */
  all: ParsedTreeItem[];
}

/**
 * Parsed rate limit info from response headers
 */
export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}
