import { verifyAccessToken } from '../auth/jwt.js'
import { config } from '../config/env.js'

export function authGuard(req, res, next) {
  try {
    const bearer = req.headers.authorization?.split(' ')[1]
    const token = req.cookies[config.COOKIE_NAME_ACCESS] || bearer
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

// Alias for clarity in routes
export const requireAuth = authGuard
