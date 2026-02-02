import {
  GitHubClient,
  createGitHubClient,
  getGitHubClient,
  GitHubApiError,
  GitHubRateLimitError,
  GitHubNotFoundError,
  GitHubAuthError,
  GitHubTree,
  ParsedRepositoryTree,
  GitHubFileContent,
  GitHubBlob,
  ParsedFileContent,
} from '../../github';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to create mock response
function createMockResponse(
  data: unknown,
  options: {
    status?: number;
    ok?: boolean;
    headers?: Record<string, string>;
  } = {}
) {
  const { status = 200, ok = true, headers = {} } = options;

  const defaultHeaders = {
    'x-ratelimit-limit': '60',
    'x-ratelimit-remaining': '59',
    'x-ratelimit-reset': '1700000000',
    'x-ratelimit-used': '1',
    ...headers,
  };

  return {
    ok,
    status,
    headers: new Headers(defaultHeaders),
    json: jest.fn().mockResolvedValue(data),
  };
}

describe('GitHubClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Clear environment token for tests
    delete process.env.GITHUB_TOKEN;
  });

  describe('constructor', () => {
    it('creates client without token', () => {
      const client = new GitHubClient();
      expect(client.hasToken()).toBe(false);
    });

    it('creates client with provided token', () => {
      const client = new GitHubClient({ token: 'test-token' });
      expect(client.hasToken()).toBe(true);
    });

    it('uses GITHUB_TOKEN from environment', () => {
      process.env.GITHUB_TOKEN = 'env-token';
      const client = new GitHubClient();
      expect(client.hasToken()).toBe(true);
    });

    it('prefers provided token over environment token', () => {
      process.env.GITHUB_TOKEN = 'env-token';
      const client = new GitHubClient({ token: 'provided-token' });
      expect(client.hasToken()).toBe(true);
    });

    it('uses custom base URL when provided', () => {
      const client = new GitHubClient({ baseUrl: 'https://github.example.com/api' });
      expect(client.hasToken()).toBe(false);
    });
  });

  describe('request', () => {
    it('makes authenticated request when token is provided', async () => {
      const client = new GitHubClient({ token: 'test-token' });
      const mockData = { id: 1, name: 'test-repo' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await client.request('/repos/owner/repo');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('makes unauthenticated request without token', async () => {
      const client = new GitHubClient();
      const mockData = { id: 1, name: 'test-repo' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await client.request('/repos/owner/repo');

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBeUndefined();
    });

    it('returns data with rate limit information', async () => {
      const client = new GitHubClient();
      const mockData = { id: 1, name: 'test-repo' };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockData, {
          headers: {
            'x-ratelimit-limit': '60',
            'x-ratelimit-remaining': '58',
            'x-ratelimit-reset': '1700000000',
            'x-ratelimit-used': '2',
          },
        })
      );

      const result = await client.request('/repos/owner/repo');

      expect(result.data).toEqual(mockData);
      expect(result.rateLimit).toEqual({
        limit: 60,
        remaining: 58,
        reset: 1700000000,
        used: 2,
      });
    });

    it('updates internal rate limit state', async () => {
      const client = new GitHubClient();
      const mockData = { id: 1 };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockData, {
          headers: {
            'x-ratelimit-remaining': '45',
          },
        })
      );

      expect(client.getRateLimit()).toBeNull();
      expect(client.getRemainingRequests()).toBeNull();

      await client.request('/test');

      expect(client.getRateLimit()).toBeDefined();
      expect(client.getRemainingRequests()).toBe(45);
    });

    it('handles full URLs', async () => {
      const client = new GitHubClient();
      const mockData = { id: 1 };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await client.request('https://api.github.com/custom/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/custom/endpoint',
        expect.anything()
      );
    });
  });

  describe('error handling', () => {
    it('throws GitHubRateLimitError when rate limited', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'API rate limit exceeded' },
          {
            status: 403,
            ok: false,
            headers: {
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': '1700000000',
            },
          }
        )
      );

      await expect(client.request('/test')).rejects.toThrow(GitHubRateLimitError);
    });

    it('includes reset time in rate limit error', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'API rate limit exceeded' },
          {
            status: 403,
            ok: false,
            headers: {
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': '1700000000',
            },
          }
        )
      );

      try {
        await client.request('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubRateLimitError);
        const rateLimitError = error as GitHubRateLimitError;
        expect(rateLimitError.getResetTime()).toBeInstanceOf(Date);
        expect(rateLimitError.rateLimit.remaining).toBe(0);
      }
    });

    it('throws GitHubNotFoundError on 404', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Not Found' },
          { status: 404, ok: false }
        )
      );

      await expect(client.request('/repos/unknown/repo')).rejects.toThrow(
        GitHubNotFoundError
      );
    });

    it('throws GitHubAuthError on 401', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Bad credentials' },
          { status: 401, ok: false }
        )
      );

      await expect(client.request('/test')).rejects.toThrow(GitHubAuthError);
    });

    it('throws GitHubApiError for other errors', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Internal Server Error' },
          { status: 500, ok: false }
        )
      );

      await expect(client.request('/test')).rejects.toThrow(GitHubApiError);
    });
  });

  describe('getRepository', () => {
    it('fetches repository information', async () => {
      const client = new GitHubClient();
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        full_name: 'owner/test-repo',
        owner: {
          login: 'owner',
          id: 1,
          avatar_url: 'https://avatars.githubusercontent.com/u/1',
          html_url: 'https://github.com/owner',
          type: 'User',
        },
        html_url: 'https://github.com/owner/test-repo',
        description: 'A test repository',
        fork: false,
        url: 'https://api.github.com/repos/owner/test-repo',
        default_branch: 'main',
        visibility: 'public',
        stargazers_count: 10,
        watchers_count: 10,
        forks_count: 5,
        open_issues_count: 2,
        language: 'TypeScript',
        topics: ['typescript', 'react'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-06-01T00:00:00Z',
        pushed_at: '2023-06-01T00:00:00Z',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepo));

      const result = await client.getRepository('owner', 'test-repo');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/test-repo',
        expect.anything()
      );
      expect(result.data).toEqual(mockRepo);
      expect(result.data.name).toBe('test-repo');
      expect(result.data.owner.login).toBe('owner');
    });
  });

  describe('getRepositoryTree', () => {
    const mockTreeResponse: GitHubTree = {
      sha: 'abc123',
      url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
      tree: [
        {
          path: 'src',
          mode: '040000',
          type: 'tree',
          sha: 'dir123',
          url: 'https://api.github.com/repos/owner/repo/git/trees/dir123',
        },
        {
          path: 'src/index.ts',
          mode: '100644',
          type: 'blob',
          sha: 'file123',
          size: 1234,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/file123',
        },
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: 'readme123',
          size: 500,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/readme123',
        },
      ],
      truncated: false,
    };

    const mockRepoResponse = {
      id: 123,
      name: 'repo',
      full_name: 'owner/repo',
      owner: { login: 'owner', id: 1, avatar_url: '', html_url: '', type: 'User' },
      html_url: 'https://github.com/owner/repo',
      description: null,
      fork: false,
      url: 'https://api.github.com/repos/owner/repo',
      default_branch: 'main',
      visibility: 'public',
      stargazers_count: 0,
      watchers_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      language: null,
      topics: [],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      pushed_at: '2023-01-01T00:00:00Z',
    };

    it('fetches repository tree with specified ref', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryTree('owner', 'repo', 'main');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
        expect.anything()
      );
      expect(result.data.sha).toBe('abc123');
      expect(result.data.tree).toHaveLength(3);
      expect(result.data.truncated).toBe(false);
    });

    it('fetches default branch when ref not provided', async () => {
      const client = new GitHubClient();
      // First call: getRepository to get default branch
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepoResponse));
      // Second call: getTree
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryTree('owner', 'repo');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://api.github.com/repos/owner/repo',
        expect.anything()
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
        expect.anything()
      );
      expect(result.data.sha).toBe('abc123');
    });

    it('supports non-recursive tree fetching', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      await client.getRepositoryTree('owner', 'repo', 'main', false);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/trees/main',
        expect.anything()
      );
    });

    it('handles truncated trees', async () => {
      const client = new GitHubClient();
      const truncatedResponse = { ...mockTreeResponse, truncated: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(truncatedResponse));

      const result = await client.getRepositoryTree('owner', 'repo', 'main');

      expect(result.data.truncated).toBe(true);
    });

    it('returns file metadata including path, type, sha, and size', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryTree('owner', 'repo', 'main');

      const file = result.data.tree.find((item) => item.path === 'src/index.ts');
      expect(file).toBeDefined();
      expect(file?.type).toBe('blob');
      expect(file?.sha).toBe('file123');
      expect(file?.size).toBe(1234);

      const directory = result.data.tree.find((item) => item.path === 'src');
      expect(directory).toBeDefined();
      expect(directory?.type).toBe('tree');
      expect(directory?.sha).toBe('dir123');
      expect(directory?.size).toBeUndefined();
    });

    it('handles nested directories', async () => {
      const client = new GitHubClient();
      const nestedTreeResponse: GitHubTree = {
        sha: 'abc123',
        url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
        tree: [
          {
            path: 'src',
            mode: '040000',
            type: 'tree',
            sha: 'src123',
            url: 'https://api.github.com/repos/owner/repo/git/trees/src123',
          },
          {
            path: 'src/components',
            mode: '040000',
            type: 'tree',
            sha: 'comp123',
            url: 'https://api.github.com/repos/owner/repo/git/trees/comp123',
          },
          {
            path: 'src/components/Button',
            mode: '040000',
            type: 'tree',
            sha: 'btn123',
            url: 'https://api.github.com/repos/owner/repo/git/trees/btn123',
          },
          {
            path: 'src/components/Button/index.tsx',
            mode: '100644',
            type: 'blob',
            sha: 'btnfile123',
            size: 800,
            url: 'https://api.github.com/repos/owner/repo/git/blobs/btnfile123',
          },
        ],
        truncated: false,
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(nestedTreeResponse));

      const result = await client.getRepositoryTree('owner', 'repo', 'main');

      expect(result.data.tree).toHaveLength(4);

      const deepFile = result.data.tree.find(
        (item) => item.path === 'src/components/Button/index.tsx'
      );
      expect(deepFile).toBeDefined();
      expect(deepFile?.type).toBe('blob');
    });
  });

  describe('getRepositoryFiles', () => {
    const mockTreeResponse: GitHubTree = {
      sha: 'abc123',
      url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
      tree: [
        {
          path: 'src',
          mode: '040000',
          type: 'tree',
          sha: 'dir123',
          url: 'https://api.github.com/repos/owner/repo/git/trees/dir123',
        },
        {
          path: 'src/lib',
          mode: '040000',
          type: 'tree',
          sha: 'lib123',
          url: 'https://api.github.com/repos/owner/repo/git/trees/lib123',
        },
        {
          path: 'src/index.ts',
          mode: '100644',
          type: 'blob',
          sha: 'file123',
          size: 1234,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/file123',
        },
        {
          path: 'src/lib/utils.ts',
          mode: '100644',
          type: 'blob',
          sha: 'utils123',
          size: 500,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/utils123',
        },
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: 'readme123',
          size: 200,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/readme123',
        },
      ],
      truncated: false,
    };

    it('parses tree into files and directories', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryFiles('owner', 'repo', 'main');

      expect(result.data.sha).toBe('abc123');
      expect(result.data.truncated).toBe(false);
      expect(result.data.files).toHaveLength(3);
      expect(result.data.directories).toHaveLength(2);
      expect(result.data.all).toHaveLength(5);
    });

    it('extracts name from path', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryFiles('owner', 'repo', 'main');

      const file = result.data.files.find((f) => f.path === 'src/lib/utils.ts');
      expect(file?.name).toBe('utils.ts');

      const dir = result.data.directories.find((d) => d.path === 'src/lib');
      expect(dir?.name).toBe('lib');
    });

    it('categorizes items by type correctly', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryFiles('owner', 'repo', 'main');

      // All files should have type 'file'
      result.data.files.forEach((file) => {
        expect(file.type).toBe('file');
      });

      // All directories should have type 'directory'
      result.data.directories.forEach((dir) => {
        expect(dir.type).toBe('directory');
      });
    });

    it('preserves size for files', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getRepositoryFiles('owner', 'repo', 'main');

      const fileWithSize = result.data.files.find((f) => f.path === 'src/index.ts');
      expect(fileWithSize?.size).toBe(1234);
    });
  });

  describe('getDirectoryContents', () => {
    const mockTreeResponse: GitHubTree = {
      sha: 'abc123',
      url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
      tree: [
        {
          path: 'src',
          mode: '040000',
          type: 'tree',
          sha: 'src123',
          url: 'https://api.github.com/repos/owner/repo/git/trees/src123',
        },
        {
          path: 'src/components',
          mode: '040000',
          type: 'tree',
          sha: 'comp123',
          url: 'https://api.github.com/repos/owner/repo/git/trees/comp123',
        },
        {
          path: 'src/index.ts',
          mode: '100644',
          type: 'blob',
          sha: 'srcindex123',
          size: 100,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/srcindex123',
        },
        {
          path: 'src/components/Button.tsx',
          mode: '100644',
          type: 'blob',
          sha: 'btn123',
          size: 500,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/btn123',
        },
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: 'readme123',
          size: 200,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/readme123',
        },
        {
          path: 'package.json',
          mode: '100644',
          type: 'blob',
          sha: 'pkg123',
          size: 800,
          url: 'https://api.github.com/repos/owner/repo/git/blobs/pkg123',
        },
      ],
      truncated: false,
    };

    it('returns root level items when no path provided', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getDirectoryContents('owner', 'repo', '', 'main');

      expect(result.data).toHaveLength(3); // src, README.md, package.json
      const names = result.data.map((item) => item.name);
      expect(names).toContain('src');
      expect(names).toContain('README.md');
      expect(names).toContain('package.json');
    });

    it('returns contents of specific directory', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getDirectoryContents('owner', 'repo', 'src', 'main');

      expect(result.data).toHaveLength(2); // components, index.ts
      const names = result.data.map((item) => item.name);
      expect(names).toContain('components');
      expect(names).toContain('index.ts');
    });

    it('returns contents of nested directory', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getDirectoryContents('owner', 'repo', 'src/components', 'main');

      expect(result.data).toHaveLength(1); // Button.tsx
      expect(result.data[0].name).toBe('Button.tsx');
    });

    it('handles paths with leading/trailing slashes', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getDirectoryContents('owner', 'repo', '/src/', 'main');

      expect(result.data).toHaveLength(2);
      const names = result.data.map((item) => item.name);
      expect(names).toContain('components');
      expect(names).toContain('index.ts');
    });

    it('returns empty array for non-existent directory', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockTreeResponse));

      const result = await client.getDirectoryContents('owner', 'repo', 'nonexistent', 'main');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getFileContent', () => {
    // Helper to encode string to base64
    function toBase64(str: string): string {
      return Buffer.from(str).toString('base64');
    }

    const mockFileContentResponse: GitHubFileContent = {
      name: 'index.ts',
      path: 'src/index.ts',
      sha: 'abc123',
      size: 42,
      url: 'https://api.github.com/repos/owner/repo/contents/src/index.ts',
      html_url: 'https://github.com/owner/repo/blob/main/src/index.ts',
      git_url: 'https://api.github.com/repos/owner/repo/git/blobs/abc123',
      download_url: 'https://raw.githubusercontent.com/owner/repo/main/src/index.ts',
      type: 'file',
      content: toBase64('export const hello = "world";'),
      encoding: 'base64',
    };

    it('fetches file content by path', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      const result = await client.getFileContent('owner', 'repo', 'src/index.ts');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/src/index.ts',
        expect.anything()
      );
      expect(result.data.name).toBe('index.ts');
      expect(result.data.path).toBe('src/index.ts');
      expect(result.data.sha).toBe('abc123');
    });

    it('decodes base64 content correctly', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      const result = await client.getFileContent('owner', 'repo', 'src/index.ts');

      expect(result.data.content).toBe('export const hello = "world";');
      expect(result.data.isBinary).toBe(false);
    });

    it('supports fetching file at specific ref', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      await client.getFileContent('owner', 'repo', 'src/index.ts', 'develop');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/src/index.ts?ref=develop',
        expect.anything()
      );
    });

    it('normalizes paths with leading slashes', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      await client.getFileContent('owner', 'repo', '/src/index.ts');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/src/index.ts',
        expect.anything()
      );
    });

    it('returns file metadata', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      const result = await client.getFileContent('owner', 'repo', 'src/index.ts');

      expect(result.data.size).toBe(42);
      expect(result.data.encoding).toBe('base64');
      expect(result.data.rawContent).toBe(mockFileContentResponse.content);
    });

    it('handles binary files by extension', async () => {
      const client = new GitHubClient();
      const binaryResponse: GitHubFileContent = {
        ...mockFileContentResponse,
        name: 'image.png',
        path: 'assets/image.png',
        content: toBase64('\x89PNG\r\n\x1a\n'), // PNG magic bytes
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(binaryResponse));

      const result = await client.getFileContent('owner', 'repo', 'assets/image.png');

      expect(result.data.isBinary).toBe(true);
      expect(result.data.content).toBeNull();
      expect(result.data.rawContent).toBe(binaryResponse.content);
    });

    it('handles content with null bytes as binary', async () => {
      const client = new GitHubClient();
      const binaryResponse: GitHubFileContent = {
        ...mockFileContentResponse,
        name: 'data.bin',
        path: 'data.bin',
        content: toBase64('hello\x00world'), // Contains null byte
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(binaryResponse));

      const result = await client.getFileContent('owner', 'repo', 'data.bin');

      expect(result.data.isBinary).toBe(true);
      expect(result.data.content).toBeNull();
    });

    it('handles base64 content with newlines', async () => {
      const client = new GitHubClient();
      const longContent = 'a'.repeat(100);
      // GitHub often splits base64 into lines
      const base64WithNewlines = Buffer.from(longContent).toString('base64').match(/.{1,76}/g)?.join('\n') || '';
      const responseWithNewlines: GitHubFileContent = {
        ...mockFileContentResponse,
        content: base64WithNewlines,
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseWithNewlines));

      const result = await client.getFileContent('owner', 'repo', 'src/index.ts');

      expect(result.data.content).toBe(longContent);
    });

    it('handles 404 for non-existent files', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Not Found' },
          { status: 404, ok: false }
        )
      );

      await expect(
        client.getFileContent('owner', 'repo', 'nonexistent.ts')
      ).rejects.toThrow(GitHubNotFoundError);
    });
  });

  describe('getFileContentBySha', () => {
    function toBase64(str: string): string {
      return Buffer.from(str).toString('base64');
    }

    const mockBlobResponse: GitHubBlob = {
      sha: 'abc123',
      node_id: 'MDQ6QmxvYjEyMzQ1',
      size: 42,
      url: 'https://api.github.com/repos/owner/repo/git/blobs/abc123',
      content: toBase64('export const hello = "world";'),
      encoding: 'base64',
    };

    it('fetches blob content by SHA', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockBlobResponse));

      const result = await client.getFileContentBySha('owner', 'repo', 'abc123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/blobs/abc123',
        expect.anything()
      );
      expect(result.data.sha).toBe('abc123');
    });

    it('decodes base64 blob content', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockBlobResponse));

      const result = await client.getFileContentBySha('owner', 'repo', 'abc123');

      expect(result.data.content).toBe('export const hello = "world";');
      expect(result.data.isBinary).toBe(false);
    });

    it('preserves blob metadata', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockBlobResponse));

      const result = await client.getFileContentBySha('owner', 'repo', 'abc123');

      expect(result.data.size).toBe(42);
      expect(result.data.encoding).toBe('base64');
      expect(result.data.rawContent).toBe(mockBlobResponse.content);
    });

    it('handles binary blob content', async () => {
      const client = new GitHubClient();
      const binaryBlobResponse: GitHubBlob = {
        ...mockBlobResponse,
        content: toBase64('\x00\x01\x02\x03'), // Binary data with null bytes
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(binaryBlobResponse));

      const result = await client.getFileContentBySha('owner', 'repo', 'abc123');

      expect(result.data.isBinary).toBe(true);
      expect(result.data.content).toBeNull();
    });

    it('sets empty name and path for blob content', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockBlobResponse));

      const result = await client.getFileContentBySha('owner', 'repo', 'abc123');

      // Blob API doesn't provide name/path info
      expect(result.data.name).toBe('');
      expect(result.data.path).toBe('');
    });
  });

  describe('getRawFileContent', () => {
    function toBase64(str: string): string {
      return Buffer.from(str).toString('base64');
    }

    const mockFileContentResponse: GitHubFileContent = {
      name: 'config.json',
      path: 'config.json',
      sha: 'def456',
      size: 25,
      url: 'https://api.github.com/repos/owner/repo/contents/config.json',
      html_url: 'https://github.com/owner/repo/blob/main/config.json',
      git_url: 'https://api.github.com/repos/owner/repo/git/blobs/def456',
      download_url: 'https://raw.githubusercontent.com/owner/repo/main/config.json',
      type: 'file',
      content: toBase64('{"key": "value"}'),
      encoding: 'base64',
    };

    it('returns decoded content directly', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      const result = await client.getRawFileContent('owner', 'repo', 'config.json');

      expect(result.data).toBe('{"key": "value"}');
    });

    it('returns null for binary files', async () => {
      const client = new GitHubClient();
      const binaryResponse: GitHubFileContent = {
        ...mockFileContentResponse,
        name: 'image.jpg',
        path: 'image.jpg',
        content: toBase64('\xff\xd8\xff\xe0'), // JPEG magic bytes
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(binaryResponse));

      const result = await client.getRawFileContent('owner', 'repo', 'image.jpg');

      expect(result.data).toBeNull();
    });

    it('supports ref parameter', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(createMockResponse(mockFileContentResponse));

      await client.getRawFileContent('owner', 'repo', 'config.json', 'v1.0.0');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/config.json?ref=v1.0.0',
        expect.anything()
      );
    });

    it('includes rate limit in response', async () => {
      const client = new GitHubClient();
      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockFileContentResponse, {
          headers: {
            'x-ratelimit-remaining': '42',
          },
        })
      );

      const result = await client.getRawFileContent('owner', 'repo', 'config.json');

      expect(result.rateLimit.remaining).toBe(42);
    });
  });
});

describe('createGitHubClient', () => {
  it('creates a new client instance', () => {
    const client = createGitHubClient();
    expect(client).toBeInstanceOf(GitHubClient);
  });

  it('creates client with config', () => {
    const client = createGitHubClient({ token: 'my-token' });
    expect(client.hasToken()).toBe(true);
  });
});

describe('getGitHubClient', () => {
  it('returns a client instance', () => {
    const client = getGitHubClient();
    expect(client).toBeInstanceOf(GitHubClient);
  });

  it('returns the same instance on subsequent calls', () => {
    const client1 = getGitHubClient();
    const client2 = getGitHubClient();
    expect(client1).toBe(client2);
  });
});

describe('Error classes', () => {
  describe('GitHubApiError', () => {
    it('has correct name and message', () => {
      const error = new GitHubApiError('Test error', 500);
      expect(error.name).toBe('GitHubApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('GitHubRateLimitError', () => {
    it('has correct name and rate limit info', () => {
      const rateLimit = {
        limit: 60,
        remaining: 0,
        reset: 1700000000,
        used: 60,
      };
      const error = new GitHubRateLimitError('Rate limit exceeded', rateLimit);
      expect(error.name).toBe('GitHubRateLimitError');
      expect(error.rateLimit).toEqual(rateLimit);
      expect(error.statusCode).toBe(403);
    });

    it('calculates reset time correctly', () => {
      const resetTimestamp = 1700000000;
      const rateLimit = {
        limit: 60,
        remaining: 0,
        reset: resetTimestamp,
        used: 60,
      };
      const error = new GitHubRateLimitError('Rate limit exceeded', rateLimit);
      const resetTime = error.getResetTime();
      expect(resetTime.getTime()).toBe(resetTimestamp * 1000);
    });
  });

  describe('GitHubNotFoundError', () => {
    it('has correct name and status code', () => {
      const error = new GitHubNotFoundError('Not found');
      expect(error.name).toBe('GitHubNotFoundError');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('GitHubAuthError', () => {
    it('has correct name and status code', () => {
      const error = new GitHubAuthError('Unauthorized');
      expect(error.name).toBe('GitHubAuthError');
      expect(error.statusCode).toBe(401);
    });
  });
});
