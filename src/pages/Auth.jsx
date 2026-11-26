import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'

export default function Auth({ mode }) {
  const { user, login, register } = useApp()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const reg = mode === 'register'
  if (user) return <Navigate to="/dashboard" replace />
  const submit = e => {
    e.preventDefault()
    const r = reg ? register(f.name, f.email, f.password) : login(f.email, f.password)
    r ? setErr(r) : nav('/dashboard')
  }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (
    <section className="wrap page auth">
      <h1>{reg ? 'Create your account' : 'Log in'}</h1>
      <form className="form" onSubmit={submit}>
        {reg && <label>Full name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>}
        <label>Email<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password<input required type="password" value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} /></label>
        {err && <div className="note err" role="alert">{err}</div>}
        <button className="btn" type="submit">{reg ? 'Create account' : 'Log in'}</button>
      </form>
      <p className="muted">{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
      {!reg && (
        <div className="demo">
          <strong>Demo accounts</strong>
          <p>Super admin: superadmin@veliora.in / Super@123<br />Admin: admin@veliora.in / Admin@123<br />User: user@veliora.in / User@123</p>
        </div>
      )}
    </section>
  )
}
