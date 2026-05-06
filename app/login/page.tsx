'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'client' | 'pro' | 'forgot'>('client')
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
      setAlert({ type: 'error', msg: data.error || 'Credenciais inválidas.' })
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
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 24,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)' 
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/"><Logo size={65} /></Link>
          <div style={{ marginTop: 12, fontSize: '1.4rem', fontWeight: 800, letterSpacing: 2, color: 'var(--green)' }}>
            NUTRILENS PRO
          </div>
        </div>

        <div className="card">

          {/* Abas Corrigidas */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--dark3)', 
            borderRadius: 12, 
            padding: 6, 
            marginBottom: 28,
            gap: '6px'
          }}>
            <button 
              onClick={() => setTab('client')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === 'client' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              CLIENTE
            </button>
            <button 
              onClick={() => setTab('pro')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === 'pro' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              PROFISSIONAL
            </button>
            <button 
              onClick={() => setTab('forgot')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === 'forgot' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              ESQUECI SENHA
            </button>
          </div>

          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          {tab !== 'forgot' ? (
            <form onSubmit={handleLogin}>
              <h2 style={{ color: 'var(--green)', fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
                {tab === 'client' ? 'ÁREA DO CLIENTE' : 'ÁREA PROFISSIONAL'}
              </h2>
              <p className="text-muted text-sm mb-16">
                {tab === 'client' 
                  ? 'Acesse sua conta e acompanhe seu progresso' 
                  : 'Acesso exclusivo para profissionais'}
              </p>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>
                {loading ? <span className="loader" /> : 'ENTRAR'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot}>
              <h2 style={{ color: 'var(--green)', fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
                RECUPERAR SENHA
              </h2>
              <p className="text-muted text-sm mb-16">Informe seu email para receber o link de redefinição.</p>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>
                {loading ? <span className="loader" /> : 'ENVIAR LINK'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
