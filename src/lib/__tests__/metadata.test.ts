import { SITE_CONFIG, generatePageMetadata, generateProjectMetadata } from '../metadata';

describe('metadata utilities', () => {
  describe('SITE_CONFIG', () => {
    it('contains required site configuration', () => {
      expect(SITE_CONFIG.name).toBe('Portfolio');
      expect(SITE_CONFIG.description).toBeDefined();
      expect(SITE_CONFIG.url).toBeDefined();
      expect(SITE_CONFIG.author).toBeDefined();
      expect(Array.isArray(SITE_CONFIG.keywords)).toBe(true);
    });

    it('has non-empty keywords array', () => {
      expect(SITE_CONFIG.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('generatePageMetadata', () => {
    it('generates basic page metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.title).toBe('Test Page | Portfolio');
      expect(metadata.description).toBe('Test description');
    });

    it('uses site name as-is when title matches', () => {
      const metadata = generatePageMetadata({
        title: 'Portfolio',
      });

      expect(metadata.title).toBe('Portfolio');
    });

    it('uses default description when not provided', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
      });

      expect(metadata.description).toBe(SITE_CONFIG.description);
    });

    it('includes path in OpenGraph metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        path: '/test',
      });

      expect(metadata.openGraph?.url).toContain('/test');
    });

    it('merges custom keywords with site keywords', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        keywords: ['custom', 'keywords'],
      });

      expect(metadata.keywords).toContain('custom');
      expect(metadata.keywords).toContain('keywords');
      expect(metadata.keywords).toContain('portfolio');
    });

    it('includes OpenGraph metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.title).toBe('Test Page | Portfolio');
      expect(metadata.openGraph?.description).toBe('Test description');
    });

    it('includes Twitter metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Test Page | Portfolio');
    });

    it('includes author information', () => {
      const metadata = generatePageMetadata({
        title: 'Test Page',
      });

      expect(metadata.authors).toBeDefined();
      expect(Array.isArray(metadata.authors)).toBe(true);
    });
  });

  describe('generateProjectMetadata', () => {
    it('generates project metadata with proper path', () => {
      const metadata = generateProjectMetadata({
        title: 'My Project',
        description: 'Project description',
        slug: 'my-project',
      });

      expect(metadata.title).toBe('My Project | Portfolio');
      expect(metadata.description).toBe('Project description');
      expect(metadata.openGraph?.url).toContain('/projects/my-project');
    });

    it('includes project tags in keywords', () => {
      const metadata = generateProjectMetadata({
        title: 'My Project',
        description: 'Project description',
        slug: 'my-project',
        tags: ['react', 'typescript'],
      });

      expect(metadata.keywords).toContain('react');
      expect(metadata.keywords).toContain('typescript');
      expect(metadata.keywords).toContain('project');
    });

    it('adds "project" keyword even without tags', () => {
      const metadata = generateProjectMetadata({
        title: 'My Project',
        description: 'Project description',
        slug: 'my-project',
      });

      expect(metadata.keywords).toContain('project');
    });
  });
});
