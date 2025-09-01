import { useCurrency } from '../context/CurrencyContext'
import { SUPPORTED_CURRENCIES } from '../config/currency'

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
    <select
      aria-label="Currency selector"
      className="lang-select"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  )
}
