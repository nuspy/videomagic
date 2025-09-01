import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '../../i18n'
import App from '../../App'

describe('Pricing currency and VAT', () => {
  it('shows correct totals in EUR and USD', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/en/pricing']}>
        <App />
      </MemoryRouter>
    )

    // EUR default: Basic 10.00 EUR subtotal, VAT 2.20, Total 12.20
    expect(screen.getByText(/Subtotal: 10.00 EUR/)).toBeInTheDocument()
    expect(screen.getByText(/VAT: 2.20 EUR/)).toBeInTheDocument()
    expect(screen.getByText(/Total: 12.20 EUR/)).toBeInTheDocument()

    // Switch to USD (VAT 0)
    const currencySelect = screen.getByLabelText(/currency selector/i)
    await user.selectOptions(currencySelect, 'USD')

    expect(screen.getByText(/Subtotal: 12.00 USD/)).toBeInTheDocument()
    expect(screen.getByText(/VAT: 0.00 USD/)).toBeInTheDocument()
    expect(screen.getByText(/Total: 12.00 USD/)).toBeInTheDocument()
  })
})
