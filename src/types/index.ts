/**
 * Core type definitions for the portfolio application
 */

/**
 * Known link types for type-safe link handling
 */
export type ProjectLinkType = 'github' | 'npm' | 'demo' | 'docs' | 'article' | 'code' | 'other';

/**
 * Project type definition
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;

  /** URL-friendly slug for routing */
  slug: string;

  /** Project title */
  title: string;

  /** Short description of the project */
  description: string;

  /** Longer content/body (will be MDX in Phase 2) */
  content?: string;

  /** Project thumbnail or featured image */
  image?: string;

  /** Technologies/tags used in the project */
  tags?: string[];

  /** Project start date */
  startDate?: Date;

  /** Project end date (optional for ongoing projects) */
  endDate?: Date;

  /** External links (GitHub, live demo, etc.) */
  links?: ProjectLink[];

  /** Whether the project is published/visible */
  published?: boolean;

  /** Whether this is a featured project (displayed prominently) */
  featured?: boolean;

  /** Project status */
  status?: 'completed' | 'in-progress' | 'planned';
}

/**
 * External link for a project
 */
export interface ProjectLink {
  /** Link type for categorization and icon display */
  type: ProjectLinkType;

  /** Display label for the link */
  label: string;

  /** URL for the link */
  url: string;

  /** Whether this is an internal link (uses Next.js Link) */
  internal?: boolean;
}

/**
 * Metadata for project listings
 */
export interface ProjectMetadata {
  slug: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
  date?: Date;
  published?: boolean;
}

/**
 * Theme type definition
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Navigation item type
 */
export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}
