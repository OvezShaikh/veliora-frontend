import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { q } from './db.js'
import { ready } from './ready.js'
import auth from './routes/auth.js'
import products from './routes/products.js'
import inquiries from './routes/inquiries.js'
import users from './routes/users.js'

const app = express()
app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
// The website and API share one address, so CORS is only needed if you host the API somewhere else.
if (process.env.CORS_ORIGIN) app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }))
app.use(express.json({ limit: '2mb' }))

app.use('/api', async (_req, res, next) => {
  try { await ready(); next() } catch (e) {
    console.error('Startup failed:', e.message)
    res.status(503).json({ error: 'The server is not ready. Check the database settings.' })
  }
})

app.get('/api/health', async (_req, res) => { await q('select 1'); res.json({ ok: true }) })
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, message: { error: 'Too many attempts. Try again in a few minutes.' } }), auth)
app.use('/api/products', products)
app.use('/api/inquiries', inquiries)
app.use('/api/users', users)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

export default app
