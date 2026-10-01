const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    return next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Sign in again.' })
  }
}

module.exports = { requireAuth }
