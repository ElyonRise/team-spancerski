'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

import { Logo } from '@/components/Logo'



export default function LoginPage() {

  const router = useRouter()

  const [tab, setTab] = useState<'login' | 'forgot'>('login')

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

    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,

      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)' }}>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* LOGO */}

        <div style={{ textAlign: 'center', marginBottom: 32 }}>

          <Link href="/"><Logo size={70} /></Link>

          <div style={{ marginTop: 12, fontSize: '1rem', fontWeight: 800, letterSpacing: 3, color: 'var(--green)' }}>SPANCERSKI</div>

          <div style={{ fontSize: '0.65rem', color: 'var(--purple)', letterSpacing: 4 }}>TEAM</div>

        </div>



        <div className="card">

          {/* TABS */}

          <div style={{ display: 'flex', background: 'var(--dark3)', borderRadius: 10, padding: 4, marginBottom: 24 }}>

            {(['login', 'forgot'] as const).map(t => (

              <button key={t} onClick={() => setTab(t)} style={{

                flex: 1, padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',

                background: tab === t ? 'var(--green)' : 'transparent',

                color: tab === t ? '#000' : 'var(--text2)',

                fontWeight: 700, fontSize: '0.82rem', transition: 'all .2s'

              }}>

                {t === 'login' ? 'Entrar' : 'Esqueci a senha'}

              </button>

            ))}

          </div>



          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}



          {tab === 'login' ? (

            <form onSubmit={handleLogin}>

              <h2 style={{ color: 'var(--green)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>BEM-VINDO</h2>

              <p className="text-muted text-sm mb-16">Acesse sua conta Team Spancerski</p>

              <div className="form-group">

                <label>Email</label>

                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />

              </div>

              <div className="form-group">

                <label>Senha</label>

                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

              </div>

              <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>

                {loading ? <span className="loader" /> : 'ENTRAR →'}

              </button>

            </form>

          ) : (

            <form onSubmit={handleForgot}>

              <h2 style={{ color: 'var(--green)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>RECUPERAR SENHA</h2>

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
