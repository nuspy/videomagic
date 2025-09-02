import express from 'express'
import cookieParser from 'cookie-parser'
import { cookieBaseOptions, config } from '../config/env.js'
import { buildAuthorizationRequest, handleCallback } from '../auth/oidc.js'
import { prisma } from '../db.js'
import { signAccessToken, signRefreshToken } from '../auth/jwt.js'
import { authGuard } from '../middleware/authGuard.js'

export const authRouter = express.Router()

// Ensure cookies are parsed for this router
authRouter.use(cookieParser())

function setOAuthTempCookies(res, { state, nonce, code_verifier }) {
  const opts = {
    ...cookieBaseOptions,
    maxAge: 10 * 60 * 1000, // 10 minutes
  }
  res.cookie('oauth_state', state, opts)
  res.cookie('oauth_nonce', nonce, opts)
  res.cookie('oauth_verifier', code_verifier, opts)
}

function readOAuthTempCookies(req) {
  const state = req.cookies['oauth_state']
  const nonce = req.cookies['oauth_nonce']
  const code_verifier = req.cookies['oauth_verifier']
  return { state, nonce, code_verifier }
}

function clearOAuthTempCookies(res) {
  const opts = { ...cookieBaseOptions, maxAge: 0 }
  res.cookie('oauth_state', '', opts)
  res.cookie('oauth_nonce', '', opts)
  res.cookie('oauth_verifier', '', opts)
}

function setSessionCookies(res, accessToken, refreshToken) {
  const accessOpts = {
    ...cookieBaseOptions,
    maxAge: 1000 * 60 * 60, // cap to 1h for browsers; JWT controls real exp
  }
  const refreshOpts = {
    ...cookieBaseOptions,
    // Let browser retain for up to 30 days; JWT controls real exp
    maxAge: 1000 * 60 * 60 * 24 * 30,
  }
  res.cookie(config.COOKIE_NAME_ACCESS, accessToken, accessOpts)
  res.cookie(config.COOKIE_NAME_REFRESH, refreshToken, refreshOpts)
}

// GET /auth/google - redirect to Google
authRouter.get('/google', async (req, res, next) => {
  try {
    const { url, state, nonce, code_verifier } = await buildAuthorizationRequest()
    setOAuthTempCookies(res, { state, nonce, code_verifier })
    res.redirect(url)
  } catch (e) {
    next(e)
  }
})

// GET /auth/google/callback - process code, upsert user, associate leads, reset quota, issue JWT cookies, audit
authRouter.get('/google/callback', async (req, res, next) => {
  try {
    req._oauthMeta = readOAuthTempCookies(req)
    if (!req._oauthMeta.state || !req._oauthMeta.nonce || !req._oauthMeta.code_verifier) {
      return res.status(400).send('Invalid or expired OAuth session.')
    }
    const { userinfo } = await handleCallback(req)
    clearOAuthTempCookies(res)

    const googleId = userinfo.sub
    const email = userinfo.email
    const name = userinfo.name || userinfo.given_name || null
    const pictureUrl = userinfo.picture || null
    const locale = userinfo.locale || null
    const now = new Date()

    // Upsert user enriched profile
    const user = await prisma.user.upsert({
      where: { googleId },
      update: {
        email,
        name,
        pictureUrl,
        locale,
        lastLoginAt: now,
      },
      create: {
        googleId,
        email,
        name,
        pictureUrl,
        locale,
        lastLoginAt: now,
        role: 'USER',
      },
    })

    // Reset monthly preview quota if expired
    if (!user.previewQuotaResetAt || now > user.previewQuotaResetAt) {
      const nextReset = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      await prisma.user.update({
        where: { id: user.id },
        data: { previewQuotaUsed: 0, previewQuotaResetAt: nextReset },
      })
    }

    // Associate anonymous leads from cookie
    const anonCookie = req.cookies['anon_leads']
    if (anonCookie) {
      try {
        const ids = JSON.parse(anonCookie)
        if (Array.isArray(ids) && ids.length) {
          await prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: { userId: user.id },
          })
        }
      } catch {
        // ignore malformed cookie
      }
      // clear anon_leads cookie
      const opts = { ...cookieBaseOptions, maxAge: 0 }
      res.cookie('anon_leads', '', opts)
    }

    // Audit
    await prisma.auditLog.create({
      data: { who: user.id, what: 'auth_login', metaJson: { provider: 'google' } },
    })

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    setSessionCookies(res, accessToken, refreshToken)

    const redirect = req.query.redirect || '/'
    res.status(303).set('Location', redirect).send('Authenticated')
  } catch (e) {
    next(e)
  }
})

// GET /profile - basic profile for UI
authRouter.get('/profile', authGuard, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        locale: true,
        lastLoginAt: true,
        company: true,
        phone: true,
        marketingConsent: true,
        privacyConsentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json({ user })
  } catch (e) {
    next(e)
  }
})
