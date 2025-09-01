import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useLocalePath from '../hooks/useLocalePath'

export default function Footer() {
  const { t } = useTranslation()
  const localePath = useLocalePath()
  return (
    <footer className="footer">
      <div className="container" role="contentinfo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/brand/logo.svg" alt="Brand logo" className="brand-logo brand-logo--footer" />
          <span>&copy; {new Date().getFullYear()} Starter App</span>
        </div>
        <p>
          <Link to={localePath('/privacy')}>{t('footer.privacy')}</Link> ·{' '}
          <Link to={localePath('/terms')}>{t('footer.terms')}</Link>
        </p>
      </div>
    </footer>
  )
}
