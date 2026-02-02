/**
 * Navigation routes and utilities for type-safe routing
 */

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT: (slug: string) => `/projects/${slug}`,
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Navigation items for the main menu
 */
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: ROUTES.HOME,
  },
  {
    label: 'Projects',
    href: ROUTES.PROJECTS,
  },
];

/**
 * Social media links
 */
export interface SocialLink {
  label: string;
  href: string;
  icon?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: 'github',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: 'linkedin',
  },
];

/**
 * Check if a route is currently active
 */
export function isActiveRoute(currentPath: string, routePath: string): boolean {
  if (routePath === ROUTES.HOME) {
    return currentPath === routePath;
  }
  return currentPath.startsWith(routePath);
}
