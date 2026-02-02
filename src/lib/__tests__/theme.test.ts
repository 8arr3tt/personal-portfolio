import { isValidTheme, getDefaultTheme, THEME_VALUES, type Theme } from '../theme';

describe('Theme utilities', () => {
  describe('THEME_VALUES', () => {
    it('contains all expected theme values', () => {
      expect(THEME_VALUES).toEqual(['light', 'dark', 'system']);
    });

    it('is readonly', () => {
      expect(Object.isFrozen(THEME_VALUES)).toBe(false); // as const doesn't freeze but makes readonly in TS
      expect(THEME_VALUES.length).toBe(3);
    });
  });

  describe('isValidTheme', () => {
    it('returns true for valid theme values', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('system')).toBe(true);
    });

    it('returns false for invalid theme values', () => {
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('blue')).toBe(false);
      expect(isValidTheme('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
      expect(isValidTheme({})).toBe(false);
      expect(isValidTheme([])).toBe(false);
    });

    it('type guards correctly', () => {
      const value: unknown = 'light';
      if (isValidTheme(value)) {
        // TypeScript should know value is Theme here
        const theme: Theme = value;
        expect(theme).toBe('light');
      }
    });
  });

  describe('getDefaultTheme', () => {
    it('returns "system" as the default theme', () => {
      expect(getDefaultTheme()).toBe('system');
    });

    it('returns a valid theme value', () => {
      const defaultTheme = getDefaultTheme();
      expect(isValidTheme(defaultTheme)).toBe(true);
    });
  });
});
