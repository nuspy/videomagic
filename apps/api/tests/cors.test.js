/* @vitest-environment node */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

describe('CORS configuration', () => {
  let app

  beforeAll(async () => {
    // Configure allowed origin for test
    process.env.ALLOWED_ORIGINS = 'http://localhost:5173,https://example.com'
    process.env.NODE_ENV = 'development'
    const mod = await import('../src/app.js')
    app = mod.default
  })

  afterAll(() => {
    delete process.env.ALLOWED_ORIGINS
  })

  it('allows requests from an allowed origin and sets credentials header', async () => {
    const origin = 'http://localhost:5173'
    const res = await request(app).get('/healthz').set('Origin', origin)
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('blocks requests from a disallowed origin', async () => {
    const origin = 'http://malicious.local'
    const res = await request(app).get('/healthz').set('Origin', origin)
    // CORS middleware should reject with an error -> 500 via global handler in dev
    expect(res.status).toBe(500)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('handles preflight (OPTIONS) for allowed origin', async () => {
    const origin = 'https://example.com'
    const res = await request(app)
      .options('/healthz')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'GET')
    // cors responds to preflight with 204 by default
    expect([200, 204]).toContain(res.status) // allow either per cors version
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })
})
