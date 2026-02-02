import { type ReactElement } from "react";

/**
 * MDX Utilities
 *
 * This module provides utilities for working with MDX content in the portfolio.
 * It handles dynamic MDX loading, content caching, and metadata extraction.
 */

export interface MDXFrontmatter {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface MDXContent {
  content: ReactElement;
  frontmatter: MDXFrontmatter;
}

/**
 * Dynamically imports an MDX file from the content/projects directory.
 * Returns null if the file doesn't exist.
 *
 * @param slug - The project slug (filename without extension)
 * @returns The MDX module with default export (component) and metadata
 */
export async function getProjectMDX(
  slug: string
): Promise<{ default: React.ComponentType; frontmatter?: MDXFrontmatter } | null> {
  try {
    // Dynamic import of MDX files from the content/projects directory
    const mdxModule = await import(`@/content/projects/${slug}.mdx`);
    return mdxModule;
  } catch {
    // File doesn't exist or failed to load
    return null;
  }
}

/**
 * Gets a list of all available project slugs by checking the content directory.
 * This is useful for static generation of project pages.
 *
 * Note: In production, you may want to use fs to read the directory,
 * but for client-side compatibility, we maintain a manual list.
 */
export function getAllProjectSlugs(): string[] {
  // This list should be updated when adding new projects
  // In a more dynamic setup, you could read from the filesystem at build time
  return ["have-we-met"];
}

/**
 * Validates that a slug is safe to use in dynamic imports.
 * Prevents directory traversal attacks.
 *
 * @param slug - The slug to validate
 * @returns true if the slug is safe
 */
export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return validSlugPattern.test(slug);
}

/**
 * Type guard to check if a module has MDX frontmatter
 */
export function hasFrontmatter(
  module: unknown
): module is { frontmatter: MDXFrontmatter } {
  return (
    typeof module === "object" &&
    module !== null &&
    "frontmatter" in module &&
    typeof (module as { frontmatter: unknown }).frontmatter === "object"
  );
}
