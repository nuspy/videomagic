import { useTranslation } from 'react-i18next'
import { useDraft } from '../context/useDraft'

export default function NoStorageBanner() {
  const { t } = useTranslation()
  const { storageEnabled } = useDraft()
  if (storageEnabled) return null
  return (
    <div
      role="status"
      style={{ background: '#f7d7da', color: '#5a1a1f', padding: '8px', textAlign: 'center' }}
    >
      {t('autosave.disabled')}
    </div>
  )
}
