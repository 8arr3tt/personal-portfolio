import { render, screen } from '@testing-library/react';
import ProjectsPage from '../page';

describe('ProjectsPage', () => {
  it('renders the projects page heading', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders the coming soon message', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders the back to home link', () => {
    render(<ProjectsPage />);
    const backLink = screen.getByText('← Back to Home');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('displays a placeholder icon', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('🚧')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Explore my work and side projects.')).toBeInTheDocument();
  });
});
