import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { q } from '../db.js'
import { sign, requireAuth } from '../auth.js'
import { str, isEmail } from '../util.js'

const r = Router()
const pub = u => ({ id: u.id, name: u.name, email: u.email, role: u.role })
const DUMMY = bcrypt.hashSync('not-a-real-password', 10)

r.post('/register', async (req, res) => {
  const name = str(req.body?.name, 120), email = str(req.body?.email, 200).toLowerCase(), pw = String(req.body?.password ?? '')
  if (!name) return res.status(400).json({ error: 'Enter your name.' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (pw.length < 8 || pw.length > 100) return res.status(400).json({ error: 'Use a password with 8 to 100 characters.' })
  try {
    const [u] = await q('insert into users(name,email,password_hash) values($1,$2,$3) returning id,name,email,role',
      [name, email, await bcrypt.hash(pw, 10)])
    res.status(201).json({ token: sign(u), user: pub(u) })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' })
    throw e
  }
})

r.post('/login', async (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase(), pw = String(req.body?.password ?? '')
  const [u] = await q('select * from users where lower(email)=$1', [email])
  const ok = await bcrypt.compare(pw, u ? u.password_hash : DUMMY)
  if (!u || !ok) return res.status(401).json({ error: 'Email or password is incorrect.' })
  res.json({ token: sign(u), user: pub(u) })
})

r.get('/me', requireAuth, (req, res) => res.json({ user: req.user }))
export default r
