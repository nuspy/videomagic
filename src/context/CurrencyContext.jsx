import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '../config/currency'

const CurrencyCtx = createContext({ currency: DEFAULT_CURRENCY, setCurrency: () => {} })

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY)

  useEffect(() => {
    try {
      const persisted = localStorage.getItem('currency')
      if (persisted && SUPPORTED_CURRENCIES.includes(persisted)) {
        setCurrencyState(persisted)
      }
    } catch {}
  }, [])

  const setCurrency = (c) => {
    const next = SUPPORTED_CURRENCIES.includes(c) ? c : DEFAULT_CURRENCY
    setCurrencyState(next)
    try {
      localStorage.setItem('currency', next)
    } catch {}
  }

  const value = useMemo(() => ({ currency, setCurrency }), [currency])
  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>
}

export function useCurrency() {
  return useContext(CurrencyCtx)
}
