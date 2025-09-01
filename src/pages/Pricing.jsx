import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import { useCurrency } from '../context/CurrencyContext'
import { VAT_RATES } from '../config/currency'

const PLANS = [
  {
    id: 'basic',
    nameKey: 'Basic',
    price: { EUR: 1000, USD: 1200 }, // minor units
  },
  {
    id: 'pro',
    nameKey: 'Pro',
    price: { EUR: 1900, USD: 2200 },
  },
]

function formatMoney(amountMinor, currency) {
  const amount = amountMinor / 100
  return `${amount.toFixed(2)} ${currency}`
}

export default function Pricing() {
  const { t } = useTranslation()
  const { currency } = useCurrency()
  const vatRate = VAT_RATES[currency] ?? 0

  return (
    <>
      <Seo title={t('pricing.seoTitle')} description={t('pricing.seoDescription')} />
      <h1>{t('pricing.title')}</h1>
      <p>{t('pricing.description')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginTop: '1rem' }}>
        {PLANS.map((plan) => {
          const subtotal = plan.price[currency]
          const vat = Math.round(subtotal * vatRate)
          const total = subtotal + vat
          return (
            <div key={plan.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--color-surface)' }}>
              <h2 style={{ margin: '0 0 8px' }}>{plan.nameKey}</h2>
              <p style={{ margin: '0 0 12px' }}><strong>{formatMoney(subtotal, currency)}</strong> / mo</p>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                <div>Subtotal: {formatMoney(subtotal, currency)}</div>
                <div>VAT: {formatMoney(vat, currency)}</div>
                <div><strong>Total: {formatMoney(total, currency)}</strong></div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
