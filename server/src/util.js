export const str = (v, max) => String(v ?? '').trim().slice(0, max)
export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const isUuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
export const uuidParam = (req, res, next, id) => (isUuid(id) ? next() : res.status(404).json({ error: 'Not found.' }))
