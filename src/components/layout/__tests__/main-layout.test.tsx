import { render, screen } from '@testing-library/react'
import { MainLayout } from '../main-layout'

// Mock the Header and Footer components
jest.mock('../header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('../footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('MainLayout', () => {
  it('renders header component', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders footer component', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies flex layout structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    const wrapper = container.querySelector('.flex.min-h-screen.flex-col')
    expect(wrapper).toBeInTheDocument()
  })

  it('main content area exists with proper spacing', () => {
    const { container } = render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    const mainElement = container.querySelector('main')
    expect(mainElement).toBeTruthy()
  })

  it('content container has proper structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    const contentContainer = container.querySelector('.container')
    expect(contentContainer).toBeTruthy()
  })

  it('renders in correct order: header, main, footer', () => {
    const { container } = render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    )
    const wrapper = container.firstChild
    const children = Array.from(wrapper?.childNodes || [])

    expect(children[0]).toMatchSnapshot()
    expect(children[1]?.nodeName).toBe('MAIN')
    expect(children[2]).toMatchSnapshot()
  })
})
