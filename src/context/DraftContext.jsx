import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import i18n from '../i18n'
import {
  clearDraft as clearStored,
  createEmptyDraft,
  loadDraft,
  saveDraft,
  storageAvailable,
} from '../utils/draftStorage'
import { SUPPORTED_LOCALES } from '../config/locales'
import { DraftCtx } from './draftContextCore'

function debounce(fn, wait = 500) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const log = (...args) => {
  if (import.meta.env.DEV) console.log(...args)
}

export function DraftProvider({ children }) {
  const [enabled, setEnabled] = useState(storageAvailable())
  const [draft, setDraft] = useState(() => createEmptyDraft(i18n.resolvedLanguage || 'en'))
  const [showResume, setShowResume] = useState(false)
  const [expired, setExpired] = useState(false)
  const [sizeWarning, setSizeWarning] = useState(false)

  // on mount: load existing draft
  useEffect(() => {
    if (!enabled) return
    const { draft: loaded, expired } = loadDraft()
    if (loaded && !expired) {
      setShowResume(true)
      setExpired(false)
      log('autosave:restore:available')
    } else if (expired) {
      setExpired(true)
      log('autosave:expired')
    }
  }, [enabled])

  // keep locale in draft synced on language change (do not translate data)
  useEffect(() => {
    const handler = (lng) => {
      setDraft((d) => ({ ...d, locale: SUPPORTED_LOCALES.includes(lng) ? lng : d.locale }))
    }
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [])

  const doSave = useRef(
    debounce((next) => {
      const res = saveDraft(next)
      if (!res.ok) {
        if (res.reason === 'too-large') {
          setSizeWarning(true)
        }
        if (res.reason === 'no-storage') {
          setEnabled(false)
        }
        return
      }
      setSizeWarning(res.size > 480_000)
      log('autosave:save', { size: res.size })
    }, 500)
  )

  const computeScenesAndLimits = useCallback((totalDurationSec) => {
    const scenes = Math.floor(totalDurationSec / 5)
    const maxImages = scenes * 2
    return { scenes, maxImages }
  }, [])

  const updateAndSave = useCallback(
    (updater) => {
      setDraft((prev) => {
        let next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        // validations & derived
        if (next.totalDurationSec && Number.isFinite(Number(next.totalDurationSec))) {
          const secs = Number(next.totalDurationSec)
          if (secs > 0 && secs % 5 === 0) {
            const { scenes, maxImages } = computeScenesAndLimits(secs)
            next = { ...next, scenesCount: scenes, maxImages }
          }
        }
        if (next.form?.format && !['16:9', '9:16'].includes(next.form.format)) {
          next = { ...next, form: { ...next.form, format: '16:9' } }
        }
        if (enabled) doSave.current(next)
        return next
      })
    },
    [computeScenesAndLimits, enabled]
  )

  const actions = useMemo(
    () => ({
      setAnswer(qIndex, value) {
        updateAndSave((d) => ({ ...d, answers: { ...d.answers, [`q${qIndex}`]: value } }))
      },
      setFormField(field, value) {
        updateAndSave((d) => ({ ...d, form: { ...d.form, [field]: value } }))
      },
      setTotalDurationSec(secs) {
        const v = Number(secs)
        updateAndSave({ totalDurationSec: Number.isFinite(v) ? v : 0 })
      },
      setStepIndex(idx) {
        updateAndSave({ stepIndex: idx })
      },
      setStatus(status) {
        updateAndSave({ status })
      },
      saveNow() {
        doSave.current(draft)
      },
      clear() {
        clearStored()
        setDraft(createEmptyDraft(i18n.resolvedLanguage || 'en'))
        setShowResume(false)
        log('autosave:clear')
      },
      resumeFromStorage() {
        const { draft: loaded } = loadDraft()
        if (loaded) {
          setDraft(loaded)
          setShowResume(false)
          log('autosave:restore', { step: loaded.stepIndex })
        } else {
          setShowResume(false)
        }
      },
      discardStorage() {
        clearStored()
        setShowResume(false)
        log('autosave:clear')
      },
      exportJson() {
        try {
          const json = window.localStorage.getItem('leadDraft:v1') || JSON.stringify(draft, null, 2)
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'leadDraft_v1.json'
          a.click()
          URL.revokeObjectURL(url)
        } catch (err) {
          if (import.meta.env.DEV) console.warn('exportJson failed', err)
        }
      },
      storageEnabled: enabled,
    }),
    [draft, enabled, updateAndSave]
  )

  const value = useMemo(
    () => ({
      draft,
      actions,
      showResume,
      setShowResume,
      expired,
      sizeWarning,
      storageEnabled: enabled,
    }),
    [draft, actions, showResume, expired, sizeWarning, enabled]
  )

  return <DraftCtx.Provider value={value}>{children}</DraftCtx.Provider>
}
