import { useTranslation } from 'react-i18next'
import { useDraft } from '../context/useDraft'

export default function DraftControls() {
  const { t } = useTranslation()
  const { draft, actions, sizeWarning } = useDraft()

  const canClear = draft.status === 'uploading' || draft.status === 'accepted'

  const onClear = () => {
    if (confirm(t('autosave.clearConfirm'))) {
      actions.clear()
      actions.setStepIndex(0)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {sizeWarning && (
        <button
          onClick={() => {
            actions.exportJson()
            actions.clear()
          }}
        >
          {t('autosave.exportAndReset')}
        </button>
      )}
      {canClear && <button onClick={onClear}>{t('autosave.clear')}</button>}
    </div>
  )
}
