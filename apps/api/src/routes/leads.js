import express from 'express'
import { prisma } from '../db.js'
import { cookieBaseOptions } from '../config/env.js'

const router = express.Router()

// Localization helpers
function getLang(req) {
  const q = (req.query.lang || '').toString().toLowerCase()
  if (q) return q
  const h = (req.headers['accept-language'] || '').toString().toLowerCase()
  if (h.startsWith('it')) return 'it'
  if (h.startsWith('uk') || h.startsWith('ua')) return 'ua'
  return 'en'
}

const M = {
  required: {
    en: 'Sorry, this answer is required',
    it: 'Mi spiace, questa risposta è obbligatoria',
    ua: "Вибачте, ця відповідь є обов'язковою",
  },
  needToContinue: {
    en: 'Sorry, I need this answer to continue',
    it: 'Mi spiace, ho bisogno di questa risposta per continuare',
    ua: 'Вибачте, мені потрібна ця відповідь, щоб продовжити',
  },
  invalidFormat: {
    en: 'Invalid format. Allowed: 16:9 or 9:16',
    it: 'Formato non valido. Ammessi: 16:9 o 9:16',
    ua: 'Неприпустимий формат. Дозволено: 16:9 або 9:16',
  },
  invalidDuration: {
    en: 'Total duration must be a positive integer (in seconds) and a multiple of 5',
    it: 'La durata totale deve essere un intero positivo (in secondi) e multiplo di 5',
    ua: 'Загальна тривалість має бути додатним цілим числом (у секундах) та кратною 5',
  },
  notDraft: {
    en: 'This lead can no longer be updated',
    it: 'Questo lead non può più essere aggiornato',
    ua: 'Цей лід більше не можна оновити',
  },
  notFound: {
    en: 'Lead not found',
    it: 'Lead non trovato',
    ua: 'Лід не знайдено',
  },
}

const ALLOWED_FORMATS = new Set(['16:9', '9:16'])
const PREVIEW_MAP = {
  '16:9': { width: 832, height: 480 },
  '9:16': { width: 480, height: 832 },
}
const MAX_VIDEO_MB = 50

function msg(key, lang) {
  return (M[key] && M[key][lang]) || (M[key] && M[key].en) || 'Invalid'
}

function isEmpty(val) {
  if (val == null) return true
  if (typeof val === 'string') return val.trim().length === 0
  if (Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val).length === 0
  return false
}

function validatePayload(body, lang) {
  const errors = []

  // Required top-level: language, contactEmail, totalDurationSec, answers[0..9], form(format,channels,tone)
  const { language, contactEmail, totalDurationSec, answers, form } = body

  totalDurationSec

  if (isEmpty(language)) errors.push({ field: 'language', message: msg('required', lang) })
  if (isEmpty(contactEmail)) errors.push({ field: 'contactEmail', message: msg('required', lang) })

  if (!Array.isArray(answers) || answers.length !== 10) {
    errors.push({ field: 'answers', message: msg('needToContinue', lang) })
  } else {
    answers.forEach((a, i) => {
      if (isEmpty(a)) {
        errors.push({ field: `answers[${i}]`, message: msg('required', lang) })
      }
    })
  }

  if (!form || typeof form !== 'object') {
    errors.push({ field: 'form', message: msg('needToContinue', lang) })
  } else {
    const { format, channels, tone } = form
    if (!ALLOWED_FORMATS.has(format)) {
      errors.push({ field: 'form.format', message: msg('invalidFormat', lang) })
    }
    if (!Array.isArray(channels) || channels.length === 0) {
      errors.push({ field: 'form.channels', message: msg('required', lang) })
    }
    if (isEmpty(tone)) {
      errors.push({ field: 'form.tone', message: msg('required', lang) })
    }
  }

  const secs = Number.isInteger(body.totalDurationSec)
    ? body.totalDurationSec
    : Number(body.totalDurationSec)
  if (!Number.isFinite(secs) || secs <= 0 || secs % 5 !== 0) {
    errors.push({ field: 'totalDurationSec', message: msg('invalidDuration', lang) })
  }

  return { errors }
}

function computeScenes(totalDurationSec) {
  return Math.floor(totalDurationSec / 5)
}

function mapAnswersArrayToFields(answers) {
  const out = {}
  for (let i = 0; i < 10; i++) {
    out[`answers${i}`] = answers[i] ?? null
  }
  return out
}

// POST /leads
router.post('/leads', async (req, res, next) => {
  try {
    const lang = getLang(req)
    const { errors } = validatePayload(req.body || {}, lang)
    if (errors.length) {
      return res.status(400).json({ errors })
    }

    const {
      language,
      contactEmail,
      totalDurationSec,
      answers,
      form,
      aiProvider = 'OPENAI',
      aiModel = 'gpt-4o',
      temperature = 0.7,
      negativePrompt = null,
    } = req.body

    const scenesCount = computeScenes(Number(totalDurationSec))
    const maxImages = scenesCount * 2
    const preview = PREVIEW_MAP[form.format]

    const lead = await prisma.lead.create({
      data: {
        language,
        contactEmail,
        totalDurationSec: Number(totalDurationSec),
        scenesCount,
        aiProvider,
        aiModel,
        temperature: Number(temperature),
        negativePrompt,
        status: 'DRAFT',
        ...mapAnswersArrayToFields(answers),
        form,
      },
      select: { id: true },
    })

    // Append lead id to anon_leads cookie for later association at login
    try {
      const raw = req.cookies['anon_leads']
      const arr = raw ? JSON.parse(raw) : []
      const ids = Array.isArray(arr) ? arr : []
      ids.push(lead.id)
      // cap to last 20
      const capped = ids.slice(-20)
      res.cookie('anon_leads', JSON.stringify(capped), {
        ...cookieBaseOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
    } catch {
      // ignore cookie issues
    }

    return res.status(201).json({
      leadId: lead.id,
      rules: {
        maxImages,
        maxVideoMB: MAX_VIDEO_MB,
        preview: { format: form.format, ...preview },
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /leads/:id
router.get('/leads/:id', async (req, res, next) => {
  try {
    const lang = getLang(req)
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) return res.status(404).json({ error: msg('notFound', lang) })
    res.json({ lead })
  } catch (err) {
    next(err)
  }
})

// PUT /leads/:id (pre-submit updates only if status === DRAFT)
router.put('/leads/:id', async (req, res, next) => {
  try {
    const lang = getLang(req)
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: msg('notFound', lang) })
    if (existing.status !== 'DRAFT') {
      return res.status(409).json({ error: msg('notDraft', lang) })
    }

    const body = req.body || {}
    // Validate only provided fields but keep strong constraints if fields present
    const partialErrors = []

    if ('answers' in body) {
      if (!Array.isArray(body.answers) || body.answers.length !== 10) {
        partialErrors.push({ field: 'answers', message: msg('needToContinue', lang) })
      } else {
        body.answers.forEach((a, i) => {
          if (isEmpty(a))
            partialErrors.push({ field: `answers[${i}]`, message: msg('required', lang) })
        })
      }
    }

    if ('form' in body) {
      const f = body.form
      if (!f || typeof f !== 'object') {
        partialErrors.push({ field: 'form', message: msg('needToContinue', lang) })
      } else {
        if ('format' in f && !ALLOWED_FORMATS.has(f.format)) {
          partialErrors.push({ field: 'form.format', message: msg('invalidFormat', lang) })
        }
        if ('channels' in f && (!Array.isArray(f.channels) || f.channels.length === 0)) {
          partialErrors.push({ field: 'form.channels', message: msg('required', lang) })
        }
        if ('tone' in f && isEmpty(f.tone)) {
          partialErrors.push({ field: 'form.tone', message: msg('required', lang) })
        }
      }
    }

    let scenesCount = existing.scenesCount
    if ('totalDurationSec' in body) {
      const secs = Number.isInteger(body.totalDurationSec)
        ? body.totalDurationSec
        : Number(body.totalDurationSec)
      if (!Number.isFinite(secs) || secs <= 0 || secs % 5 !== 0) {
        partialErrors.push({ field: 'totalDurationSec', message: msg('invalidDuration', lang) })
      } else {
        scenesCount = computeScenes(secs)
      }
    }

    if (partialErrors.length) {
      return res.status(400).json({ errors: partialErrors })
    }

    const data = {}
    if ('language' in body) data.language = body.language
    if ('contactEmail' in body) data.contactEmail = body.contactEmail
    if ('form' in body) data.form = body.form
    if ('totalDurationSec' in body) data.totalDurationSec = Number(body.totalDurationSec)
    if ('answers' in body) Object.assign(data, mapAnswersArrayToFields(body.answers))
    if (scenesCount !== existing.scenesCount) data.scenesCount = scenesCount
    if ('aiProvider' in body) data.aiProvider = body.aiProvider
    if ('aiModel' in body) data.aiModel = body.aiModel
    if ('temperature' in body) data.temperature = Number(body.temperature)
    if ('negativePrompt' in body) data.negativePrompt = body.negativePrompt

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data,
    })

    const format = data.form?.format || existing.form?.format
    const preview = format && PREVIEW_MAP[format] ? PREVIEW_MAP[format] : undefined
    const maxImages = (data.scenesCount ?? existing.scenesCount) * 2

    res.json({
      leadId: updated.id,
      rules: preview
        ? { maxImages, maxVideoMB: MAX_VIDEO_MB, preview: { format, ...preview } }
        : { maxImages, maxVideoMB: MAX_VIDEO_MB },
    })
  } catch (err) {
    next(err)
  }
})

export default router
