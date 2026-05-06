'use client'

import { useState, useEffect } from 'react'

export default function FeedbacksProPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [respondendo, setRespondendo] = useState<number | null>(null)
  const [resposta, setResposta] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    fetch('/api/feedback').then(r => r.json()).then(d => { setFeedbacks(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function responder(id: number) {
    if (!resposta.trim()) return
    setEnviando(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_id: id, resposta })
    })
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, resposta, lido: true } : f))
    setRespondendo(null)
    setResposta('')
    setEnviando(false)
  }

  const naoLidos = feedbacks.filter(f => !f.lido).length

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loader" /></div>

  return (
    <>
      <div className="dash-header">
        <h1>FEEDBACKS DOS CLIENTES</h1>
        <p>{naoLidos > 0 ? `${naoLidos} novo(s) nao respondido(s)` : 'Todos os feedbacks respondidos'}</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
          <div style={{ color: 'var(--text2)' }}>Nenhum feedback recebido ainda.</div>
        </div>
      ) : feedbacks.map(f => (
        <div key={f.id} className="card" style={{ marginBottom: 12, borderColor: !f.lido ? 'rgba(0,255,65,0.4)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text1)', marginRight: 10 }}>{f.client_name}</span>
              <span style={{ fontSize: '0.72rem', background: 'var(--dark3)', padding: '2px 8px', borderRadius: 20, color: 'var(--green)', fontWeight: 700 }}>{f.tipo}</span>
              {!f.lido && <span style={{ marginLeft: 8, fontSize: '0.68rem', background: 'rgba(0,255,65,0.15)', color: 'var(--green)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>NOVO</span>}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{new Date(f.created_at).toLocaleDateString('pt-BR')}</span>
          </div>

          <div style={{ color: 'var(--text1)', fontSize: '0.9rem', marginBottom: 12, lineHeight: 1.6 }}>{f.mensagem}</div>

          {f.resposta ? (
            <div style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>SUA RESPOSTA</div>
              <div style={{ color: 'var(--text1)', fontSize: '0.85rem' }}>{f.resposta}</div>
            </div>
          ) : respondendo === f.id ? (
            <div>
              <textarea value={resposta} onChange={e => setResposta(e.target.value)} placeholder="Escreva sua resposta..."
                style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text1)', fontSize: '0.88rem', resize: 'vertical', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => responder(f.id)} disabled={enviando || !resposta.trim()}>
                  {enviando ? 'Enviando...' : 'Responder'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => { setRespondendo(null); setResposta('') }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => setRespondendo(f.id)}>Responder</button>
          )}
        </div>
      ))}
    </>
  )
}
