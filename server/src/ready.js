// First-start setup: creates tables, adds the starting products once, and creates the first super admin.
// Runs once per server instance; everything is guarded so repeating it changes nothing.
import bcrypt from 'bcryptjs'
import { pool } from './db.js'
import { schemaSql, starterProducts } from './schema.js'

let pending
export function ready() {
  if (!process.env.DATABASE_URL) return Promise.reject(new Error('DATABASE_URL is not set'))
  if (!pending) pending = init().catch(e => { pending = null; throw e })
  return pending
}

async function init() {
  const c = await pool.connect()
  try {
    await c.query('begin')
    await c.query('select pg_advisory_xact_lock(727272)') // stops two starting instances doing this at once
    await c.query(schemaSql)

    const seeded = await c.query("select 1 from meta where key='products_seeded'")
    const count = (await c.query('select count(*)::int as n from products')).rows[0].n
    if (!seeded.rowCount && count === 0) {
      for (const p of starterProducts) {
        await c.query('insert into products(name,category,art,description,material,colour) values($1,$2,$3,$4,$5,$6)',
          [p.name, p.category, p.art, p.description, p.material, p.colour])
      }
    }
    await c.query("insert into meta(key,value) values('products_seeded','1') on conflict (key) do nothing")

    const email = (process.env.SEED_SUPERADMIN_EMAIL || '').trim().toLowerCase()
    const pw = process.env.SEED_SUPERADMIN_PASSWORD || ''
    if (email && pw.length >= 8) {
      const has = await c.query("select 1 from users where role='superadmin' limit 1")
      if (!has.rowCount) {
        await c.query(
          `insert into users(name,email,password_hash,role) values($1,$2,$3,'superadmin')
           on conflict ((lower(email))) do update set role='superadmin'`,
          [process.env.SEED_SUPERADMIN_NAME || 'Super Admin', email, await bcrypt.hash(pw, 10)])
      }
    }
    await c.query('commit')
  } catch (e) {
    await c.query('rollback').catch(() => {})
    throw e
  } finally { c.release() }
}
