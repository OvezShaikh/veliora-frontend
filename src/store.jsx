// Frontend data layer. Persists to localStorage so the site works with no backend.
// To go live with a real API, replace the functions in Provider with fetch() calls.
import { createContext, useContext, useEffect, useState } from 'react'

const DB_KEY = 'veliora_db_v3', SESSION_KEY = 'veliora_session_v1'
const uid = () => Math.random().toString(36).slice(2, 10)

// price is left empty on purpose: enter real rates in Dashboard > Products (shown as "On request" until set).
const P = (id, name, category, art, desc, material, colour) => ({ id, name, category, art, desc, material, colour, qty: 'Bulk', price: '', unit: 'kg', image: '' })

const seed = {
  users: [
    { id: 'u1', name: 'Soham Sutar', email: 'superadmin@veliora.in', password: 'Super@123', role: 'superadmin' },
    { id: 'u2', name: 'Plant Manager', email: 'admin@veliora.in', password: 'Admin@123', role: 'admin' },
    { id: 'u3', name: 'Demo Buyer', email: 'user@veliora.in', password: 'User@123', role: 'user' },
  ],
  products: [
    P('p1', 'PP White', 'We deal in', 'pp-white', 'White polypropylene material for recycling.', 'Polypropylene (PP)', 'White'),
    P('p2', 'PP Yellow', 'We deal in', 'pp-yellow', 'Yellow polypropylene material for recycling.', 'Polypropylene (PP)', 'Yellow'),
    P('p3', 'BOPP Colour', 'We deal in', 'bopp-colour', 'Coloured BOPP film material for recycling.', 'BOPP film', 'Coloured'),
    P('p4', 'BOPP Mix', 'We deal in', 'bopp-mix', 'Mixed BOPP film material for recycling.', 'BOPP film', 'Mixed'),
    P('p5', 'PP White Bags Waste', 'We buy', 'bag-white', 'White PP bag waste from factories, bought in bulk.', 'Woven PP bags', 'White'),
    P('p6', 'PP Mixed Bags Waste', 'We buy', 'bag-mixed', 'Mixed-colour PP bag waste from factories, bought in bulk.', 'Woven PP bags', 'Mixed'),
    P('p7', 'PP Jumbo Bags', 'We buy', 'jumbo', 'Jumbo bags bought in large quantities for recycling and processing.', 'Woven PP jumbo bags', 'Mixed'),
    P('p8', 'PP Raffia Bags Waste', 'We buy', 'raffia', 'Raffia bag waste bought in large quantities for recycling and processing.', 'PP raffia', 'Mixed'),
  ],
  inquiries: [],
}

const load = () => { try { return JSON.parse(localStorage.getItem(DB_KEY)) || seed } catch { return seed } }
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function Provider({ children }) {
  const [db, setDb] = useState(load)
  const [sid, setSid] = useState(() => { try { return localStorage.getItem(SESSION_KEY) } catch { return null } })
  useEffect(() => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch {} }, [db])
  useEffect(() => { try { sid ? localStorage.setItem(SESSION_KEY, sid) : localStorage.removeItem(SESSION_KEY) } catch {} }, [sid])
  const user = db.users.find(u => u.id === sid) || null
  const up = (k, fn) => setDb(d => ({ ...d, [k]: fn(d[k]) }))

  const api = {
    db, user,
    login(email, password) {
      const u = db.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!u) return 'Email or password is incorrect.'
      setSid(u.id); return null
    },
    register(name, email, password) {
      if (db.users.some(x => x.email.toLowerCase() === email.trim().toLowerCase())) return 'An account with this email already exists.'
      if (password.length < 6) return 'Use a password with at least 6 characters.'
      const u = { id: uid(), name: name.trim(), email: email.trim(), password, role: 'user' }
      up('users', l => [...l, u]); setSid(u.id); return null
    },
    logout: () => setSid(null),
    addInquiry: i => up('inquiries', l => [{ id: uid(), status: 'new', date: new Date().toISOString(), ...i }, ...l]),
    setStatus: (id, status) => up('inquiries', l => l.map(i => i.id === id ? { ...i, status } : i)),
    addProduct: p => up('products', l => [...l, { id: uid(), qty: 'Bulk', unit: 'kg', price: '', image: '', art: 'pp-white', ...p }]),
    updateProduct: (id, patch) => up('products', l => l.map(x => x.id === id ? { ...x, ...patch } : x)),
    deleteProduct: id => up('products', l => l.filter(p => p.id !== id)),
    setRole: (id, role) => up('users', l => l.map(u => u.id === id ? { ...u, role } : u)),
    deleteUser: id => up('users', l => l.filter(u => u.id !== id)),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
