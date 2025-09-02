import { prisma } from '../db.js'

const MAX_PREVIEWS = 3
const DAYS_WINDOW = 30

function getLang(req) {
  const q = (req.query.lang || '').toString().toLowerCase()
  if (q) return q
  const header = (req.headers['accept-language'] || '').toString().toLowerCase()
  if (header.startsWith('it')) return 'it'
  if (header.startsWith('uk') || header.startsWith('ua')) return 'ua'
  return 'en'
}

function exceededMessage(lang, resetAt) {
  const d = resetAt ? new Date(resetAt) : null
  const dateStr = d ? d.toISOString() : ''
  const messages = {
    en: `You’ve reached your monthly preview quota. Please try again after ${dateStr}.`,
    it: `Hai raggiunto la quota mensile di anteprime. Riprova dopo il ${dateStr}.`,
    ua: `Ви вичерпали місячну квоту попередніх переглядів. Спробуйте знову після ${dateStr}.`,
  }
  return messages[lang] || messages.en
}

export async function ensureQuotaFresh(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { previewQuotaUsed: true, previewQuotaResetAt: true },
  })
  if (!user) return null
  const now = new Date()
  if (!user.previewQuotaResetAt || now > user.previewQuotaResetAt) {
    const nextReset = new Date(now.getTime() + DAYS_WINDOW * 24 * 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: userId },
      data: { previewQuotaUsed: 0, previewQuotaResetAt: nextReset },
    })
    return { previewQuotaUsed: 0, previewQuotaResetAt: nextReset }
  }
  return user
}

export async function getQuota(userId) {
  const user = await ensureQuotaFresh(userId)
  if (!user) return { remaining: 0, resetAt: null }
  const remaining = Math.max(0, MAX_PREVIEWS - (user.previewQuotaUsed || 0))
  return { remaining, resetAt: user.previewQuotaResetAt }
}

export async function tryConsumePreview(req, res) {
  const lang = getLang(req)
  const userId = req.user.id
  const fresh = await ensureQuotaFresh(userId)
  if (!fresh) return res.status(401).json({ error: 'Unauthorized' })

  const used = fresh.previewQuotaUsed || 0
  if (used >= MAX_PREVIEWS) {
    return res.status(429).json({
      error: exceededMessage(lang, fresh.previewQuotaResetAt),
      remaining: 0,
      resetAt: fresh.previewQuotaResetAt,
    })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { previewQuotaUsed: { increment: 1 } },
    select: { previewQuotaUsed: true, previewQuotaResetAt: true },
  })

  const remaining = Math.max(0, MAX_PREVIEWS - (updated.previewQuotaUsed || 0))
  return res.json({ remaining, resetAt: updated.previewQuotaResetAt })
}
