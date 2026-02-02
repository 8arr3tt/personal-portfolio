'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitHubClient, ParsedTreeItem, ParsedFileContent } from '@/lib/github';
import { getGitHubCache } from '@/lib/github/cache';
import { ErrorState, LoadingState, FileTreeSkeleton, CodeSkeleton } from '@/components/github';
import { GitHubLink } from '@/components/github/github-link';
import { NpmLink } from '@/components/github/npm-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Folder, File, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';

const OWNER = '8arr3tt';
const REPO = 'have-we-met';
const GITHUB_URL = `https://github.com/${OWNER}/${REPO}`;
const NPM_URL = 'https://www.npmjs.com/package/have-we-met';

/**
 * Build a tree structure from flat file list
 */
interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  item?: ParsedTreeItem;
}

function buildTree(items: ParsedTreeItem[]): TreeNode[] {
  const root: TreeNode[] = [];
  const pathMap = new Map<string, TreeNode>();

  // Sort items: directories first, then files, alphabetically
  const sortedItems = [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.path.localeCompare(b.path);
  });

  for (const item of sortedItems) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1] || item.path;
    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type,
      item,
      children: item.type === 'directory' ? [] : undefined,
    };

    pathMap.set(item.path, node);

    if (parts.length === 1) {
      // Root level item
      root.push(node);
    } else {
      // Find parent
      const parentPath = parts.slice(0, -1).join('/');
      const parent = pathMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

/**
 * File Tree Item Component
 */
interface FileTreeItemProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

function FileTreeItem({
  node,
  depth,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
}: FileTreeItemProps) {
  const isDirectory = node.type === 'directory';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (isDirectory) {
      onToggle(node.path);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1 text-sm text-left hover:bg-muted/50 rounded transition-colors',
          isSelected && 'bg-muted font-medium'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <Folder className="h-4 w-4 text-blue-500 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * File Tree Component
 */
interface FileTreeProps {
  items: ParsedTreeItem[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

function FileTree({ items, selectedPath, onSelectFile }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['src']));
  const tree = buildTree(items);

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="py-2">
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelectFile}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

/**
 * Code Viewer Component
 */
interface CodeViewerProps {
  content: ParsedFileContent | null;
  loading: boolean;
  error: unknown | null;
  onRetry: () => void;
}

function CodeViewer({ content, loading, error, onRetry }: CodeViewerProps) {
  if (loading) {
    return <CodeSkeleton lines={20} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Select a file from the tree to view its contents
        </CardContent>
      </Card>
    );
  }

  if (content.isBinary) {
    return (
      <Card>
        <CardHeader className="border-b py-3 px-4">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="font-mono text-sm">{content.name || content.path}</span>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center text-muted-foreground">
          Binary file cannot be displayed
        </CardContent>
      </Card>
    );
  }

  const lines = content.content?.split('\n') || [];

  return (
    <Card>
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="font-mono text-sm">{content.name || content.path}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {content.size.toLocaleString()} bytes
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[600px]">
        <pre className="p-4 text-sm">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-12 pr-4 text-right text-muted-foreground select-none shrink-0">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * Cache Stats Component
 */
interface CacheStatsProps {
  className?: string;
}

function CacheStats({ className }: CacheStatsProps) {
  const [stats, setStats] = useState<ReturnType<typeof getGitHubCache>['getStats'] extends () => infer R ? R : never>();

  useEffect(() => {
    const cache = getGitHubCache();
    setStats(cache.getStats());

    const interval = setInterval(() => {
      setStats(cache.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className={cn('text-xs text-muted-foreground', className)}>
      <span>Cache: </span>
      <span>{stats.treeEntries} trees, </span>
      <span>{stats.fileContentByPathEntries} files (path), </span>
      <span>{stats.fileContentByShaEntries} files (sha)</span>
    </div>
  );
}

/**
 * Main Code Browser Page
 */
export default function CodeBrowserPage() {
  const [client] = useState(() => new GitHubClient());
  const [treeItems, setTreeItems] = useState<ParsedTreeItem[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState<unknown | null>(null);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<ParsedFileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<unknown | null>(null);

  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | null>(null);

  // Fetch repository tree
  const fetchTree = async () => {
    setTreeLoading(true);
    setTreeError(null);
    try {
      const result = await client.getRepositoryFiles(OWNER, REPO);
      setTreeItems(result.data.all);
      setRateLimit({ remaining: result.rateLimit.remaining, limit: result.rateLimit.limit });
    } catch (err) {
      setTreeError(err);
    } finally {
      setTreeLoading(false);
    }
  };

  // Fetch file content
  const fetchFile = async (path: string) => {
    setFileLoading(true);
    setFileError(null);
    try {
      const result = await client.getFileContent(OWNER, REPO, path);
      setFileContent(result.data);
      setRateLimit({ remaining: result.rateLimit.remaining, limit: result.rateLimit.limit });
    } catch (err) {
      setFileError(err);
    } finally {
      setFileLoading(false);
    }
  };

  // Initial tree fetch
  useEffect(() => {
    fetchTree();
  }, []);

  // Handle file selection
  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    fetchFile(path);
  };

  // Invalidate cache and refetch
  const handleRefresh = () => {
    client.invalidateCache(OWNER, REPO);
    setSelectedPath(null);
    setFileContent(null);
    fetchTree();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/projects/have-we-met"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to have-we-met
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Code Browser</h1>
          <p className="text-muted-foreground mb-4">
            Browse the have-we-met source code directly from GitHub
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <GitHubLink href={GITHUB_URL} />
            <NpmLink href={NPM_URL} />
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <CacheStats />
          {rateLimit && (
            <div className="text-xs text-muted-foreground">
              API Rate Limit: {rateLimit.remaining}/{rateLimit.limit} requests remaining
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File tree sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card>
              <CardHeader className="border-b py-3 px-4">
                <CardTitle className="text-sm font-medium">Repository Files</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-auto">
                {treeLoading ? (
                  <div className="p-4">
                    <FileTreeSkeleton items={12} />
                  </div>
                ) : treeError ? (
                  <div className="p-4">
                    <ErrorState error={treeError} onRetry={fetchTree} size="sm" />
                  </div>
                ) : (
                  <FileTree
                    items={treeItems}
                    selectedPath={selectedPath}
                    onSelectFile={handleSelectFile}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Code viewer */}
          <div className="lg:col-span-8 xl:col-span-9">
            <CodeViewer
              content={fileContent}
              loading={fileLoading}
              error={fileError}
              onRetry={() => selectedPath && fetchFile(selectedPath)}
            />
          </div>
        </div>

        {/* Info section */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">About this Page</h2>
              <p className="text-muted-foreground text-sm mb-4">
                This page demonstrates the GitHub API integration for the portfolio. It fetches
                the repository file structure and file contents directly from GitHub, with
                caching to minimize API requests.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Features</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>Repository tree fetching</li>
                    <li>File content retrieval</li>
                    <li>Error state handling</li>
                    <li>Loading skeletons</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Caching</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>30-minute tree cache</li>
                    <li>5-minute file path cache</li>
                    <li>24-hour SHA-based cache</li>
                    <li>Cache invalidation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Error Handling</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>Rate limit detection</li>
                    <li>Network error recovery</li>
                    <li>Not found handling</li>
                    <li>Retry functionality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
