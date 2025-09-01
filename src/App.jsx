import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import LocaleRouter, { RedirectToPreferredLocale } from './routing/LocaleRouter'
import { CurrencyProvider } from './context/CurrencyContext'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route path="/" element={<RedirectToPreferredLocale />} />
        <Route path=":locale" element={<LocaleRouter />}>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="pricing" element={<Pricing />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CurrencyProvider>
  )
}

export default App
