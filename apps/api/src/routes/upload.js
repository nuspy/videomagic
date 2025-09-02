import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'
import { extension as extFromMime } from 'mime-types'
import { randomUUID } from 'crypto'
import { authGuard } from '../middleware/authGuard.js'
import { prisma } from '../db.js'
import { getPresignedUrl, putObject } from '../s3/client.js'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'

const router = express.Router()

const TEN_MB = 10 * 1024 * 1024
const FIFTY_MB = 50 * 1024 * 1024
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || TEN_MB)
const BUCKET = process.env.S3_BUCKET_UPLOADS

const storage = multer.memoryStorage()
// allow up to 50MB to accommodate video
const upload = multer({
  storage,
  limits: { fileSize: Math.max(MAX_UPLOAD_BYTES, FIFTY_MB), files: 1 },
})

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm'])
const ALLOWED_MIME = new Set([...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME])

function buildKey(baseName, ext, leadId) {
  const date = new Date()
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const prefix = leadId ? `leads/${leadId}` : 'uploads'
  return `${prefix}/${y}/${m}/${d}/${baseName}.${ext}`
}

function getLang(req) {
  const q = (req.query.lang || '').toString().toLowerCase()
  if (q) return q
  const h = (req.headers['accept-language'] || '').toString().toLowerCase()
  if (h.startsWith('it')) return 'it'
  if (h.startsWith('uk') || h.startsWith('ua')) return 'ua'
  return 'en'
}

function quotaMessageOverImages(lang, maxImages) {
  const messages = {
    en: `You have reached the maximum number of images (${maxImages}) for this lead.`,
    it: `Hai raggiunto il numero massimo di immagini (${maxImages}) per questo lead.`,
    ua: `Ви досягли максимальної кількості зображень (${maxImages}) для цього ліда.`,
  }
  return messages[lang] || messages.en
}

router.post(
  '/upload',
  authGuard,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large' })
        }
        return next(err)
      }
      next()
    })
  },
  async (req, res, next) => {
    try {
      const lang = getLang(req)
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'Missing file field "file"' })
      }

      const leadId = req.body.leadId || req.query.leadId
      if (!leadId) {
        return res.status(400).json({ error: 'Missing leadId' })
      }

      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { scenesCount: true },
      })
      if (!lead) return res.status(404).json({ error: 'Lead not found' })

      const buffer = req.file.buffer
      const sizeBytes = req.file.size

      const detected = await fileTypeFromBuffer(buffer)
      const mime = detected?.mime || req.file.mimetype

      if (!ALLOWED_MIME.has(mime)) {
        return res.status(415).json({ error: `Unsupported media type: ${mime}` })
      }

      // Enforce image count limit
      const maxImages = (lead.scenesCount || 0) * 2
      let mediaType = ALLOWED_IMAGE_MIME.has(mime) ? 'IMAGE' : 'VIDEO'
      if (mediaType === 'IMAGE') {
        const existingImages = await prisma.media.count({ where: { leadId, type: 'IMAGE' } })
        if (existingImages >= maxImages) {
          return res.status(409).json({ error: quotaMessageOverImages(lang, maxImages) })
        }
      }

      // Enforce video max file size
      if (mediaType === 'VIDEO' && sizeBytes > FIFTY_MB) {
        return res.status(413).json({ error: 'Video exceeds 50MB limit' })
      }

      const baseName = randomUUID()
      const originalExt = extFromMime(mime) || 'bin'
      const originalKey = buildKey(baseName, originalExt, leadId)

      let width = null
      let height = null
      let thumbBuffer
      let thumbMime = 'image/jpeg'

      // Upload original file
      await putObject({
        Bucket: BUCKET,
        Key: originalKey,
        Body: buffer,
        ContentType: mime,
        CacheControl: 'public, max-age=31536000, immutable',
      })

      // Generate 360px thumbnail on the longest side
      if (mediaType === 'IMAGE') {
        const image = sharp(buffer, { failOn: 'none' })
        const meta = await image.metadata()
        width = meta.width || null
        height = meta.height || null

        const longest = Math.max(width || 0, height || 0)
        const resizeOpts = longest === width ? { width: 360 } : { height: 360 }

        const thumbSharp = sharp(buffer, { failOn: 'none' }).resize({
          ...resizeOpts,
          fit: 'inside',
          withoutEnlargement: true,
        })

        thumbBuffer = await thumbSharp.jpeg({ quality: 82 }).toBuffer()
      } else {
        // VIDEO: extract first frame via ffmpeg and resize via sharp
        // Requires ffmpeg installed on host
        const stream = new PassThrough()
        stream.end(buffer)

        const frameBuffer = await new Promise((resolve, reject) => {
          // Save one frame as JPEG in memory using ffmpeg pipe
          const chunks = []
          ffmpeg(stream)
            .format('image2')
            .frames(1)
            .on('error', reject)
            .on('end', () => resolve(Buffer.concat(chunks)))
            .pipe()
            .on('data', (chunk) => chunks.push(chunk))
        })

        const meta = await sharp(frameBuffer).metadata()
        const longest = Math.max(meta.width || 0, meta.height || 0)
        const resizeOpts = longest === (meta.width || 0) ? { width: 360 } : { height: 360 }
        thumbBuffer = await sharp(frameBuffer)
          .resize({ ...resizeOpts, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer()

        width = meta.width || null
        height = meta.height || null
      }

      const thumbMeta = await sharp(thumbBuffer).metadata()
      const thumbWidth = thumbMeta.width || null
      const thumbHeight = thumbMeta.height || null
      const thumbExt = 'jpg'
      const thumbKey = buildKey(`${baseName}_thumb360`, thumbExt, leadId)

      await putObject({
        Bucket: BUCKET,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: thumbMime,
        CacheControl: 'public, max-age=31536000, immutable',
      })

      // Persist DB
      const variants = {
        original: { key: originalKey, width, height, mime },
        thumb_360: { key: thumbKey, width: thumbWidth, height: thumbHeight, mime: thumbMime },
      }

      const media = await prisma.media.create({
        data: {
          leadId,
          type: mediaType,
          filename: req.file.originalname || `${baseName}.${originalExt}`,
          sizeBytes,
          mime,
          width,
          height,
          storageKey: originalKey,
          publicUrl: `s3://${BUCKET}/${originalKey}`,
          thumb360Url: `s3://${BUCKET}/${thumbKey}`,
          uploaderSessionId: null,
          variants,
          // legacy compat
          key: originalKey,
          url: `s3://${BUCKET}/${originalKey}`,
          uploaderId: req.user.id,
        },
        select: {
          id: true,
          leadId: true,
          type: true,
          filename: true,
          sizeBytes: true,
          mime: true,
          width: true,
          height: true,
          storageKey: true,
          publicUrl: true,
          thumb360Url: true,
          variants: true,
          createdAt: true,
        },
      })

      // Presigned URLs
      const originalUrl = await getPresignedUrl({ Bucket: BUCKET, Key: originalKey })
      const thumbUrl = await getPresignedUrl({ Bucket: BUCKET, Key: thumbKey })

      res.status(201).json({
        media,
        urls: {
          original: originalUrl,
          thumb_360: thumbUrl,
        },
      })
    } catch (e) {
      next(e)
    }
  }
)

export default router
