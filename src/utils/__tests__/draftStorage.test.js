import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  STORAGE_KEY,
  createEmptyDraft,
  loadDraft,
  saveDraft,
  clearDraft,
  storageAvailable,
} from '../draftStorage'

function mockStorage() {
  const store = new Map()
  const ls = {
    getItem: vi.fn((k) => store.get(k) ?? null),
    setItem: vi.fn((k, v) => {
      store.set(k, v)
    }),
    removeItem: vi.fn((k) => {
      store.delete(k)
    }),
  }
  Object.defineProperty(window, 'localStorage', { value: ls, configurable: true })
  return { store, ls }
}

describe('draftStorage', () => {
  beforeEach(() => {
    mockStorage()
  })

  it('creates, saves and loads a draft', () => {
    expect(storageAvailable()).toBe(true)
    const draft = createEmptyDraft('en')
    const res = saveDraft(draft)
    expect(res.ok).toBe(true)
    const { draft: loaded } = loadDraft()
    expect(loaded).toBeTruthy()
    expect(loaded.locale).toBe('en')
    expect(loaded.answers.q0).toBe('')
  })

  it('expires draft based on ttlDays', () => {
    const draft = createEmptyDraft('it')
    // simulate old updatedAt beyond TTL
    draft.ttlDays = 1
    draft.updatedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    saveDraft(draft)
    const { draft: loaded, expired } = loadDraft()
    expect(expired).toBe(true)
    expect(loaded).toBeNull()
  })

  it('clears draft', () => {
    const draft = createEmptyDraft('ua')
    saveDraft(draft)
    clearDraft()
    const { draft: loaded } = loadDraft()
    expect(loaded).toBeNull()
  })

  it('guards large size', () => {
    const draft = createEmptyDraft('en')
    draft.answers.q0 = 'x'.repeat(600_000)
    const res = saveDraft(draft)
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('too-large')
  })
})
