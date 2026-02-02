import { render, screen } from '@testing-library/react'
import { HeroSection } from '../hero-section'

describe('HeroSection', () => {
  it('renders the hero section with name and title', () => {
    render(<HeroSection />)

    expect(screen.getByText('Your Name')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('renders the introduction paragraph', () => {
    render(<HeroSection />)

    expect(screen.getByText(/Building modern web applications/i)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<HeroSection />)

    expect(screen.getByRole('link', { name: /view projects/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
  })

  it('has correct link for View Projects button', () => {
    render(<HeroSection />)

    const projectsLink = screen.getByRole('link', { name: /view projects/i })
    expect(projectsLink).toHaveAttribute('href', '/projects')
  })

  it('has correct external link attributes for GitHub button', () => {
    render(<HeroSection />)

    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders profile placeholder with correct styling', () => {
    const { container } = render(<HeroSection />)

    // Check for the profile circle element
    const profileCircle = container.querySelector('.rounded-full')
    expect(profileCircle).toBeInTheDocument()
  })

  it('applies responsive classes correctly', () => {
    const { container } = render(<HeroSection />)

    const section = container.querySelector('section')
    expect(section).toHaveClass('w-full', 'max-w-5xl', 'mx-auto')
  })
})
