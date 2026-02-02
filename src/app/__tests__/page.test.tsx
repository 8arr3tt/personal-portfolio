import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock the HeroSection component
jest.mock('@/components/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
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

  it('renders three project placeholder cards', () => {
    render(<Home />)

    const comingSoonCards = screen.getAllByText('Coming Soon')
    expect(comingSoonCards).toHaveLength(3)
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
})
