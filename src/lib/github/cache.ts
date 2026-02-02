/**
 * Caching layer for GitHub API responses
 * Provides in-memory caching with configurable TTL and content-addressable caching for file contents
 */

import { cache } from 'react';
import type { ParsedRepositoryTree, ParsedFileContent } from './types';

/**
 * Default cache durations in milliseconds
 */
export const CACHE_DURATIONS = {
  /** Repository tree cache duration (30 minutes) */
  TREE: 30 * 60 * 1000,
  /** Repository info cache duration (15 minutes) */
  REPOSITORY: 15 * 60 * 1000,
  /** File content by SHA (content-addressable, long duration - 24 hours) */
  FILE_CONTENT_BY_SHA: 24 * 60 * 60 * 1000,
  /** File content by path (5 minutes) */
  FILE_CONTENT_BY_PATH: 5 * 60 * 1000,
} as const;

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache implementation with TTL support
 */
export class GitHubCache {
  private treeCache = new Map<string, CacheEntry<ParsedRepositoryTree>>();
  private fileContentByShaCache = new Map<string, CacheEntry<ParsedFileContent>>();
  private fileContentByPathCache = new Map<string, CacheEntry<ParsedFileContent>>();
  private repositoryCache = new Map<string, CacheEntry<unknown>>();

  /**
   * Generate a cache key for repository tree
   */
  private getTreeCacheKey(owner: string, repo: string, ref?: string): string {
    return `tree:${owner}/${repo}:${ref ?? 'default'}`;
  }

  /**
   * Generate a cache key for file content by SHA (content-addressable)
   */
  private getFileByShaKey(owner: string, repo: string, sha: string): string {
    return `blob:${owner}/${repo}:${sha}`;
  }

  /**
   * Generate a cache key for file content by path
   */
  private getFileByPathKey(owner: string, repo: string, path: string, ref?: string): string {
    return `file:${owner}/${repo}:${path}:${ref ?? 'default'}`;
  }

  /**
   * Generate a cache key for repository info
   */
  private getRepositoryCacheKey(owner: string, repo: string): string {
    return `repo:${owner}/${repo}`;
  }

  /**
   * Check if a cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get cached repository tree
   */
  getTree(owner: string, repo: string, ref?: string): ParsedRepositoryTree | null {
    const key = this.getTreeCacheKey(owner, repo, ref);
    const entry = this.treeCache.get(key);
    if (this.isValid(entry)) {
      return entry.data;
    }
    this.treeCache.delete(key);
    return null;
  }

  /**
   * Cache repository tree
   */
  setTree(
    owner: string,
    repo: string,
    ref: string | undefined,
    data: ParsedRepositoryTree,
    ttl: number = CACHE_DURATIONS.TREE
  ): void {
    const key = this.getTreeCacheKey(owner, repo, ref);
    this.treeCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached file content by SHA (content-addressable caching)
   * SHA-based caching can use longer TTL since content at a specific SHA never changes
   */
  getFileContentBySha(owner: string, repo: string, sha: string): ParsedFileContent | null {
    const key = this.getFileByShaKey(owner, repo, sha);
    const entry = this.fileContentByShaCache.get(key);
    if (this.isValid(entry)) {
      return entry.data;
    }
    this.fileContentByShaCache.delete(key);
    return null;
  }

  /**
   * Cache file content by SHA
   */
  setFileContentBySha(
    owner: string,
    repo: string,
    sha: string,
    data: ParsedFileContent,
    ttl: number = CACHE_DURATIONS.FILE_CONTENT_BY_SHA
  ): void {
    const key = this.getFileByShaKey(owner, repo, sha);
    this.fileContentByShaCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached file content by path
   */
  getFileContentByPath(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): ParsedFileContent | null {
    const key = this.getFileByPathKey(owner, repo, path, ref);
    const entry = this.fileContentByPathCache.get(key);
    if (this.isValid(entry)) {
      return entry.data;
    }
    this.fileContentByPathCache.delete(key);
    return null;
  }

  /**
   * Cache file content by path
   */
  setFileContentByPath(
    owner: string,
    repo: string,
    path: string,
    ref: string | undefined,
    data: ParsedFileContent,
    ttl: number = CACHE_DURATIONS.FILE_CONTENT_BY_PATH
  ): void {
    const key = this.getFileByPathKey(owner, repo, path, ref);
    this.fileContentByPathCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Also cache by SHA for content-addressable caching
    if (data.sha) {
      this.setFileContentBySha(owner, repo, data.sha, data);
    }
  }

  /**
   * Get cached repository info
   */
  getRepository<T>(owner: string, repo: string): T | null {
    const key = this.getRepositoryCacheKey(owner, repo);
    const entry = this.repositoryCache.get(key);
    if (this.isValid(entry)) {
      return entry.data as T;
    }
    this.repositoryCache.delete(key);
    return null;
  }

  /**
   * Cache repository info
   */
  setRepository<T>(
    owner: string,
    repo: string,
    data: T,
    ttl: number = CACHE_DURATIONS.REPOSITORY
  ): void {
    const key = this.getRepositoryCacheKey(owner, repo);
    this.repositoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate all cached data for a specific repository
   */
  invalidateRepository(owner: string, repo: string): void {
    const prefix = `${owner}/${repo}`;

    // Clear tree cache
    for (const key of this.treeCache.keys()) {
      if (key.includes(prefix)) {
        this.treeCache.delete(key);
      }
    }

    // Clear file content caches
    for (const key of this.fileContentByShaCache.keys()) {
      if (key.includes(prefix)) {
        this.fileContentByShaCache.delete(key);
      }
    }

    for (const key of this.fileContentByPathCache.keys()) {
      if (key.includes(prefix)) {
        this.fileContentByPathCache.delete(key);
      }
    }

    // Clear repository cache
    this.repositoryCache.delete(this.getRepositoryCacheKey(owner, repo));
  }

  /**
   * Invalidate all cached data
   */
  invalidateAll(): void {
    this.treeCache.clear();
    this.fileContentByShaCache.clear();
    this.fileContentByPathCache.clear();
    this.repositoryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    treeEntries: number;
    fileContentByShaEntries: number;
    fileContentByPathEntries: number;
    repositoryEntries: number;
  } {
    return {
      treeEntries: this.treeCache.size,
      fileContentByShaEntries: this.fileContentByShaCache.size,
      fileContentByPathEntries: this.fileContentByPathCache.size,
      repositoryEntries: this.repositoryCache.size,
    };
  }
}

/**
 * Singleton cache instance
 */
let globalCache: GitHubCache | null = null;

/**
 * Get or create the global cache instance
 */
export function getGitHubCache(): GitHubCache {
  if (!globalCache) {
    globalCache = new GitHubCache();
  }
  return globalCache;
}

/**
 * Reset the global cache instance (useful for testing)
 */
export function resetGitHubCache(): void {
  if (globalCache) {
    globalCache.invalidateAll();
  }
  globalCache = null;
}

/**
 * React cache() wrappers for RSC request deduplication
 * These use React's cache() function to deduplicate requests within a single RSC render
 */

/**
 * Create a cached fetch function for repository tree
 * Uses React cache() for request deduplication within a single render
 */
export const cachedFetchTree = cache(
  async (
    fetchFn: (owner: string, repo: string, ref?: string) => Promise<ParsedRepositoryTree>,
    owner: string,
    repo: string,
    ref?: string
  ): Promise<ParsedRepositoryTree> => {
    const memoryCache = getGitHubCache();

    // Check memory cache first
    const cached = memoryCache.getTree(owner, repo, ref);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await fetchFn(owner, repo, ref);

    // Store in memory cache
    memoryCache.setTree(owner, repo, ref, data);

    return data;
  }
);

/**
 * Create a cached fetch function for file content by path
 * Uses React cache() for request deduplication within a single render
 */
export const cachedFetchFileByPath = cache(
  async (
    fetchFn: (
      owner: string,
      repo: string,
      path: string,
      ref?: string
    ) => Promise<ParsedFileContent>,
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<ParsedFileContent> => {
    const memoryCache = getGitHubCache();

    // Check memory cache first
    const cached = memoryCache.getFileContentByPath(owner, repo, path, ref);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await fetchFn(owner, repo, path, ref);

    // Store in memory cache (also caches by SHA)
    memoryCache.setFileContentByPath(owner, repo, path, ref, data);

    return data;
  }
);

/**
 * Create a cached fetch function for file content by SHA
 * Uses React cache() for request deduplication within a single render
 * Content-addressable caching: SHA-based lookups are immutable
 */
export const cachedFetchFileBySha = cache(
  async (
    fetchFn: (owner: string, repo: string, sha: string) => Promise<ParsedFileContent>,
    owner: string,
    repo: string,
    sha: string
  ): Promise<ParsedFileContent> => {
    const memoryCache = getGitHubCache();

    // Check memory cache first
    const cached = memoryCache.getFileContentBySha(owner, repo, sha);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await fetchFn(owner, repo, sha);

    // Store in memory cache
    memoryCache.setFileContentBySha(owner, repo, sha, data);

    return data;
  }
);
