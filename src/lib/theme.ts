/**
 * Theme system utilities and types
 */

export type Theme = "light" | "dark" | "system";

export const THEME_VALUES = ["light", "dark", "system"] as const;

export const THEME_STORAGE_KEY = "theme-preference";

/**
 * Check if a value is a valid theme
 */
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEME_VALUES.includes(value as Theme);
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return "system";
}
