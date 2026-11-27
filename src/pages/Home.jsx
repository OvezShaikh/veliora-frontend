import { Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { useApp } from '../store.jsx'
import { Media } from '../components/ProductArt.jsx'

const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

const loop = [
  ['Reduce', 'We buy factory waste PP bags, jumbo bags and raffia bags, so they go back into use instead of landfill.'],
  ['Recycle', 'PP white, PP yellow, BOPP colour and BOPP mix are sorted and supplied for recycling.'],
  ['Redefine', 'Waste plastic treated as a dependable raw material, not a leftover.'],
]

export default function Home() {
  const { db } = useApp()
  return (
    <>
      <section className="hero">
        <div className="hero-3d"><ErrorBoundary><Suspense fallback={null}><Hero3D /></Suspense></ErrorBoundary></div>
        <div className="wrap hero-copy">
          <img src="/logo-mark.png" alt="Veliora mark" className="mark" width="132" height="96" />
          <h1>Veliora Polymars</h1>
          <p className="lede">We deal in PP and BOPP plastic for recycling, and buy factory waste PP bags, jumbo bags and raffia bags in bulk.</p>
          <div className="cta">
            <Link className="btn" to="/contact">Request a quote</Link>
            <Link className="btn ghost" to="/products">See what we supply</Link>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <h2>One loop, three promises</h2>
        <div className="loop">
          {loop.map(([t, d]) => <article key={t}><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          {[['We deal in', 'Materials we deal in', 'Get a quote'], ['We buy', 'Waste we buy', 'Sell to us']].map(([cat, t, cta]) => (
            <div key={cat} className="hgroup">
              <div className="hhead"><h2>{t}</h2><Link className="btn ghost sm" to="/products">{cta}</Link></div>
              <div className="tiles">
                {db.products.filter(p => p.category === cat).slice(0, 4).map(p => (
                  <Link key={p.id} to="/products" className="tile"><Media p={p} /><span className="cap">{p.name}</span></Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap sec split">
        <div>
          <h2>Have factory waste to sell, or need PP or BOPP material?</h2>
          <p>Tell us the material, the quantity and where you are. Soham Sutar replies personally, usually within one working day.</p>
          <p className="muted">Or call <a href="tel:+919226045847">9226045847</a>.</p>
        </div>
        <Link className="btn" to="/contact">Request a quote</Link>
      </section>
    </>
  )
}
