import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'

export function Nav() {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const close = () => setOpen(false)
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="brand" onClick={close} aria-label="Veliora Polymars home">
          <img src="/logo-mark.png" alt="" width="40" height="29" /><span>Veliora</span>
        </Link>
        <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
        <nav className={'links' + (open ? ' open' : '')}>
          {[['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/contact', 'Contact']].map(([to, t]) =>
            <NavLink key={to} to={to} end={to === '/'} onClick={close}>{t}</NavLink>)}
          {user ? <>
            <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
            <button className="btn ghost sm" onClick={() => { logout(); close(); nav('/') }}>Log out</button>
          </> : <>
            <NavLink to="/login" onClick={close}>Log in</NavLink>
            <Link className="btn sm" to="/register" onClick={close}>Create account</Link>
          </>}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div><img src="/logo-lockup.png" alt="Veliora Polymars" className="lockup" width="220" /></div>
        <div>
          <h4>Visit or call</h4>
          <p>Palda<br />Soham Sutar, Proprietor<br /><a href="tel:+919226045847">9226045847</a><br /><a href="mailto:veliora740@gmail.com">veliora740@gmail.com</a></p>
        </div>
        <div>
          <h4>Explore</h4>
          <p><Link to="/products">Products</Link><br /><Link to="/about">How we recycle</Link><br /><Link to="/contact">Request a quote</Link></p>
        </div>
      </div>
      <div className="wrap legal">© {new Date().getFullYear()} Veliora Polymars. Reduce, recycle, redefine.</div>
    </footer>
  )
}
