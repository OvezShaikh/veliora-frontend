import { useState } from 'react'
import { useApp } from '../store.jsx'

export default function InquiryForm({ product = '', compact = false }) {
  const { db, user, addInquiry } = useApp()
  const [f, setF] = useState({ name: user?.name || '', email: user?.email || '', phone: '', product, qty: '', message: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    const m = await addInquiry(f)
    setBusy(false)
    if (m) return setErr(m)
    setSent(true); setF({ ...f, qty: '', message: '' })
  }
  if (sent) return (
    <div className="note ok" role="status">
      <strong>Quote request sent.</strong> We reply within one working day.
      <div><button className="btn ghost sm" onClick={() => setSent(false)}>Send another request</button></div>
    </div>
  )
  return (
    <form className="form" onSubmit={submit}>
      <div className="row">
        <label>Your name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Email<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
      </div>
      <div className="row">
        <label>Phone<input value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Material
          <select required value={f.product} onChange={set('product')}>
            <option value="">Choose a material</option>
            {db.products.map(p => <option key={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>
      <label>Quantity needed<input value={f.qty} onChange={set('qty')} placeholder="e.g. 5 tonnes per month" /></label>
      {!compact && <label>Details<textarea rows="4" value={f.message} onChange={set('message')} placeholder="Buying or selling, colour, delivery location" /></label>}
      {err && <div className="note err" role="alert">{err}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send quote request'}</button>
    </form>
  )
}
