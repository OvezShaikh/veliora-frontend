import jwt from 'jsonwebtoken'
import { q } from './db.js'

const secret = () => {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be set to a random string of 32+ characters (see .env.example).')
  return s
}
export const sign = u => jwt.sign({ sub: u.id }, secret(), { expiresIn: '7d' })

// The role is read from the database on every request, so role changes apply immediately.
async function load(req) {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ')) return null
  try {
    const { sub } = jwt.verify(h.slice(7), secret())
    const [u] = await q('select id,name,email,role from users where id=$1', [sub])
    return u || null
  } catch { return null }
}
export const optionalAuth = async (req, _res, next) => { req.user = await load(req); next() }
export const requireAuth = async (req, res, next) => {
  req.user = await load(req)
  if (!req.user) return res.status(401).json({ error: 'Please log in.' })
  next()
}
export const requireRole = (...roles) => async (req, res, next) => {
  req.user = await load(req)
  if (!req.user) return res.status(401).json({ error: 'Please log in.' })
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to do that.' })
  next()
}
export const staff = requireRole('admin', 'superadmin')
export const owner = requireRole('superadmin')
