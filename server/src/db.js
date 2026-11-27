import pg from 'pg'

// Small pool: on Vercel every function instance has its own, so keep it tiny.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 3),
  idleTimeoutMillis: 10000,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})
export const q = (text, params) => pool.query(text, params).then(r => r.rows)
