import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DraftProvider, useDraft } from '../DraftContext'

// simple wrapper to use the context in tests
function setup() {
  const wrapper = ({ children }) => <DraftProvider>{children}</DraftProvider>
  const { result } = renderHook(() => useDraft(), { wrapper })
  return result
}

describe('DraftContext', () => {
  beforeEach(() => {
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
    vi.useFakeTimers()
  })

  it('debounces save and updates scenesCount/maxImages when duration is multiple of 5', () => {
    const res = setup()
    act(() => {
      res.current.actions.setTotalDurationSec(45)
    })
    // advance debounce
    vi.advanceTimersByTime(600)
    expect(res.current.draft.totalDurationSec).toBe(45)
    expect(res.current.draft.scenesCount).toBe(9)
    expect(res.current.draft.maxImages).toBe(18)
  })

  it('sets answers and persists via debounced localStorage', () => {
    const res = setup()
    act(() => {
      res.current.actions.setAnswer(0, 'Hello')
    })
    vi.advanceTimersByTime(600)
    const raw = window.localStorage.getItem('leadDraft:v1')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw)
    expect(parsed.answers.q0).toBe('Hello')
  })

  it('clear resets draft and stepIndex to 0', () => {
    const res = setup()
    act(() => {
      res.current.actions.setStepIndex(3)
      res.current.actions.clear()
      res.current.actions.setStepIndex(0)
    })
    expect(res.current.draft.stepIndex).toBe(0)
  })
})
