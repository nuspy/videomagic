/* @vitest-environment node */
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb } from './helpers/db.js'
import sharp from 'sharp'

// Hoisted mocks so ESM imports in app/routes resolve to these stubs
vi.mock('../src/s3/client.js', () => ({
  putObject: vi.fn(async () => {}),
  getPresignedUrl: vi.fn(async ({ Key }) => `https://s3.local/${Key}?sig=1`),
}))

vi.mock('../src/middleware/authGuard.js', () => ({
  authGuard: (req, _res, next) => {
    req.user = { id: 'user-test', role: 'USER' }
    next()
  },
}))

describe('Upload validation', () => {
  let app

  beforeAll(async () => {
    await startTestDb()
    process.env.NODE_ENV = 'development'
    process.env.S3_BUCKET_UPLOADS = 'uploads'

    const mod = await import('../src/app.js')
    app = mod.default
  })

  afterAll(async () => {
    vi.resetModules()
    await stopTestDb()
  })

  it('rejects non-image executable-like payloads', async () => {
    const exeBuffer = Buffer.from('MZ' + 'X'.repeat(1000))
    const res = await request(app)
      .post('/upload')
      .attach('file', exeBuffer, { filename: 'evil.exe', contentType: 'application/octet-stream' })

    expect(res.status).toBe(415)
    expect(res.body.error).toMatch(/Unsupported media type/i)
  })

  it('accepts a small PNG, stores media and returns presigned URLs', async () => {
    const png = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    }).png().toBuffer()

    const res = await request(app)
      .post('/upload')
      .attach('file', png, { filename: 'red.png', contentType: 'image/png' })

    expect(res.status).toBe(201)
    expect(res.body.media).toBeTruthy()
    expect(res.body.urls.original).toMatch(/^https:\/\/s3\.local/)
    expect(res.body.urls.thumb_640).toMatch(/^https:\/\/s3\.local/)
  })
})
