import { useTranslation } from 'react-i18next'
import useLocalePath from '../hooks/useLocalePath'

export default function PrivacyAutosaveNotice() {
  const { t } = useTranslation()
  const localePath = useLocalePath()
  return (
    <div style={styles.box} role="note" aria-live="polite">
      <p style={{ margin: 0 }}>{t('autosave.disclaimer')}</p>
      <p style={{ margin: '0.25rem 0 0' }}>
        <a href={localePath('/privacy')}>{t('footer.privacy')}</a> ·{' '}
        <a href={localePath('/terms')}>{t('footer.terms')}</a>
      </p>
    </div>
  )
}

const styles = {
  box: {
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(100, 108, 255, 0.1)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-fg)',
  },
}
