// Talks to the Veliora backend (server/ folder). Pages keep using useApp() unchanged.
import { useEffect, useState } from 'react'
import { Ctx, API_URL } from './ctx.js'

const TOKEN_KEY = 'veliora_token'
let TOKEN = (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()
const saveToken = t => { TOKEN = t; try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} }

const toDataUrl = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob) })

async function call(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  let payload
  if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  let res
  try { res = await fetch(API_URL + path, { method, headers, body: payload }) }
  catch { throw new Error('Cannot reach the server. Check your connection and try again.') }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Request failed.')
  return data
}
const withImage = p => ({ ...p, image: p.image?.startsWith('/') ? API_URL + p.image : p.image || '' })
const msg = e => e.message || 'Something went wrong.'
const isStaff = r => r === 'admin' || r === 'superadmin'

export function ApiProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(Boolean(TOKEN))
  const [products, setProducts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [inquiries, setInquiries] = useState([])
  const [users, setUsers] = useState([])

  const loadProducts = async () => { try { setProducts((await call('/api/products')).map(withImage)) } catch {} setLoaded(true) }
  const loadInquiries = async () => { try { setInquiries(await call('/api/inquiries')) } catch {} }
  const loadUsers = async () => { try { setUsers(await call('/api/users')) } catch {} }
  const loadPrivate = u => { loadInquiries(); if (isStaff(u.role)) loadUsers() }

  useEffect(() => {
    loadProducts()
    if (!TOKEN) return
    call('/api/auth/me')
      .then(({ user }) => { setUser(user); loadPrivate(user) })
      .catch(e => { if (/log in/i.test(e.message)) saveToken(null) })
      .finally(() => setBooting(false))
  }, [])

  const enter = ({ token, user }) => { saveToken(token); setUser(user); loadPrivate(user) }

  const api = {
    db: { products, inquiries, users }, user, ready: !booting, loaded,

    async login(email, password) {
      try { enter(await call('/api/auth/login', { method: 'POST', body: { email, password } })); return {} } catch (e) { return { error: msg(e) } }
    },
    async register(name, email, password) {
      if (password.length < 8) return { error: 'Use a password with at least 8 characters.' }
      try { enter(await call('/api/auth/register', { method: 'POST', body: { name, email, password } })); return {} } catch (e) { return { error: msg(e) } }
    },
    async logout() { saveToken(null); setUser(null); setInquiries([]); setUsers([]) },

    async addInquiry(i) {
      try { await call('/api/inquiries', { method: 'POST', body: i }); if (user) loadInquiries(); return null } catch (e) { return msg(e) }
    },
    async setStatus(id, status) {
      setInquiries(l => l.map(i => i.id === id ? { ...i, status } : i))
      try { await call(`/api/inquiries/${id}`, { method: 'PATCH', body: { status } }) } catch { loadInquiries() }
    },

    async addProduct(p) {
      try {
        const { file, image, ...body } = p
        const created = await call('/api/products', { method: 'POST', body })
        if (file) await call(`/api/products/${created.id}/image`, { method: 'PUT', body: { image: await toDataUrl(file) } })
        await loadProducts(); return null
      } catch (e) { return msg(e) }
    },
    async updateProduct(id, patch) {
      setProducts(l => l.map(x => x.id === id ? { ...x, ...patch } : x))
      try { await call(`/api/products/${id}`, { method: 'PATCH', body: patch }) } catch { loadProducts() }
    },
    async setProductPhoto(id, blob) {
      try { await call(`/api/products/${id}/image`, { method: 'PUT', body: { image: await toDataUrl(blob) } }); await loadProducts(); return null } catch (e) { return msg(e) }
    },
    async deleteProduct(id) {
      setProducts(l => l.filter(p => p.id !== id))
      try { await call(`/api/products/${id}`, { method: 'DELETE' }) } catch { loadProducts() }
    },

    async setRole(id, role) {
      setUsers(l => l.map(u => u.id === id ? { ...u, role } : u))
      try { await call(`/api/users/${id}`, { method: 'PATCH', body: { role } }) } catch { loadUsers() }
    },
    async deleteUser(id) {
      setUsers(l => l.filter(u => u.id !== id))
      try { await call(`/api/users/${id}`, { method: 'DELETE' }) } catch { loadUsers() }
    },
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
