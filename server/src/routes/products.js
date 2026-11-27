import express from 'express'
import { q } from '../db.js'
import { staff } from '../auth.js'
import { str, uuidParam } from '../util.js'

const r = express.Router()
r.param('id', uuidParam)

const CATS = ['We deal in', 'We buy'], UNITS = ['kg', 'tonne']
const ART = ['pp-white', 'pp-yellow', 'bopp-colour', 'bopp-mix', 'bag-white', 'bag-mixed', 'jumbo', 'raffia']
const COLS = 'id,name,category,description,material,colour,qty,price,unit,art,(image is not null) as has_image,image_version'
const out = r => ({
  id: r.id, name: r.name, category: r.category, desc: r.description, material: r.material, colour: r.colour, qty: r.qty,
  price: r.price == null ? '' : Number(r.price), unit: r.unit, art: r.art,
  image: r.has_image ? `/api/products/${r.id}/image?v=${r.image_version}` : '',
})

function parse(b = {}, partial) {
  const f = {}, has = k => !partial || k in b
  if (has('name')) { const v = str(b.name, 120); if (!v) return { error: 'Enter a name.' }; f.name = v }
  if (has('category')) { if (!CATS.includes(b.category)) return { error: 'Choose a category.' }; f.category = b.category }
  if (has('desc')) f.description = str(b.desc, 500)
  if (has('material')) f.material = str(b.material, 120)
  if (has('colour')) f.colour = str(b.colour, 80)
  if (has('qty')) f.qty = str(b.qty, 80) || 'Bulk'
  if (has('price')) {
    if (b.price === '' || b.price == null) f.price = null
    else { const n = Number(b.price); if (!Number.isFinite(n) || n < 0 || n > 1e9) return { error: 'Enter a valid rate.' }; f.price = n }
  }
  if (has('unit')) { const u = b.unit ?? 'kg'; if (!UNITS.includes(u)) return { error: 'Unit must be kg or tonne.' }; f.unit = u }
  if (has('art')) f.art = ART.includes(b.art) ? b.art : 'pp-white'
  return { f }
}

r.get('/', async (_req, res) => {
  res.json((await q(`select ${COLS} from products order by created_at`)).map(out))
})

r.post('/', staff, async (req, res) => {
  const { f, error } = parse(req.body, false)
  if (error) return res.status(400).json({ error })
  const keys = Object.keys(f)
  const [row] = await q(`insert into products(${keys.join(',')}) values(${keys.map((_, i) => '$' + (i + 1)).join(',')}) returning ${COLS}`, Object.values(f))
  res.status(201).json(out(row))
})

r.patch('/:id', staff, async (req, res) => {
  const { f, error } = parse(req.body, true)
  if (error) return res.status(400).json({ error })
  const keys = Object.keys(f)
  if (!keys.length) return res.status(400).json({ error: 'Nothing to update.' })
  const [row] = await q(`update products set ${keys.map((k, i) => `${k}=$${i + 2}`).join(',')} where id=$1 returning ${COLS}`, [req.params.id, ...Object.values(f)])
  row ? res.json(out(row)) : res.status(404).json({ error: 'Product not found.' })
})

r.delete('/:id', staff, async (req, res) => {
  await q('delete from products where id=$1', [req.params.id])
  res.status(204).end()
})

// Photos are stored in the database. The website sends them as a base64 data URL in JSON.
r.put('/:id/image', staff, async (req, res) => {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.image ?? ''))
  if (!m) return res.status(400).json({ error: 'Send a JPG, PNG or WebP image.' })
  const buf = Buffer.from(m[2], 'base64')
  if (!buf.length || buf.length > 1.5 * 1024 * 1024) return res.status(400).json({ error: 'The image must be under 1.5 MB.' })
  const [row] = await q('update products set image=$2, image_type=$3, image_version=image_version+1 where id=$1 returning id', [req.params.id, buf, m[1]])
  row ? res.status(204).end() : res.status(404).json({ error: 'Product not found.' })
})

r.get('/:id/image', async (req, res) => {
  const [row] = await q('select image, image_type from products where id=$1', [req.params.id])
  if (!row?.image) return res.status(404).end()
  res.set({ 'Content-Type': row.image_type, 'Cache-Control': 'public, max-age=31536000, immutable' }).send(row.image)
})

export default r
