/**
 * GitHub API client for fetching repository data
 * Provides authentication, rate limit handling, and typed responses
 */

import {
  GitHubClientConfig,
  GitHubRateLimit,
  GitHubApiResult,
  GitHubRepository,
  GitHubTree,
  GitHubError,
  RateLimitHeaders,
  ParsedRepositoryTree,
  ParsedTreeItem,
} from './github/types';

const DEFAULT_BASE_URL = 'https://api.github.com';

/**
 * Parse rate limit information from response headers
 */
function parseRateLimitHeaders(headers: Headers): RateLimitHeaders {
  return {
    limit: parseInt(headers.get('x-ratelimit-limit') || '60', 10),
    remaining: parseInt(headers.get('x-ratelimit-remaining') || '60', 10),
    reset: parseInt(headers.get('x-ratelimit-reset') || '0', 10),
    used: parseInt(headers.get('x-ratelimit-used') || '0', 10),
  };
}

/**
 * GitHub API client class
 */
export class GitHubClient {
  private token: string | undefined;
  private baseUrl: string;
  private lastRateLimit: GitHubRateLimit | null = null;

  constructor(config: GitHubClientConfig = {}) {
    this.token = config.token ?? process.env.GITHUB_TOKEN;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  /**
   * Get the last known rate limit information
   */
  getRateLimit(): GitHubRateLimit | null {
    return this.lastRateLimit;
  }

  /**
   * Get remaining API requests before rate limit
   */
  getRemainingRequests(): number | null {
    return this.lastRateLimit?.remaining ?? null;
  }

  /**
   * Check if the client has an authentication token configured
   */
  hasToken(): boolean {
    return !!this.token;
  }

  /**
   * Build request headers for GitHub API
   */
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make a request to the GitHub API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GitHubApiResult<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.buildHeaders(),
        ...options.headers,
      },
    });

    // Parse rate limit headers
    const rateLimit = parseRateLimitHeaders(response.headers);
    this.lastRateLimit = rateLimit;

    // Handle error responses
    if (!response.ok) {
      const error: GitHubError = await response.json();

      if (response.status === 403 && rateLimit.remaining === 0) {
        const resetDate = new Date(rateLimit.reset * 1000);
        throw new GitHubRateLimitError(
          `GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}`,
          rateLimit
        );
      }

      if (response.status === 404) {
        throw new GitHubNotFoundError(error.message || 'Resource not found');
      }

      if (response.status === 401) {
        throw new GitHubAuthError(error.message || 'Authentication failed');
      }

      throw new GitHubApiError(
        error.message || `GitHub API error: ${response.status}`,
        response.status
      );
    }

    const data: T = await response.json();

    return {
      data,
      rateLimit,
    };
  }

  /**
   * Fetch repository information
   */
  async getRepository(
    owner: string,
    repo: string
  ): Promise<GitHubApiResult<GitHubRepository>> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Fetch repository tree (file structure)
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param ref - Branch, tag, or commit SHA (defaults to repository's default branch)
   * @param recursive - Whether to fetch the entire tree recursively (default: true)
   */
  async getRepositoryTree(
    owner: string,
    repo: string,
    ref?: string,
    recursive: boolean = true
  ): Promise<GitHubApiResult<GitHubTree>> {
    // If no ref provided, fetch the repository to get the default branch
    const treeRef = ref ?? (await this.getDefaultBranch(owner, repo));

    const queryParams = recursive ? '?recursive=1' : '';
    return this.request<GitHubTree>(
      `/repos/${owner}/${repo}/git/trees/${treeRef}${queryParams}`
    );
  }

  /**
   * Get the default branch for a repository
   */
  private async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const result = await this.getRepository(owner, repo);
    return result.data.default_branch;
  }

  /**
   * Fetch repository tree and parse it into a structured format
   * Returns file metadata organized by path
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param ref - Branch, tag, or commit SHA (optional)
   */
  async getRepositoryFiles(
    owner: string,
    repo: string,
    ref?: string
  ): Promise<GitHubApiResult<ParsedRepositoryTree>> {
    const result = await this.getRepositoryTree(owner, repo, ref, true);

    const files: ParsedTreeItem[] = [];
    const directories: ParsedTreeItem[] = [];

    for (const item of result.data.tree) {
      const parsedItem: ParsedTreeItem = {
        path: item.path,
        name: item.path.split('/').pop() || item.path,
        type: item.type === 'blob' ? 'file' : 'directory',
        sha: item.sha,
        size: item.size,
        url: item.url,
      };

      if (item.type === 'blob') {
        files.push(parsedItem);
      } else {
        directories.push(parsedItem);
      }
    }

    return {
      data: {
        sha: result.data.sha,
        truncated: result.data.truncated,
        files,
        directories,
        all: [...directories, ...files],
      },
      rateLimit: result.rateLimit,
    };
  }

  /**
   * Get files in a specific directory path
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - Directory path (empty string for root)
   * @param ref - Branch, tag, or commit SHA (optional)
   */
  async getDirectoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string
  ): Promise<GitHubApiResult<ParsedTreeItem[]>> {
    const result = await this.getRepositoryFiles(owner, repo, ref);

    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const depth = normalizedPath ? normalizedPath.split('/').length : 0;

    const items = result.data.all.filter((item) => {
      if (normalizedPath) {
        // Item must be inside the specified path
        if (!item.path.startsWith(normalizedPath + '/')) {
          return false;
        }
        // Item must be direct child (one level deeper)
        const relativePath = item.path.slice(normalizedPath.length + 1);
        return !relativePath.includes('/');
      } else {
        // Root level: no slashes in path
        return !item.path.includes('/');
      }
    });

    return {
      data: items,
      rateLimit: result.rateLimit,
    };
  }
}

/**
 * Base error class for GitHub API errors
 */
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

/**
 * Error thrown when GitHub API rate limit is exceeded
 */
export class GitHubRateLimitError extends GitHubApiError {
  constructor(
    message: string,
    public readonly rateLimit: GitHubRateLimit
  ) {
    super(message, 403);
    this.name = 'GitHubRateLimitError';
  }

  /**
   * Get the time until rate limit resets
   */
  getResetTime(): Date {
    return new Date(this.rateLimit.reset * 1000);
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class GitHubNotFoundError extends GitHubApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'GitHubNotFoundError';
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class GitHubAuthError extends GitHubApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'GitHubAuthError';
  }
}

/**
 * Create a default GitHub client instance
 * Uses GITHUB_TOKEN from environment if available
 */
export function createGitHubClient(config?: GitHubClientConfig): GitHubClient {
  return new GitHubClient(config);
}

/**
 * Default singleton instance for convenience
 */
let defaultClient: GitHubClient | null = null;

/**
 * Get or create the default GitHub client instance
 */
export function getGitHubClient(): GitHubClient {
  if (!defaultClient) {
    defaultClient = createGitHubClient();
  }
  return defaultClient;
}

// Re-export types for convenience
export type {
  GitHubClientConfig,
  GitHubRateLimit,
  GitHubApiResult,
  GitHubRepository,
  GitHubOwner,
  GitHubTree,
  GitHubTreeItem,
  GitHubFileContent,
  GitHubError,
  ParsedRepositoryTree,
  ParsedTreeItem,
} from './github/types';
