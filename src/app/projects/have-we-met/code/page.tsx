'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GitHubClient, ParsedTreeItem, ParsedFileContent } from '@/lib/github';
import { getGitHubCache } from '@/lib/github/cache';
import { ErrorState, LoadingState, FileTreeSkeleton, CodeSkeleton } from '@/components/github';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileJson,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Package,
  GitBranch,
} from 'lucide-react';

const OWNER = '8arr3tt';
const REPO = 'have-we-met';
const GITHUB_URL = `https://github.com/${OWNER}/${REPO}`;
const NPM_URL = 'https://www.npmjs.com/package/have-we-met';

/**
 * Get file icon based on file extension
 */
function getFileIcon(filename: string, isOpen?: boolean) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const name = filename.toLowerCase();

  // Special file names
  if (name === 'package.json') return <FileJson className="h-4 w-4 file-icon-json" />;
  if (name === 'tsconfig.json' || name.includes('tsconfig')) return <FileJson className="h-4 w-4 file-icon-ts" />;
  if (name === 'readme.md') return <FileText className="h-4 w-4 file-icon-md" />;
  if (name.startsWith('.git') || name === '.npmignore' || name === '.prettierignore') {
    return <File className="h-4 w-4 file-icon-config" />;
  }

  // By extension
  switch (ext) {
    case 'ts':
      return <FileCode className="h-4 w-4 file-icon-ts" />;
    case 'tsx':
      return <FileCode className="h-4 w-4 file-icon-tsx" />;
    case 'js':
      return <FileCode className="h-4 w-4 file-icon-js" />;
    case 'jsx':
      return <FileCode className="h-4 w-4 file-icon-jsx" />;
    case 'json':
      return <FileJson className="h-4 w-4 file-icon-json" />;
    case 'md':
      return <FileText className="h-4 w-4 file-icon-md" />;
    case 'css':
      return <FileCode className="h-4 w-4 file-icon-css" />;
    case 'html':
      return <FileCode className="h-4 w-4 file-icon-html" />;
    case 'yml':
    case 'yaml':
      return <File className="h-4 w-4 file-icon-yaml" />;
    default:
      return <File className="h-4 w-4 file-icon-default" />;
  }
}

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
          'file-tree-item w-full text-left',
          isSelected && 'selected'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 file-icon-folder-open shrink-0" />
            ) : (
              <Folder className="h-4 w-4 file-icon-folder shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {getFileIcon(node.name)}
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
    <div className="py-1">
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
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--code-bg)' }}>
        <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
          <div className="h-4 w-4 rounded skeleton" />
          <div className="h-4 w-32 rounded skeleton" />
        </div>
        <div className="flex-1 p-4">
          <CodeSkeleton lines={25} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--code-bg)' }}>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground" style={{ backgroundColor: 'var(--code-bg)' }}>
        <FileCode className="h-16 w-16 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-medium">Select a file to view</p>
          <p className="text-xs opacity-70 mt-1">Browse the repository on the left</p>
        </div>
      </div>
    );
  }

  if (content.isBinary) {
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--code-bg)' }}>
        <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
          {getFileIcon(content.name || content.path)}
          <span className="font-mono text-sm">{content.name || content.path}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Binary file cannot be displayed</p>
        </div>
      </div>
    );
  }

  const lines = content.content?.split('\n') || [];

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--code-bg)' }}>
      {/* File header */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between shrink-0" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(content.name || content.path)}
          <span className="font-mono text-sm truncate">{content.name || content.path}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 ml-4">
          {content.size.toLocaleString()} bytes • {lines.length} lines
        </span>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <pre className="text-sm leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="code-line">
                <span className="code-line-number">{i + 1}</span>
                <span className="code-line-content">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Cache Stats Component
 */
function CacheStats() {
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
    <span>
      {stats.treeEntries} trees, {stats.fileContentByPathEntries + stats.fileContentByShaEntries} files cached
    </span>
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
  const fetchTree = useCallback(async () => {
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
  }, [client]);

  // Fetch file content
  const fetchFile = useCallback(async (path: string) => {
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
  }, [client]);

  // Initial tree fetch
  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

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
    <div className="code-browser min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="border-b border-border/50 px-4 py-3" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
        <div className="max-w-screen-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/projects/have-we-met"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to have-we-met
          </Link>

          {/* Title and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                Code Browser
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Browse the have-we-met source code
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a
                href={NPM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Package className="h-4 w-4" />
                npm
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <CacheStats />
            {rateLimit && (
              <span>
                API: {rateLimit.remaining}/{rateLimit.limit} requests
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content area - split view */}
      <div className="flex-1 flex min-h-0">
        {/* File explorer sidebar */}
        <div
          className="w-64 lg:w-72 xl:w-80 shrink-0 border-r border-border/50 flex flex-col"
          style={{ backgroundColor: 'var(--sidebar-bg)' }}
        >
          {/* Explorer header */}
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30">
            Explorer
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-auto">
            {treeLoading ? (
              <div className="p-3">
                <FileTreeSkeleton items={15} />
              </div>
            ) : treeError ? (
              <div className="p-3">
                <ErrorState error={treeError} onRetry={fetchTree} size="sm" />
              </div>
            ) : (
              <FileTree
                items={treeItems}
                selectedPath={selectedPath}
                onSelectFile={handleSelectFile}
              />
            )}
          </div>
        </div>

        {/* Code viewer */}
        <CodeViewer
          content={fileContent}
          loading={fileLoading}
          error={fileError}
          onRetry={() => selectedPath && fetchFile(selectedPath)}
        />
      </div>
    </div>
  );
}
