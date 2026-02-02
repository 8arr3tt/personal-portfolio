import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '../theme-toggle';

describe('ThemeToggle', () => {
  const renderWithThemeProvider = (component: React.ReactElement) => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {component}
      </ThemeProvider>
    );
  };

  it('renders the theme toggle button', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });

    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded');
  });

  it('displays sun and moon icons', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });

    // The button should contain SVG elements (icons)
    const svgs = button.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2); // Sun and Moon icons
  });

  it('has screen reader text', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const srText = screen.getByText('Toggle theme', { selector: '.sr-only' });
    expect(srText).toBeInTheDocument();
  });
});
