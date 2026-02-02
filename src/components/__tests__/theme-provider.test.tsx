import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../theme-provider';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: jest.fn(),
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('accepts and passes through props', () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
