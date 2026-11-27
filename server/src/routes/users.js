import { Router } from 'express'
import { q } from '../db.js'
import { staff, owner } from '../auth.js'
import { uuidParam } from '../util.js'

const r = Router()
r.param('id', uuidParam)

r.get('/', staff, async (_req, res) => {
  res.json(await q('select id,name,email,role from users order by created_at'))
})

async function isLastSuperadmin(id) {
  const [{ n }] = await q("select count(*)::int as n from users where role='superadmin'")
  const [u] = await q('select role from users where id=$1', [id])
  return u?.role === 'superadmin' && n <= 1
}

r.patch('/:id', owner, async (req, res) => {
  const role = req.body?.role
  if (!['user', 'admin', 'superadmin'].includes(role)) return res.status(400).json({ error: 'Invalid role.' })
  if (role !== 'superadmin' && (await isLastSuperadmin(req.params.id))) return res.status(400).json({ error: 'There must be at least one super admin.' })
  const [row] = await q('update users set role=$2 where id=$1 returning id,name,email,role', [req.params.id, role])
  row ? res.json(row) : res.status(404).json({ error: 'User not found.' })
})

r.delete('/:id', owner, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot remove your own account.' })
  await q('delete from users where id=$1', [req.params.id])
  res.status(204).end()
})

export default r
