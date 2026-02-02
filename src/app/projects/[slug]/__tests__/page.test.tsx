import { render, screen } from '@testing-library/react';
import ProjectPage from '../page';

describe('ProjectPage', () => {
  const mockParams = {
    slug: 'test-project',
  };

  it('renders the project page with slug parameter', () => {
    render(<ProjectPage params={mockParams} />);
    expect(screen.getByText(/Project: test-project/i)).toBeInTheDocument();
  });

  it('displays the slug parameter in code element', () => {
    render(<ProjectPage params={mockParams} />);
    const codeElement = screen.getByText('test-project');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe('CODE');
  });

  it('renders the coming soon message', () => {
    render(<ProjectPage params={mockParams} />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders the back to projects link', () => {
    render(<ProjectPage params={mockParams} />);
    const backLink = screen.getByText('← Back to Projects');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/projects');
  });

  it('displays placeholder note about dynamic routing', () => {
    render(<ProjectPage params={mockParams} />);
    expect(screen.getByText(/demonstrating Next.js dynamic routing/i)).toBeInTheDocument();
  });

  it('handles different slug parameters', () => {
    const { rerender } = render(<ProjectPage params={{ slug: 'first-project' }} />);
    expect(screen.getByText(/Project: first-project/i)).toBeInTheDocument();

    rerender(<ProjectPage params={{ slug: 'second-project' }} />);
    expect(screen.getByText(/Project: second-project/i)).toBeInTheDocument();
  });
});
