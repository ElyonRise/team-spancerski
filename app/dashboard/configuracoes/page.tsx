'use client'

import { useState, useEffect } from 'react'



export default function ConfiguracoesPage() {

  const [perfil, setPerfil] = useState({ name: '', phone: '', goal: '' })

  const [senhas, setSenhas] = useState({ old: '', new: '', confirm: '' })

  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)

  const [loading, setLoading] = useState(false)



  useEffect(() => {

    fetch('/api/perfil').then(r => r.json()).then(d => setPerfil({ name: d.name || '', phone: d.phone || '', goal: d.goal || '' }))

  }, [])



  function showAlert(type: string, msg: string) {

    setAlert({ type, msg })

    setTimeout(() => setAlert(null), 4000)

  }



  async function savePerfil(e: React.FormEvent) {

    e.preventDefault(); setLoading(true)

    const res = await fetch('/api/perfil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(perfil) })

    res.ok ? showAlert('success', 'Perfil salvo!') : showAlert('error', 'Erro ao salvar.')

    setLoading(false)

  }



  async function changePass(e: React.FormEvent) {

    e.preventDefault()

    if (senhas.new !== senhas.confirm) { showAlert('error', 'As senhas não coincidem.'); return }

    if (senhas.new.length < 6) { showAlert('error', 'Mínimo 6 caracteres.'); return }

    setLoading(true)

    const res = await fetch('/api/perfil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword: senhas.old, newPassword: senhas.new }) })

    const d = await res.json()

    res.ok ? showAlert('success', d.message) : showAlert('error', d.error)

    if (res.ok) setSenhas({ old: '', new: '', confirm: '' })

    setLoading(false)

  }



  return (

    <>

      <div className="dash-header"><h1>⚙️ CONFIGURAÇÕES</h1></div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="grid-2">

        <div className="card">

          <h3>👤 PERFIL</h3>

          <form onSubmit={savePerfil}>

            <div className="form-group"><label>Nome</label><input value={perfil.name} onChange={e => setPerfil(p => ({ ...p, name: e.target.value }))} /></div>

            <div className="form-group"><label>Telefone</label><input value={perfil.phone} onChange={e => setPerfil(p => ({ ...p, phone: e.target.value }))} placeholder="(47) 99999-9999" /></div>

            <div className="form-group"><label>Objetivo</label>

              <select value={perfil.goal} onChange={e => setPerfil(p => ({ ...p, goal: e.target.value }))}>

                <option>Perda de peso</option><option>Ganho de massa</option><option>Manutenção</option><option>Condicionamento</option>

              </select>

            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>Salvar Perfil</button>

          </form>

        </div>

        <div className="card">

          <h3>🔒 SEGURANÇA</h3>

          <form onSubmit={changePass}>

            <div className="form-group"><label>Senha Atual</label><input type="password" value={senhas.old} onChange={e => setSenhas(s => ({ ...s, old: e.target.value }))} placeholder="••••••••" /></div>

            <div className="form-group"><label>Nova Senha</label><input type="password" value={senhas.new} onChange={e => setSenhas(s => ({ ...s, new: e.target.value }))} placeholder="••••••••" /></div>

            <div className="form-group"><label>Confirmar Nova Senha</label><input type="password" value={senhas.confirm} onChange={e => setSenhas(s => ({ ...s, confirm: e.target.value }))} placeholder="••••••••" /></div>

            <button type="submit" className="btn btn-outline btn-full" disabled={loading}>Alterar Senha</button>

          </form>

        </div>

      </div>

    </>

  )

}
