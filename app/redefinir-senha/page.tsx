'use client'

import { useState, Suspense } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Logo } from '@/components/Logo'

import Link from 'next/link'



function ResetForm() {

  const params = useSearchParams()

  const router = useRouter()

  const token = params.get('token') || ''

  const [password, setPassword] = useState('')

  const [confirm, setConfirm] = useState('')

  const [loading, setLoading] = useState(false)

  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    if (password !== confirm) { setAlert({ type: 'error', msg: 'As senhas não coincidem.' }); return }

    if (password.length < 6) { setAlert({ type: 'error', msg: 'Senha mínimo 6 caracteres.' }); return }

    setLoading(true)

    const res = await fetch('/api/auth/reset-password', {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ token, newPassword: password })

    })

    const data = await res.json()

    if (res.ok) {

      setAlert({ type: 'success', msg: 'Senha redefinida com sucesso! Redirecionando...' })

      setTimeout(() => router.push('/login'), 2000)

    } else {

      setAlert({ type: 'error', msg: data.error || 'Token inválido.' })

    }

    setLoading(false)

  }



  return (

    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>

          <Link href="/"><Logo size={60} /></Link>

          <div style={{ marginTop: 10, color: 'var(--green)', fontWeight: 800, letterSpacing: 2 }}>REDEFINIR SENHA</div>

        </div>

        <div className="card">

          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          {!token ? (

            <p className="text-muted text-center">Token inválido. <Link href="/login" style={{ color: 'var(--green)' }}>Voltar ao login</Link></p>

          ) : (

            <form onSubmit={handleSubmit}>

              <div className="form-group"><label>Nova Senha</label>

                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />

              </div>

              <div className="form-group"><label>Confirmar Nova Senha</label>

                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />

              </div>

              <button type="submit" className="btn btn-primary btn-full mt-8" disabled={loading}>

                {loading ? <span className="loader" /> : 'CONFIRMAR NOVA SENHA'}

              </button>

            </form>

          )}

        </div>

      </div>

    </div>

  )

}



export default function ResetPage() {

  return <Suspense><ResetForm /></Suspense>

}
