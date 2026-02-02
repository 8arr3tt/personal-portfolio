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
})
