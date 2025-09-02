export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

// Convenience admin-only middleware
export function requireAdmin(req, res, next) {
  return requireRole('ADMIN')(req, res, next)
}
