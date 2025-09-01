import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'
import App from '../App'

describe('Protected Route', () => {
  it('redirects to home when not authenticated', () => {
    localStorage.removeItem('authed')
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
  })

  it('shows dashboard when authenticated', () => {
    localStorage.setItem('authed', 'true')
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })
})
