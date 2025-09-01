import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../..//src/App'
import '../../../src/i18n'

describe('LanguageSwitcher', () => {
  it('changes language and persists selection', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // initial content in English
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()

    const select = screen.getByLabelText(/language switcher/i)
    await user.selectOptions(select, 'it')

    // content updates to Italian
    expect(screen.getByRole('heading', { name: /benvenuto/i })).toBeInTheDocument()

    // persistence
    expect(localStorage.getItem('i18nextLng')).toBe('it')
    expect(document.documentElement.getAttribute('lang')).toBe('it')
  })
})
