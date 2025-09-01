import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../src/App'
import '../../../src/i18n'

describe('Routing', () => {
  it('navigates to Pricing', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /pricing/i })).toBeInTheDocument()
  })

  it('shows NotFound for unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })

  it('protects the dashboard route', () => {
    // ensure authed flag is not set
    localStorage.removeItem('authed')
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )
    // redirected to home
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
  })
})
