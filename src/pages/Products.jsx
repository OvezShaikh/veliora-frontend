import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { Media } from '../components/ProductArt.jsx'
import InquiryForm from '../components/InquiryForm.jsx'

const FILTERS = [['all', 'All'], ['We deal in', 'Materials we deal in'], ['We buy', 'Waste we buy']]

function Price({ p }) {
  const buy = p.category === 'We buy'
  const has = p.price !== '' && p.price != null && !isNaN(p.price)
  return (
    <div className="price">
      <small>{buy ? 'Buying rate' : 'Selling rate'}</small>
      {has ? <b>₹{Number(p.price).toLocaleString('en-IN')}<i> / {p.unit || 'kg'}</i></b> : <b className="ask">On request</b>}
    </div>
  )
}

const Specs = ({ p }) => (
  <ul className="specs">
    {[['Material', p.material], ['Colour', p.colour], ['Quantity', p.qty]].filter(([, v]) => v).map(([k, v]) => <li key={k}><span>{k}</span>{v}</li>)}
  </ul>
)

function Card({ p, onOpen }) {
  const buy = p.category === 'We buy'
  return (
    <article className="pc">
      <button className="pc-media" onClick={() => onOpen(p)} aria-label={`View ${p.name}`}>
        <Media p={p} />
        <span className={'badge ' + (buy ? 'buy' : 'sell')}>{buy ? 'We buy' : 'We deal in'}</span>
      </button>
      <div className="pc-body">
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        <Specs p={p} />
        <div className="pc-foot">
          <Price p={p} />
          <button className="btn sm" onClick={() => onOpen(p)}>{buy ? 'Sell to us' : 'Get a quote'}</button>
        </div>
      </div>
    </article>
  )
}

function Modal({ p, onClose }) {
  const buy = p.category === 'We buy'
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name}>
        <button className="x" onClick={onClose} aria-label="Close" autoFocus>✕</button>
        <div className="m-media"><Media p={p} /></div>
        <div className="m-body">
          <span className={'badge static ' + (buy ? 'buy' : 'sell')}>{buy ? 'We buy' : 'We deal in'}</span>
          <h2>{p.name}</h2>
          <p>{p.desc}</p>
          <Price p={p} />
          <Specs p={p} />
          <h3>{buy ? 'Offer your stock' : 'Ask for a quote'}</h3>
          <InquiryForm product={p.name} compact />
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const { db, loaded } = useApp()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const list = useMemo(() => db.products.filter(p => (cat === 'all' || p.category === cat) && (p.name + p.desc).toLowerCase().includes(q.toLowerCase())), [db.products, cat, q])
  const count = c => c === 'all' ? db.products.length : db.products.filter(p => p.category === c).length
  return (
    <>
      <section className="phead">
        <div className="wrap">
          <h1>Materials and waste</h1>
          <p className="lede">PP and BOPP plastic bought and sold in bulk for recycling. Open any item for details and to send a request.</p>
        </div>
      </section>
      <section className="wrap page tight">
        <div className="toolbar">
          <div className="chips" role="tablist" aria-label="Filter by type">
            {FILTERS.map(([v, l]) => <button key={v} role="tab" aria-selected={cat === v} className={cat === v ? 'on' : ''} onClick={() => setCat(v)}>{l} <em>{count(v)}</em></button>)}
          </div>
          <input className="search" type="search" placeholder="Search materials" aria-label="Search materials" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {!loaded ? <p className="muted">Loading…</p> : list.length === 0
          ? <p className="muted">Nothing matches. Clear the search or call <a href="tel:+919226045847">9226045847</a>.</p>
          : <div className="pcards">{list.map(p => <Card key={p.id} p={p} onOpen={setOpen} />)}</div>}
        <div className="callout">
          <div><h3>Can’t see your material?</h3><p>If you have a different PP or BOPP grade, tell us. We may still buy or supply it.</p></div>
          <Link className="btn" to="/contact">Contact us</Link>
        </div>
      </section>
      {open && <Modal p={open} onClose={() => setOpen(null)} />}
    </>
  )
}
