import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import useLocalePath from '../hooks/useLocalePath'
import CurrencySelector from './CurrencySelector'

export default function Navbar() {
  const { t } = useTranslation()
  const localePath = useLocalePath()

  return (
    <header className="header">
      <div className="container">
        <nav className="nav" aria-label="Global">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to={localePath('/')} aria-label="Home">
              <img src="/brand/logo.svg" alt="Brand logo" className="brand-logo" />
            </Link>
            <NavLink to={localePath('/')} end className={({ isActive }) => isActive ? 'active' : undefined}>
              {t('navbar.home')}
            </NavLink>
            <NavLink to={localePath('/pricing')} className={({ isActive }) => isActive ? 'active' : undefined}>
              {t('navbar.pricing')}
            </NavLink>
            <NavLink to={localePath('/dashboard')} className={({ isActive }) => isActive ? 'active' : undefined}>
              {t('navbar.dashboard')}
            </NavLink>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CurrencySelector />
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  )
}
