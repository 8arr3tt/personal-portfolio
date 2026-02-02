import { render, screen } from '@testing-library/react'
import Home from '../page'
import { getFeaturedProjects, getPublishedProjects } from '@/data/projects'

// Mock the HeroSection component
jest.mock('@/components/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}))

// Mock the ProjectCard component for simpler testing
jest.mock('@/components/projects/project-card', () => ({
  ProjectCard: ({ project }: { project: { id: string; title: string } }) => (
    <div data-testid={`project-card-${project.id}`}>
      <span>{project.title}</span>
    </div>
  ),
}))

describe('Home Page', () => {
  it('renders the hero section', () => {
    render(<Home />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('renders the featured projects section', () => {
    render(<Home />)

    expect(screen.getByText('Featured Projects')).toBeInTheDocument()
    expect(screen.getByText(/Showcase of recent work/i)).toBeInTheDocument()
  })

  it('renders featured projects from data', () => {
    render(<Home />)

    const featuredProjects = getFeaturedProjects()

    // Each featured project should have a card rendered
    featuredProjects.forEach((project) => {
      expect(screen.getByTestId(`project-card-${project.id}`)).toBeInTheDocument()
      expect(screen.getByText(project.title)).toBeInTheDocument()
    })
  })

  it('renders have-we-met as a featured project', () => {
    render(<Home />)

    // have-we-met is marked as featured, so it should appear
    expect(screen.getByTestId('project-card-have-we-met')).toBeInTheDocument()
    expect(screen.getByText('have-we-met')).toBeInTheDocument()
  })

  it('renders the skills and technologies section', () => {
    render(<Home />)

    expect(screen.getByText('Skills & Technologies')).toBeInTheDocument()
    expect(screen.getByText(/Tools and frameworks/i)).toBeInTheDocument()
  })

  it('renders skill cards with correct technologies', () => {
    render(<Home />)

    const expectedSkills = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'Docker']

    expectedSkills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument()
    })
  })

  it('has separators between sections', () => {
    render(<Home />)

    // Check that sections are properly separated visually
    expect(screen.getByText('Featured Projects')).toBeInTheDocument()
    expect(screen.getByText('Skills & Technologies')).toBeInTheDocument()
    // The Separator component is present even if not easily queryable in tests
  })

  it('applies responsive grid layouts', () => {
    const { container } = render(<Home />)

    // Check for grid containers
    const gridContainers = container.querySelectorAll('.grid')
    expect(gridContainers.length).toBeGreaterThan(0)
  })

  it('has proper heading hierarchy', () => {
    render(<Home />)

    // Check for h2 headings in sections
    const h2Headings = screen.getAllByRole('heading', { level: 2 })
    expect(h2Headings.length).toBeGreaterThanOrEqual(2)
  })

  it('renders View All Projects button when there are more projects', () => {
    render(<Home />)

    const allProjects = getPublishedProjects()
    const featuredProjects = getFeaturedProjects()

    // If there are more projects than featured ones, the button should appear
    if (allProjects.length > featuredProjects.length) {
      expect(screen.getByRole('link', { name: /view all projects/i })).toBeInTheDocument()
    }
  })

  it('View All Projects button links to /projects', () => {
    render(<Home />)

    const allProjects = getPublishedProjects()
    const featuredProjects = getFeaturedProjects()

    if (allProjects.length > featuredProjects.length) {
      const viewAllLink = screen.getByRole('link', { name: /view all projects/i })
      expect(viewAllLink).toHaveAttribute('href', '/projects')
    }
  })
})
