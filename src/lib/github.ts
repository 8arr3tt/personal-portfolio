/**
 * GitHub API client for fetching repository data
 * Provides authentication, rate limit handling, typed responses, and caching
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
  GitHubFileContent,
  GitHubBlob,
  ParsedFileContent,
} from './github/types';
import {
  GitHubCache,
  getGitHubCache,
  CACHE_DURATIONS,
  cachedFetchTree,
  cachedFetchFileByPath,
  cachedFetchFileBySha,
} from './github/cache';

const DEFAULT_BASE_URL = 'https://api.github.com';

/**
 * Decode base64 encoded string to UTF-8
 * Works in both Node.js and browser environments
 */
function decodeBase64(base64: string): string {
  // Remove any whitespace/newlines that GitHub includes in base64 content
  const cleanedBase64 = base64.replace(/\s/g, '');

  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(cleanedBase64, 'base64').toString('utf-8');
  } else {
    // Browser environment
    return decodeURIComponent(
      atob(cleanedBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}

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
 * Extended configuration with cache options
 */
export interface GitHubClientConfigWithCache extends GitHubClientConfig {
  /** Enable caching (default: true) */
  enableCache?: boolean;
  /** Custom cache instance (uses global cache by default) */
  cache?: GitHubCache;
}

/**
 * GitHub API client class
 */
export class GitHubClient {
  private token: string | undefined;
  private baseUrl: string;
  private lastRateLimit: GitHubRateLimit | null = null;
  private cacheEnabled: boolean;
  private cache: GitHubCache;

  constructor(config: GitHubClientConfigWithCache = {}) {
    this.token = config.token ?? process.env.GITHUB_TOKEN;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.cacheEnabled = config.enableCache ?? true;
    this.cache = config.cache ?? getGitHubCache();
  }

  /**
   * Check if caching is enabled
   */
  isCacheEnabled(): boolean {
    return this.cacheEnabled;
  }

  /**
   * Get the cache instance
   */
  getCache(): GitHubCache {
    return this.cache;
  }

  /**
   * Invalidate cache for a specific repository
   */
  invalidateCache(owner: string, repo: string): void {
    this.cache.invalidateRepository(owner, repo);
  }

  /**
   * Invalidate all cached data
   */
  invalidateAllCache(): void {
    this.cache.invalidateAll();
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
    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.cache.getRepository<GitHubRepository>(owner, repo);
      if (cached) {
        return {
          data: cached,
          rateLimit: this.lastRateLimit ?? {
            limit: 60,
            remaining: 60,
            reset: 0,
            used: 0,
          },
        };
      }
    }

    const result = await this.request<GitHubRepository>(`/repos/${owner}/${repo}`);

    // Cache the result
    if (this.cacheEnabled) {
      this.cache.setRepository(owner, repo, result.data);
    }

    return result;
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
    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.cache.getTree(owner, repo, ref);
      if (cached) {
        return {
          data: cached,
          rateLimit: this.lastRateLimit ?? {
            limit: 60,
            remaining: 60,
            reset: 0,
            used: 0,
          },
        };
      }
    }

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

    const parsedTree: ParsedRepositoryTree = {
      sha: result.data.sha,
      truncated: result.data.truncated,
      files,
      directories,
      all: [...directories, ...files],
    };

    // Cache the result (30 minute TTL for trees)
    if (this.cacheEnabled) {
      this.cache.setTree(owner, repo, ref, parsedTree);
    }

    return {
      data: parsedTree,
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

  /**
   * Fetch file content by path from repository
   * Uses the contents API which returns file metadata and base64-encoded content
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - File path relative to repository root
   * @param ref - Branch, tag, or commit SHA (optional)
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubApiResult<ParsedFileContent>> {
    const normalizedPath = path.replace(/^\/+/, '');
    const queryParams = ref ? `?ref=${encodeURIComponent(ref)}` : '';

    const result = await this.request<GitHubFileContent>(
      `/repos/${owner}/${repo}/contents/${normalizedPath}${queryParams}`
    );

    const parsedContent = this.parseFileContent(result.data, normalizedPath);

    return {
      data: parsedContent,
      rateLimit: result.rateLimit,
    };
  }

  /**
   * Fetch raw file content by SHA (blob)
   * Uses the git/blobs API for direct blob access
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param sha - Git blob SHA
   */
  async getFileContentBySha(
    owner: string,
    repo: string,
    sha: string
  ): Promise<GitHubApiResult<ParsedFileContent>> {
    const result = await this.request<GitHubBlob>(
      `/repos/${owner}/${repo}/git/blobs/${sha}`
    );

    const parsedContent = this.parseBlobContent(result.data);

    return {
      data: parsedContent,
      rateLimit: result.rateLimit,
    };
  }

  /**
   * Fetch raw file content as a string
   * Convenience method that returns just the decoded content
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - File path relative to repository root
   * @param ref - Branch, tag, or commit SHA (optional)
   * @returns Decoded file content or null if binary
   */
  async getRawFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubApiResult<string | null>> {
    const result = await this.getFileContent(owner, repo, path, ref);

    return {
      data: result.data.content,
      rateLimit: result.rateLimit,
    };
  }

  /**
   * Parse file content response into a structured format
   * Decodes base64 content and detects binary files
   */
  private parseFileContent(
    content: GitHubFileContent,
    path: string
  ): ParsedFileContent {
    const isBinary = this.isBinaryFile(content.name, content.content);
    let decodedContent: string | null = null;

    if (!isBinary) {
      try {
        decodedContent = decodeBase64(content.content);
      } catch {
        // If decoding fails, treat as binary
        return {
          name: content.name,
          path: path,
          sha: content.sha,
          size: content.size,
          encoding: content.encoding,
          content: null,
          isBinary: true,
          rawContent: content.content,
        };
      }
    }

    return {
      name: content.name,
      path: path,
      sha: content.sha,
      size: content.size,
      encoding: content.encoding,
      content: decodedContent,
      isBinary,
      rawContent: content.content,
    };
  }

  /**
   * Parse blob content response into a structured format
   */
  private parseBlobContent(blob: GitHubBlob): ParsedFileContent {
    const isBinary = this.isBinaryContent(blob.content);
    let decodedContent: string | null = null;

    if (!isBinary && blob.encoding === 'base64') {
      try {
        decodedContent = decodeBase64(blob.content);
      } catch {
        return {
          name: '',
          path: '',
          sha: blob.sha,
          size: blob.size,
          encoding: blob.encoding,
          content: null,
          isBinary: true,
          rawContent: blob.content,
        };
      }
    } else if (blob.encoding === 'utf-8') {
      decodedContent = blob.content;
    }

    return {
      name: '',
      path: '',
      sha: blob.sha,
      size: blob.size,
      encoding: blob.encoding,
      content: decodedContent,
      isBinary,
      rawContent: blob.content,
    };
  }

  /**
   * Detect if a file is binary based on extension and content
   */
  private isBinaryFile(filename: string, base64Content: string): boolean {
    // Check by file extension first
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.zip', '.tar', '.gz', '.rar', '.7z',
      '.exe', '.dll', '.so', '.dylib',
      '.woff', '.woff2', '.ttf', '.otf', '.eot',
      '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
      '.bin', '.dat', '.db', '.sqlite',
    ];

    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    if (binaryExtensions.includes(ext)) {
      return true;
    }

    // Check content for binary indicators
    return this.isBinaryContent(base64Content);
  }

  /**
   * Detect if base64 content represents binary data
   */
  private isBinaryContent(base64Content: string): boolean {
    try {
      // Decode a sample of the content to check for null bytes
      const sample = base64Content.slice(0, 1000);
      const decoded = decodeBase64(sample);

      // Check for null bytes or high concentration of non-printable characters
      let nonPrintable = 0;
      for (let i = 0; i < decoded.length; i++) {
        const code = decoded.charCodeAt(i);
        // Null byte is a strong indicator of binary
        if (code === 0) {
          return true;
        }
        // Count non-printable characters (excluding common whitespace)
        if (code < 9 || (code > 13 && code < 32)) {
          nonPrintable++;
        }
      }

      // If more than 10% non-printable, likely binary
      return nonPrintable / decoded.length > 0.1;
    } catch {
      // If we can't decode, assume binary
      return true;
    }
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
  GitHubBlob,
  GitHubError,
  ParsedRepositoryTree,
  ParsedTreeItem,
  ParsedFileContent,
} from './github/types';
