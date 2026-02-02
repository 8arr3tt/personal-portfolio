import { Metadata } from 'next';

/**
 * Base site configuration for metadata
 */
export const SITE_CONFIG = {
  name: 'Portfolio',
  description: 'A modern portfolio showcasing my projects and work.',
  url: 'https://example.com', // Replace with actual URL
  author: 'Your Name', // Replace with actual name
  keywords: [
    'portfolio',
    'projects',
    'web development',
    'software engineer',
  ],
} as const;

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  keywords = [],
}: {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const finalDescription = description || SITE_CONFIG.description;
  const url = `${SITE_CONFIG.url}${path}`;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];

  return {
    title: fullTitle,
    description: finalDescription,
    keywords: allKeywords,
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description: finalDescription,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
    },
  };
}

/**
 * Generate metadata for a project page
 */
export function generateProjectMetadata({
  title,
  description,
  slug,
  tags = [],
}: {
  title: string;
  description: string;
  slug: string;
  tags?: string[];
}): Metadata {
  return generatePageMetadata({
    title,
    description,
    path: `/projects/${slug}`,
    keywords: [...tags, 'project'],
  });
}
