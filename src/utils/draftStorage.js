const STORAGE_KEY = 'leadDraft:v1'
const DEFAULT_TTL_DAYS = 30

function canUseStorage() {
  try {
    const k = '__test__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

function nowIso() {
  return new Date().toISOString()
}

export function createEmptyDraft(locale = 'en') {
  const answers = {}
  for (let i = 0; i < 10; i++) answers[`q${i}`] = ''
  return {
    version: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ttlDays: DEFAULT_TTL_DAYS,
    locale,
    stepIndex: 0,
    answers,
    form: { format: '16:9', channels: [], tone: '' },
    totalDurationSec: 30,
    scenesCount: 6,
    maxImages: 12,
    status: 'draft',
  }
}

export function loadDraft() {
  if (!canUseStorage()) return { available: false, draft: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { available: true, draft: null }
    const draft = JSON.parse(raw)
    // TTL check
    const ttlDays = Number(draft.ttlDays || DEFAULT_TTL_DAYS)
    const updated = new Date(draft.updatedAt || draft.createdAt || Date.now())
    const ageMs = Date.now() - updated.getTime()
    const expired = ageMs > ttlDays * 24 * 60 * 60 * 1000
    return { available: true, draft: expired ? null : draft, expired }
  } catch {
    return { available: true, draft: null }
  }
}

export function saveDraft(draft) {
  if (!canUseStorage()) return { ok: false, reason: 'no-storage' }
  try {
    const copy = { ...draft, updatedAt: nowIso() }
    const json = JSON.stringify(copy)
    if (json.length > 500_000) {
      return { ok: false, reason: 'too-large', size: json.length }
    }
    window.localStorage.setItem(STORAGE_KEY, json)
    return { ok: true, size: json.length }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

export function clearDraft() {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    if (import.meta.env.DEV) console.warn('exportJson failed', err)
  }
}

export function storageAvailable() {
  return canUseStorage()
}

export { STORAGE_KEY }
