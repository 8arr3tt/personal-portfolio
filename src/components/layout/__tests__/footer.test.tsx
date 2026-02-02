import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  it('renders copyright notice with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} Portfolio. All rights reserved.`)).toBeInTheDocument()
  })

  it('renders GitHub social link', () => {
    render(<Footer />)
    const githubLink = screen.getByLabelText('GitHub')
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute('href', 'https://github.com')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders LinkedIn social link', () => {
    render(<Footer />)
    const linkedinLink = screen.getByLabelText('LinkedIn')
    expect(linkedinLink).toBeInTheDocument()
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has proper styling', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toBeTruthy()
  })

  it('applies responsive layout', () => {
    const { container } = render(<Footer />)
    const contentContainer = container.querySelector('.flex')
    expect(contentContainer).toBeTruthy()
  })
})
