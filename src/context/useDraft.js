import { useContext } from 'react'
import { DraftCtx } from './draftContextCore'

export function useDraft() {
  const ctx = useContext(DraftCtx)
  if (!ctx) throw new Error('useDraft must be used within DraftProvider')
  return ctx
}
