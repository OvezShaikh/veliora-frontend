import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { q } from '../db.js'
import { optionalAuth, requireAuth, staff } from '../auth.js'
import { str, isEmail, uuidParam } from '../util.js'

const r = Router()
r.param('id', uuidParam)
const out = r => ({ id: r.id, userId: r.user_id, name: r.name, email: r.email, phone: r.phone || '', product: r.product, qty: r.qty || '', message: r.message || '', status: r.status, date: r.created_at })

// Anyone can send a quote request; the limit keeps bots from flooding the dashboard.
const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { error: 'Too many requests. Please try again later or call us.' } })

r.post('/', limit, optionalAuth, async (req, res) => {
  const b = req.body || {}
  const name = str(b.name, 120), email = str(b.email, 200), product = str(b.product, 120)
  if (!name || !product) return res.status(400).json({ error: 'Enter your name and choose a material.' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  await q('insert into inquiries(user_id,name,email,phone,product,qty,message) values($1,$2,$3,$4,$5,$6,$7)',
    [req.user?.id ?? null, name, email, str(b.phone, 40) || null, product, str(b.qty, 120) || null, str(b.message, 2000) || null])
  res.status(201).json({ ok: true })
})

r.get('/', requireAuth, async (req, res) => {
  const rows = ['admin', 'superadmin'].includes(req.user.role)
    ? await q('select * from inquiries order by created_at desc')
    : await q('select * from inquiries where user_id=$1 or lower(email)=lower($2) order by created_at desc', [req.user.id, req.user.email])
  res.json(rows.map(out))
})

r.patch('/:id', staff, async (req, res) => {
  const status = req.body?.status
  if (!['new', 'progress', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status.' })
  const [row] = await q('update inquiries set status=$2 where id=$1 returning *', [req.params.id, status])
  row ? res.json(out(row)) : res.status(404).json({ error: 'Inquiry not found.' })
})

export default r
