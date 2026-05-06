'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'client' | 'pro'>('client')
  const [showForgot, setShowForgot] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setAlert(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
      router.push(data.role === 'pro' ? '/pro' : '/dashboard')
    } else {
      setAlert({ type: 'error', msg: data.error || 'Credenciais invalidas.' })
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setAlert(null)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    })

    const data = await res.json()
    setAlert({ type: res.ok ? 'success' : 'error', msg: data.message || data.error })
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* CARD PRINCIPAL */}
        <div className="card">

          {/* TABS: CLIENTE / PROFISSIONAL */}
          <div style={{
            display: 'flex',
            background: 'var(--dark3)',
            borderRadius: 12,
            padding: 6,
            marginBottom: 28,
            gap: '6px'
          }}>
            <button
              onClick={() => { setTab('client'); setShowForgot(false); setAlert(null) }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'all 0.2s',
                background: tab === 'client' && !showForgot ? 'var(--green)' : 'transparent',
                color: tab === 'client' && !showForgot ? '#000' : 'rgba(255,255,255,0.45)',
              }}
            >
              CLIENTE
            </button>
            <button
              onClick={() => { setTab('pro'); setShowForgot(false); setAlert(null) }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'all 0.2s',
                background: tab === 'pro' && !showForgot ? 'var(--green)' : 'transparent',
                color: tab === 'pro' && !showForgot ? '#000' : 'rgba(255,255,255,0.45)',
              }}
            >
              PROFISSIONAL
            </button>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>
              {alert.msg}
            </div>
          )}

          {/* FORMULARIO LOGIN */}
          <form onSubmit={handleLogin}>
            <h2 style={{ color: 'var(--green)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
              {tab === 'client' ? 'AREA DO CLIENTE' : 'AREA PROFISSIONAL'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: 24 }}>
              {tab === 'client' ? 'Acesse sua conta e acompanhe seu progresso' : 'Acesso exclusivo para profissionais'}
            </p>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>
              {loading ? <span className="loader" /> : 'ENTRAR'}
            </button>
          </form>
        </div>

        {/* LINK ESQUECI SENHA - ABAIXO DO CARD */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => { setShowForgot(v => !v); setAlert(null) }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              letterSpacing: 0.5,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Esqueci minha senha
          </button>
        </div>

        {/* FORMULARIO RECUPERAR SENHA - APARECE ABAIXO */}
        {showForgot && (
          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ color: 'var(--green)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>
              RECUPERAR SENHA
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: 20 }}>
              Informe seu email para receber o link de redefinicao.
            </p>

            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>
                {loading ? <span className="loader" /> : 'ENVIAR LINK'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
