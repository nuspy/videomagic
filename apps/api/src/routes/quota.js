import express from 'express'
import { requireAuth } from '../middleware/authGuard.js'
import { getQuota, tryConsumePreview } from '../middleware/previewQuota.js'

const router = express.Router()

// GET /quota -> { remaining, resetAt }
router.get('/quota', requireAuth, async (req, res, next) => {
  try {
    const info = await getQuota(req.user.id)
    res.json(info)
  } catch (e) {
    next(e)
  }
})

// POST /quota -> consume one if available
router.post('/quota', requireAuth, async (req, res, next) => {
  try {
    await tryConsumePreview(req, res)
  } catch (e) {
    next(e)
  }
})

export default router
