'use client'

import { useState } from 'react'



export default function ProConfigPage() {

  const [old_, setOld] = useState('')

  const [new_, setNew] = useState('')

  const [confirm, setConfirm] = useState('')

  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)

  const [loading, setLoading] = useState(false)



  async function changePass(e: React.FormEvent) {

    e.preventDefault()

    if (new_ !== confirm) { setAlert({ type: 'error', msg: 'As senhas não coincidem.' }); return }

    setLoading(true)

    const res = await fetch('/api/perfil', {

      method: 'PATCH', headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ oldPassword: old_, newPassword: new_ })

    })

    const d = await res.json()

    setAlert({ type: res.ok ? 'success' : 'error', msg: d.message || d.error })

    if (res.ok) { setOld(''); setNew(''); setConfirm('') }

    setLoading(false)

  }



  return (

    <>

      <div className="dash-header"><h1>⚙️ CONFIGURAÇÕES</h1></div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="card" style={{ maxWidth: 480 }}>

        <h3>🔒 SEGURANÇA</h3>

        <form onSubmit={changePass}>

          <div className="form-group"><label>Senha Atual</label><input type="password" value={old_} onChange={e => setOld(e.target.value)} placeholder="••••••••" required /></div>

          <div className="form-group"><label>Nova Senha</label><input type="password" value={new_} onChange={e => setNew(e.target.value)} placeholder="••••••••" required minLength={6} /></div>

          <div className="form-group"><label>Confirmar Nova Senha</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required /></div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>

            {loading ? <span className="loader" /> : 'Alterar Senha'}

          </button>

        </form>

      </div>

    </>

  )

}
