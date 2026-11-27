import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Provider, isDemo } from './store.jsx'
import { Nav, Footer } from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Products from './pages/Products.jsx'
import Contact from './pages/Contact.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Shell() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      {isDemo && <div className="demobar">Preview version: sample data, saved only in this browser. Quote requests are not sent to anyone yet.</div>}
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<section className="wrap page"><h1>Page not found</h1><p>That page doesn’t exist. <Link to="/">Go to the home page</Link>.</p></section>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
export default function App() { return <Provider><Shell /></Provider> }
