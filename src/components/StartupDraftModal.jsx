import { useTranslation } from 'react-i18next'
import { useDraft } from '../context/useDraft'

export default function StartupDraftModal() {
  const { t } = useTranslation()
  const { showResume, setShowResume, actions } = useDraft()

  if (!showResume) return null

  return (
    <div role="dialog" aria-modal="true" style={styles.backdrop}>
      <div style={styles.modal}>
        <h2 style={{ marginTop: 0 }}>{t('autosave.resumeTitle')}</h2>
        <p style={{ color: 'var(--color-muted)' }}>{t('autosave.disclaimer')}</p>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}
        >
          <button onClick={() => actions.exportJson()}>{t('autosave.export')}</button>
          <button onClick={() => actions.discardStorage()}>{t('autosave.cancel')}</button>
          <button onClick={() => actions.resumeFromStorage()}>{t('autosave.resume')}</button>
        </div>
        <button aria-label="Close" onClick={() => setShowResume(false)} style={styles.close}>
          ×
        </button>
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--color-surface)',
    color: 'var(--color-fg)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    width: 'min(560px, 92vw)',
    position: 'relative',
  },
  close: {
    position: 'absolute',
    right: '0.5rem',
    top: '0.25rem',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
}
