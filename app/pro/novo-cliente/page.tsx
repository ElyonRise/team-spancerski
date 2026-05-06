'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoClientePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: 'Perda de peso', weight_start: '', height_cm: '' })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)
  const [success, setSuccess] = useState<any>(null)

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setAlert(null)
    const res = await fetch('/api/clientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, weight_start: +form.weight_start || null, height_cm: +form.height_cm || null })
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess({ email: form.email, pass: data.tempPass })
    } else {
      setAlert({ type: 'error', msg: data.error || 'Erro ao cadastrar.' })
    }
    setLoading(false)
  }

  if (success) return (
    <>
      <div className="dash-header"><h1>CLIENTE CADASTRADO!</h1></div>
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          Cliente criado e email com credenciais enviado!
        </div>
        <div style={{ background: 'var(--dark3)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: 12, letterSpacing: 1 }}>CREDENCIAIS DE ACESSO</p>
          <p style={{ marginBottom: 6 }}><span style={{ color: 'var(--text2)' }}>Login: </span><strong>{success.email}</strong></p>
          <p><span style={{ color: 'var(--text2)' }}>Senha temporaria: </span><strong style={{ color: 'var(--green)', fontSize: '1.1rem' }}>{success.pass}</strong></p>
        </div>
        <p className="text-muted text-sm" style={{ marginTop: 12 }}>O cliente devera redefinir a senha apos o primeiro acesso.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button className="btn btn-primary" onClick={() => router.push('/pro/clientes')}>Ver Clientes</button>
          <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm({ name:'',email:'',phone:'',goal:'Perda de peso',weight_start:'',height_cm:'' }) }}>+ Novo Cliente</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="dash-header"><h1>NOVO CLIENTE</h1><p>Cadastre e envie o acesso automaticamente por email</p></div>
      <div className="card" style={{ maxWidth: 520 }}>
        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          Apos cadastro, o email com login e senha temporaria sera enviado automaticamente ao cliente.
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label>Nome Completo *</label><input value={form.name} onChange={set('name')} placeholder="Nome do cliente" required /></div>
          <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={set('email')} placeholder="email@cliente.com" required /></div>
          <div className="form-group"><label>Telefone</label><input value={form.phone} onChange={set('phone')} placeholder="(47) 99999-9999" /></div>
          <div className="form-row">
            <div className="form-group"><label>Peso Inicial (kg)</label><input type="number" value={form.weight_start} onChange={set('weight_start')} placeholder="70" step="0.1" /></div>
            <div className="form-group"><label>Altura (cm)</label><input type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="170" /></div>
          </div>
          <div className="form-group"><label>Objetivo</label>
            <select value={form.goal} onChange={set('goal')}>
              <option>Perda de peso</option><option>Ganho de massa</option><option>Manutencao</option><option>Condicionamento</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="loader" /> : 'Cadastrar e Enviar Acesso'}
          </button>
        </form>
      </div>
    </>
  )
}
