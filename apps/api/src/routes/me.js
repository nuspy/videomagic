import express from 'express'
import { authGuard } from '../middleware/authGuard.js'
import { prisma } from '../db.js'

export const meRouter = express.Router()

meRouter.get('/me', authGuard, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        locale: true,
        role: true,
        lastLoginAt: true,
        company: true,
        phone: true,
        marketingConsent: true,
        privacyConsentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json({ user })
  } catch (e) {
    next(e)
  }
})

// Also expose /profile for convenience
meRouter.get('/profile', authGuard, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        locale: true,
        role: true,
        lastLoginAt: true,
        company: true,
        phone: true,
        marketingConsent: true,
        privacyConsentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json({ user })
  } catch (e) {
    next(e)
  }
})
