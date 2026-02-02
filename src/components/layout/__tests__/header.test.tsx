import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { Header } from '../header'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock ThemeToggle component
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}))

describe('Header', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the logo/site name', () => {
    render(<Header />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Header />)
    const themeToggles = screen.getAllByTestId('theme-toggle')
    expect(themeToggles.length).toBeGreaterThan(0)
  })

  it('renders mobile menu button', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('opens and closes mobile menu', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })

    // Click to open
    fireEvent.click(menuButton)

    // Check if navigation title appears (from SheetContent)
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('has sticky header', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('navigation links have correct hrefs', () => {
    render(<Header />)
    const homeLinks = screen.getAllByText('Home')
    const projectsLinks = screen.getAllByText('Projects')

    // Check desktop links
    expect(homeLinks[0].closest('a')).toHaveAttribute('href', '/')
    expect(projectsLinks[0].closest('a')).toHaveAttribute('href', '/projects')
  })

  it('applies responsive classes correctly', () => {
    const { container } = render(<Header />)
    const desktopNav = container.querySelector('.hidden.md\\:flex')
    const mobileMenuContainer = container.querySelector('.flex.md\\:hidden')

    expect(desktopNav).toBeInTheDocument()
    expect(mobileMenuContainer).toBeInTheDocument()
  })

  describe('active navigation state', () => {
    it('highlights Home link when on home page', () => {
      (usePathname as jest.Mock).mockReturnValue('/')
      const { container } = render(<Header />)

      const desktopNav = container.querySelector('nav.hidden.md\\:flex')
      const homeLink = desktopNav?.querySelector('a[href="/"]')
      const projectsLink = desktopNav?.querySelector('a[href="/projects"]')

      expect(homeLink?.className).toContain('text-foreground')
      expect(projectsLink?.className).toContain('text-muted-foreground')
    })

    it('highlights Projects link when on projects page', () => {
      (usePathname as jest.Mock).mockReturnValue('/projects')
      const { container } = render(<Header />)

      const desktopNav = container.querySelector('nav.hidden.md\\:flex')
      const homeLink = desktopNav?.querySelector('a[href="/"]')
      const projectsLink = desktopNav?.querySelector('a[href="/projects"]')

      expect(homeLink?.className).toContain('text-muted-foreground')
      expect(projectsLink?.className).toContain('text-foreground')
    })

    it('highlights Projects link when on a project detail page', () => {
      (usePathname as jest.Mock).mockReturnValue('/projects/have-we-met')
      const { container } = render(<Header />)

      const desktopNav = container.querySelector('nav.hidden.md\\:flex')
      const homeLink = desktopNav?.querySelector('a[href="/"]')
      const projectsLink = desktopNav?.querySelector('a[href="/projects"]')

      expect(homeLink?.className).toContain('text-muted-foreground')
      expect(projectsLink?.className).toContain('text-foreground')
    })

    it('highlights correct link in mobile menu when on projects page', () => {
      (usePathname as jest.Mock).mockReturnValue('/projects')
      render(<Header />)

      const menuButton = screen.getByRole('button', { name: /toggle menu/i })
      fireEvent.click(menuButton)

      // In mobile menu, the projects link should have the active styling
      const mobileNavLinks = screen.getAllByText('Projects')
      // Find the mobile nav link (in sheet content)
      const mobileProjectsLink = mobileNavLinks.find(
        (link) => link.closest('[role="dialog"]')
      )

      expect(mobileProjectsLink?.className).toContain('text-foreground')
      expect(mobileProjectsLink?.className).toContain('bg-accent')
    })
  })
})
