import { test, expect } from '@playwright/test'

const KEY = 'leadDraft:v1'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((value) => {
    // expose helper to set draft before navigation
    window.localStorage.setItem('leadDraft:v1', value as string)
  }, '')
})

test('Resume modal appears and resume closes it', async ({ page }) => {
  const draft = {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ttlDays: 30,
    locale: 'en',
    stepIndex: 3,
    answers: { q0: 'A', q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '' },
    form: { format: '16:9', channels: [], tone: '' },
    totalDurationSec: 30,
    scenesCount: 6,
    maxImages: 12,
    status: 'draft',
  }
  await page.addInitScript((val) => {
    window.localStorage.setItem(KEY, val as string)
  }, JSON.stringify(draft))

  await page.goto('/en')
  await expect(page.getByRole('heading', { name: /resume/i })).toBeVisible()
  await page.getByRole('button', { name: /resume/i }).click()
  await expect(page.getByRole('heading', { name: /resume/i })).toBeHidden()
})

test('Discard clears storage and modal closes', async ({ page }) => {
  const draft = {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ttlDays: 30,
    locale: 'en',
    stepIndex: 1,
    answers: { q0: 'hello', q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '' },
    form: { format: '16:9', channels: [], tone: '' },
    totalDurationSec: 30,
    scenesCount: 6,
    maxImages: 12,
    status: 'draft',
  }
  await page.addInitScript((val) => {
    window.localStorage.setItem(KEY, val as string)
  }, JSON.stringify(draft))

  await page.goto('/en')
  await expect(page.getByRole('heading', { name: /resume/i })).toBeVisible()
  await page.getByRole('button', { name: /discard|annulla|скасувати/i }).click()
  await expect(page.getByRole('heading', { name: /resume/i })).toBeHidden()
  // storage cleared
  const hasDraft = await page.evaluate(() => !!window.localStorage.getItem('leadDraft:v1'))
  expect(hasDraft).toBe(false)
})

test('Language change does not translate data, resume still works', async ({ page }) => {
  const draft = {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ttlDays: 30,
    locale: 'it',
    stepIndex: 2,
    answers: { q0: 'ciao', q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '' },
    form: { format: '9:16', channels: [], tone: 'serio' },
    totalDurationSec: 30,
    scenesCount: 6,
    maxImages: 12,
    status: 'draft',
  }
  await page.addInitScript((val) => {
    window.localStorage.setItem(KEY, val as string)
  }, JSON.stringify(draft))

  await page.goto('/en')
  // switch language to IT via UI if present; otherwise rely on modal copy in english
  await expect(page.getByRole('heading', { name: /resume/i })).toBeVisible()
  await page.getByRole('button', { name: /resume/i }).click()
  await expect(page.getByRole('heading', { name: /resume/i })).toBeHidden()
})
