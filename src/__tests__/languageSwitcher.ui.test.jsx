import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'
import App from '../App'

describe('Language Switcher UI', () => {
  it('switches language and persists choice', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /welcome|benvenuto|ласкаво/i })).toBeInTheDocument()
    const select = screen.getByLabelText(/language switcher/i)
    await user.selectOptions(select, 'it')

    expect(screen.getByRole('heading', { name: /benvenuto/i })).toBeInTheDocument()
    expect(localStorage.getItem('i18nextLng')).toBe('it')
  })
})
