import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import InquiryForm from '../components/InquiryForm.jsx'
import { Media } from '../components/ProductArt.jsx'

const TABS = {
  user: ['My requests', 'New request', 'Profile'],
  admin: ['Overview', 'Inquiries', 'Products'],
  superadmin: ['Overview', 'Inquiries', 'Products', 'Users'],
}
const ROLE = { user: 'Customer', admin: 'Admin', superadmin: 'Super admin' }
const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Dashboard() {
  const { user, ready } = useApp()
  if (!ready) return <section className="wrap page"><p className="muted">Loading…</p></section>
  if (!user) return <Navigate to="/login" replace />
  return <Panel key={user.id} user={user} />
}

function Panel({ user }) {
  const tabs = TABS[user.role]
  const [tab, setTab] = useState(tabs[0])
  const View = { 'My requests': MyRequests, 'New request': NewRequest, Profile, Overview, Inquiries, Products, Users }[tab]
  return (
    <section className="wrap page dash">
      <div className="dash-head">
        <div><h1>Hello, {user.name.split(' ')[0]}</h1><span className={'role ' + user.role}>{ROLE[user.role]}</span></div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <View />
    </section>
  )
}

const Status = ({ s }) => <span className={'st ' + s}>{s === 'new' ? 'New' : s === 'progress' ? 'In progress' : 'Closed'}</span>

function MyRequests() {
  const { db, user } = useApp()
  const mine = db.inquiries.filter(i => i.userId === user.id || i.email.toLowerCase() === user.email.toLowerCase())
  if (!mine.length) return <p className="muted">You haven’t sent a request yet. Open “New request” to ask for a quote.</p>
  return (
    <div className="tablewrap"><table>
      <thead><tr><th>Date</th><th>Product</th><th>Quantity</th><th>Status</th></tr></thead>
      <tbody>{mine.map(i => <tr key={i.id}><td>{fmt(i.date)}</td><td>{i.product}</td><td>{i.qty || '—'}</td><td><Status s={i.status} /></td></tr>)}</tbody>
    </table></div>
  )
}
const NewRequest = () => <div className="narrow"><InquiryForm compact /></div>
function Profile() {
  const { user } = useApp()
  return <dl className="prof"><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Account type</dt><dd>{ROLE[user.role]}</dd></div></dl>
}

function Overview() {
  const { db, user } = useApp()
  const stats = [['Open inquiries', db.inquiries.filter(i => i.status !== 'closed').length], ['Materials listed', db.products.length], ['Registered users', db.users.length]]
  return (
    <>
      <div className="stats">{stats.map(([l, n]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
      <p className="muted">{user.role === 'superadmin' ? 'You can manage inquiries, products and every user’s role.' : 'You can manage inquiries and the product list.'}</p>
    </>
  )
}

function Inquiries() {
  const { db, setStatus } = useApp()
  if (!db.inquiries.length) return <p className="muted">No inquiries yet. New quote requests from the website appear here.</p>
  return (
    <div className="tablewrap"><table>
      <thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Details</th><th>Status</th></tr></thead>
      <tbody>{db.inquiries.map(i => (
        <tr key={i.id}>
          <td>{fmt(i.date)}</td>
          <td>{i.name}<br /><small><a href={`mailto:${i.email}`}>{i.email}</a>{i.phone && <> · {i.phone}</>}</small></td>
          <td>{i.product}<br /><small>{i.qty}</small></td>
          <td className="wrapcell">{i.message || '—'}</td>
          <td><select aria-label="Status" value={i.status} onChange={e => setStatus(i.id, e.target.value)}>
            <option value="new">New</option><option value="progress">In progress</option><option value="closed">Closed</option></select></td>
        </tr>))}</tbody>
    </table></div>
  )
}

const ARTS = [['pp-white', 'White bale'], ['pp-yellow', 'Yellow bale'], ['bopp-colour', 'Colour film bale'], ['bopp-mix', 'Mixed film bale'], ['bag-white', 'White bags'], ['bag-mixed', 'Mixed bags'], ['jumbo', 'Jumbo bag'], ['raffia', 'Raffia bag']]

// Shrinks a chosen photo to a JPEG blob (max 1000px) before it is uploaded.
const resize = file => new Promise((res, rej) => {
  const url = URL.createObjectURL(file), img = new Image()
  img.onload = () => {
    const k = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas')
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    URL.revokeObjectURL(url)
    c.toBlob(b => (b ? res(b) : rej()), 'image/jpeg', 0.82)
  }
  img.onerror = () => { URL.revokeObjectURL(url); rej() }
  img.src = url
})

function Products() {
  const { db, addProduct, deleteProduct, updateProduct, setProductPhoto } = useApp()
  const empty = { name: '', category: 'We deal in', desc: '', material: '', colour: '', qty: 'Bulk', price: '', unit: 'kg', art: 'pp-white', image: '', file: null }
  const [f, setF] = useState(empty)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const pick = async e => {
    const file = e.target.files[0]; if (!file) return
    try { const blob = await resize(file); setF(x => ({ ...x, file: blob, image: URL.createObjectURL(blob) })); setErr('') } catch { setErr('That file could not be read as an image.') }
  }
  const submit = async e => {
    e.preventDefault(); const form = e.currentTarget; setBusy(true)
    const m = await addProduct(f); setBusy(false)
    if (m) setErr(m); else { setF(empty); setErr(''); form.reset() }
  }
  const changePhoto = async (id, e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return
    try { const m = await setProductPhoto(id, await resize(file)); if (m) setErr(m) } catch { setErr('That file could not be read as an image.') }
  }
  return (
    <>
      <form className="form inline" onSubmit={submit}>
        <div className="row"><label>Name<input required value={f.name} onChange={set('name')} /></label>
          <label>Category<select value={f.category} onChange={set('category')}><option>We deal in</option><option>We buy</option></select></label></div>
        <label>Description<input required value={f.desc} onChange={set('desc')} /></label>
        <div className="row"><label>Material<input value={f.material} onChange={set('material')} placeholder="e.g. Polypropylene (PP)" /></label>
          <label>Colour<input value={f.colour} onChange={set('colour')} /></label></div>
        <div className="row3"><label>Rate in ₹<input type="number" min="0" step="0.01" value={f.price} onChange={set('price')} placeholder="Empty = On request" /></label>
          <label>Per<select value={f.unit} onChange={set('unit')}><option>kg</option><option>tonne</option></select></label>
          <label>Quantity<input value={f.qty} onChange={set('qty')} /></label></div>
        <div className="row"><label>Photo (JPG or PNG)<input type="file" accept="image/*" onChange={pick} /></label>
          <label>No photo? Use illustration<select value={f.art} onChange={set('art')}>{ARTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div>
        {err && <div className="note err" role="alert">{err}</div>}
        <div className="addrow"><div className="thumb"><Media p={{ ...f, name: f.name || 'Preview' }} /></div><button className="btn sm" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Add product'}</button></div>
      </form>
      <div className="tablewrap"><table>
        <thead><tr><th>Product</th><th>Type</th><th>Rate in ₹</th><th /></tr></thead>
        <tbody>{db.products.map(p => (
          <tr key={p.id}>
            <td><div className="prow"><div className="thumb sm"><Media p={p} /></div>{p.name}</div></td>
            <td>{p.category}</td>
            <td><div className="rate">
              <input type="number" min="0" step="0.01" aria-label={`Rate for ${p.name}`} placeholder="On request" key={p.id + '-' + p.price} defaultValue={p.price}
                onBlur={e => String(e.target.value) !== String(p.price) && updateProduct(p.id, { price: e.target.value })} />
              <select aria-label="Unit" value={p.unit || 'kg'} onChange={e => updateProduct(p.id, { unit: e.target.value })}><option>kg</option><option>tonne</option></select></div></td>
            <td><div className="rate">
              <label className="btn ghost sm">Photo<input type="file" accept="image/*" hidden onChange={e => changePhoto(p.id, e)} /></label>
              <button className="btn ghost sm" onClick={() => window.confirm(`Delete “${p.name}”?`) && deleteProduct(p.id)}>Delete</button></div></td>
          </tr>))}</tbody>
      </table></div>
    </>
  )
}

function Users() {
  const { db, user, setRole, deleteUser } = useApp()
  const supers = db.users.filter(u => u.role === 'superadmin').length
  return (
    <div className="tablewrap"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead>
      <tbody>{db.users.map(u => {
        const locked = u.id === user.id && supers === 1
        return (
          <tr key={u.id}>
            <td>{u.name}</td><td>{u.email}</td>
            <td><select aria-label={`Role for ${u.name}`} value={u.role} disabled={locked} onChange={e => setRole(u.id, e.target.value)}>
              <option value="user">Customer</option><option value="admin">Admin</option><option value="superadmin">Super admin</option></select></td>
            <td>{u.id !== user.id && <button className="btn ghost sm" onClick={() => window.confirm(`Remove ${u.name}?`) && deleteUser(u.id)}>Remove</button>}</td>
          </tr>)
      })}</tbody>
    </table></div>
  )
}
