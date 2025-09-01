import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'
import App from '../App'

describe('Locale routing and persistence', () => {
  it('persists user language and updates URL-prefixed links', async () => {
    const user = userEvent.setup()
    localStorage.setItem('i18nextLng', 'it')
    render(
      <MemoryRouter initialEntries={['/it']}>
        <App />
      </MemoryRouter>
    )

    // Starts in Italian
    expect(screen.getByRole('heading', { name: /benvenuto/i })).toBeInTheDocument()

    // Switch to English
    const select = screen.getByLabelText(/language switcher/i)
    await user.selectOptions(select, 'en')
    expect(localStorage.getItem('i18nextLng')).toBe('en')
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()

    // Navbar links should now point to /en/*
    const pricing = screen.getByRole('link', { name: /pricing/i })
    expect(pricing.getAttribute('href')).toMatch(/^\/en\/pricing$/)
  })
})
