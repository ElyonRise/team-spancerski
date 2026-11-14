'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS: Record<string, { label: string; cls: string }> = {
  pendente: { label: 'AGUARDANDO ALUNO', cls: 'badge-purple' },
  enviada: { label: 'RECEBIDA', cls: 'badge-green' },
}

function whatsappLink(phone: string | null, nome: string, link: string) {
  let d = (phone || '').replace(/\D/g, '')
  if (!d) return null
  if (d.length <= 11) d = '55' + d // número BR sem DDI
  const msg = `Olá, ${nome.split(' ')[0]}! Preencha sua ficha de anamnese (leva uns 10 min, pode ser pelo celular) e envie suas fotos: ${link}`
  return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`
}

export default function AnamnesesProPage() {
  const [lista, setLista] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [enviarEmail, setEnviarEmail] = useState(true)
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)
  const [copiado, setCopiado] = useState<number | null>(null)

  const carregar = () =>
    fetch('/api/anamnese').then(r => r.json()).then(d => setLista(Array.isArray(d) ? d : [])).finally(() => setLoading(false))

  useEffect(() => {
    carregar()
    fetch('/api/clientes').then(r => r.json()).then(d => {
      if (!Array.isArray(d)) return
      setClientes(d)
      const pre = new URLSearchParams(window.location.search).get('client') // vindo de /pro/clientes
      if (pre) setClientId(pre)
    })
  }, [])

  const linkDe = (a: any) => `${window.location.origin}/anamnese/${a.token}`

  async function criar() {
    if (!clientId) return setMsg({ tipo: 'error', texto: 'Selecione um cliente.' })
    setCriando(true); setMsg(null)
    const r = await fetch('/api/anamnese', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: Number(clientId), send_email: enviarEmail }),
    })
    const d = await r.json()
    if (!r.ok) setMsg({ tipo: 'error', texto: d.error || 'Erro ao criar.' })
    else {
      try { await navigator.clipboard.writeText(d.link) } catch {}
      setMsg({
        tipo: 'success',
        texto: `Link criado e copiado${enviarEmail ? (d.emailEnviado ? ' — e-mail enviado ao aluno.' : ' — mas o e-mail falhou, envie o link manualmente.') : '.'}`,
      })
      setClientId(''); await carregar()
    }
    setCriando(false)
  }

  async function copiar(a: any) {
    await navigator.clipboard.writeText(linkDe(a))
    setCopiado(a.id); setTimeout(() => setCopiado(null), 1500)
  }

  async function reabrir(a: any) {
    if (!confirm(`Reabrir a ficha de ${a.client_name}? O mesmo link volta a funcionar e o aluno poderá reenviar (as respostas atuais serão substituídas).`)) return
    await fetch('/api/anamnese', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id, action: 'reabrir' }) })
    carregar()
  }

  async function excluir(a: any) {
    if (!confirm(`Excluir a anamnese de ${a.client_name}, incluindo as fotos? Irreversível.`)) return
    await fetch(`/api/anamnese?id=${a.id}`, { method: 'DELETE' })
    setLista(p => p.filter(x => x.id !== a.id))
  }

  const expirada = (a: any) => a.status === 'pendente' && new Date(a.expires_at) < new Date()

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div><h1>ANAMNESES</h1><p>Envie a ficha ao aluno e acompanhe o que foi preenchido</p></div>
        <Link href="/pro/clientes" className="btn btn-outline">← Clientes</Link>
      </div>

      <div className="card mb-24">
        <h3>Enviar nova anamnese</h3>
        <div className="form-row" style={{ alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cliente</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Selecione</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={criar} disabled={criando}>
            {criando ? 'Gerando…' : 'Gerar link'}
          </button>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={enviarEmail} onChange={e => setEnviarEmail(e.target.checked)} style={{ accentColor: 'var(--green)' }} />
          Enviar também por e-mail ao aluno
        </label>
        {msg && <div className={`alert alert-${msg.tipo} mt-16`} style={{ marginBottom: 0 }}>{msg.texto}</div>}
      </div>

      <div className="card">
        {loading ? <div className="text-center" style={{ padding: 32 }}><span className="loader" /></div>
          : lista.length === 0 ? <p className="text-muted text-center" style={{ padding: 32 }}>Nenhuma anamnese enviada ainda.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Aluno</th><th>Status</th><th>Fotos</th><th>Data</th><th>Ações</th></tr></thead>
                <tbody>
                  {lista.map(a => {
                    const wa = whatsappLink(a.client_phone, a.client_name, linkDe(a))
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.client_name}</td>
                        <td>
                          {expirada(a) ? <span className="badge badge-red">LINK EXPIRADO</span>
                            : <span className={`badge ${STATUS[a.status]?.cls}`}>{STATUS[a.status]?.label || a.status}</span>}
                        </td>
                        <td>{a.status === 'enviada' ? `${a.total_fotos}/3` : '—'}</td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(a.submitted_at || a.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {a.status === 'enviada' && <Link href={`/pro/anamneses/${a.id}`} className="btn btn-primary btn-sm">Ver</Link>}
                            {a.status === 'pendente' && (
                              <>
                                <button className="btn btn-outline btn-sm" onClick={() => copiar(a)}>{copiado === a.id ? 'Copiado ✓' : 'Copiar link'}</button>
                                {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">WhatsApp</a>}
                              </>
                            )}
                            {(a.status === 'enviada' || expirada(a)) && <button className="btn btn-outline btn-sm" onClick={() => reabrir(a)}>{a.status === 'enviada' ? 'Reabrir' : 'Renovar'}</button>}
                            <button className="btn btn-danger btn-sm" onClick={() => excluir(a)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
