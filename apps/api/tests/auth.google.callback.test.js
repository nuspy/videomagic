/* @vitest-environment node */
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { startTestDb, stopTestDb } from './helpers/db.js'

describe('Auth Google Callback', () => {
  let app

  beforeAll(async () => {
    await startTestDb()
    process.env.NODE_ENV = 'development'

    vi.doMock('../src/auth/oidc.js', () => ({
      handleCallback: vi.fn(async () => ({
        userinfo: {
          sub: 'google-123',
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/a.png',
        },
      })),
      buildAuthorizationRequest: vi.fn(),
    }))

    const mod = await import('../src/app.js')
    app = mod.default
  })

  afterAll(async () => {
    vi.resetModules()
    await stopTestDb()
  })

  it('creates user and sets session cookies on callback', async () => {
    const res = await request(app)
      .get('/auth/google/callback?code=abc&state=xyz')
      .set('Cookie', [
        'oauth_state=xyz',
        'oauth_nonce=n',
        'oauth_verifier=v',
      ])

    expect(res.status).toBe(303)
    const setCookie = res.headers['set-cookie'] || []
    expect(setCookie.join('\n')).toMatch(/access_token=/)
    expect(setCookie.join('\n')).toMatch(/refresh_token=/)
  })
})
