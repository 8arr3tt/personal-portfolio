import { ROUTES, NAV_ITEMS, SOCIAL_LINKS, isActiveRoute } from '../navigation';

describe('navigation utilities', () => {
  describe('ROUTES', () => {
    it('defines correct route paths', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.PROJECTS).toBe('/projects');
    });

    it('PROJECT function generates correct path', () => {
      expect(ROUTES.PROJECT('test-project')).toBe('/projects/test-project');
      expect(ROUTES.PROJECT('another-project')).toBe('/projects/another-project');
    });
  });

  describe('NAV_ITEMS', () => {
    it('contains Home and Projects navigation items', () => {
      expect(NAV_ITEMS).toHaveLength(2);
      expect(NAV_ITEMS[0]?.label).toBe('Home');
      expect(NAV_ITEMS[0]?.href).toBe('/');
      expect(NAV_ITEMS[1]?.label).toBe('Projects');
      expect(NAV_ITEMS[1]?.href).toBe('/projects');
    });

    it('navigation items have required properties', () => {
      NAV_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
      });
    });
  });

  describe('SOCIAL_LINKS', () => {
    it('contains GitHub and LinkedIn links', () => {
      expect(SOCIAL_LINKS).toHaveLength(2);
      expect(SOCIAL_LINKS[0]?.label).toBe('GitHub');
      expect(SOCIAL_LINKS[1]?.label).toBe('LinkedIn');
    });

    it('social links have required properties', () => {
      SOCIAL_LINKS.forEach((link) => {
        expect(link).toHaveProperty('label');
        expect(link).toHaveProperty('href');
        expect(link).toHaveProperty('icon');
        expect(typeof link.label).toBe('string');
        expect(typeof link.href).toBe('string');
      });
    });
  });

  describe('isActiveRoute', () => {
    it('returns true for exact match on home route', () => {
      expect(isActiveRoute('/', '/')).toBe(true);
    });

    it('returns false for non-matching home route', () => {
      expect(isActiveRoute('/projects', '/')).toBe(false);
    });

    it('returns true for routes starting with the given path', () => {
      expect(isActiveRoute('/projects', '/projects')).toBe(true);
      expect(isActiveRoute('/projects/test', '/projects')).toBe(true);
    });

    it('returns false for routes not starting with the given path', () => {
      expect(isActiveRoute('/', '/projects')).toBe(false);
      expect(isActiveRoute('/about', '/projects')).toBe(false);
    });

    it('handles trailing slashes correctly', () => {
      expect(isActiveRoute('/projects/', '/projects')).toBe(true);
    });
  });
});
