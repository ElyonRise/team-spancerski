'use client'

import { useState, useEffect } from 'react'

export default function RefeicoesPage() {
  const [tab, setTab] = useState<'foto' | 'historico' | 'feedback'>('foto')
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [historico, setHistorico] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [mensagem, setMensagem] = useState('')
  const [tipo, setTipo] = useState('geral')
  const [enviandoFeedback, setEnviandoFeedback] = useState(false)
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)

  useEffect(() => {
    if (tab === 'historico') {
      fetch('/api/refeicao-foto').then(r => r.json()).then(d => setHistorico(Array.isArray(d) ? d : []))
    }
    if (tab === 'feedback') {
      fetch('/api/feedback').then(r => r.json()).then(d => setFeedbacks(Array.isArray(d) ? d : []))
    }
  }, [tab])

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFoto(f)
    setResultado(null)
    setErro(null)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function analisar() {
    if (!foto) return
    setLoading(true)
    setErro(null)
    setResultado(null)
    const form = new FormData()
    form.append('foto', foto)
    const res = await fetch('/api/refeicao-foto', { method: 'POST', body: form })
    const data = await res.json()
    if (data.erro) { setErro(data.erro); setLoading(false); return }
    setResultado(data)
    setLoading(false)
  }

  async function enviarFeedback(e: React.FormEvent) {
    e.preventDefault()
    if (!mensagem.trim()) return
    setEnviandoFeedback(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem, tipo })
    })
    setMensagem('')
    setFeedbackEnviado(true)
    setEnviandoFeedback(false)
    setTimeout(() => setFeedbackEnviado(false), 3000)
    fetch('/api/feedback').then(r => r.json()).then(d => setFeedbacks(Array.isArray(d) ? d : []))
  }

  const macroBar = (val: number, max: number, color: string) => (
    <div style={{ height: 8, background: 'var(--dark3)', borderRadius: 4, margin: '4px 0 12px' }}>
      <div style={{ width: `${Math.min((val / max) * 100, 100)}%`, height: 8, background: color, borderRadius: 4, transition: 'width .5s' }} />
    </div>
  )

  return (
    <>
      <div className="dash-header">
        <h1>MINHAS REFEICOES</h1>
        <p>Analise nutricional e feedback com seu profissional</p>
      </div>

      <div className="tab-bar" style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--dark3)', borderRadius: 10, padding: 4, maxWidth: 700 }}>
        {([['foto', 'Analisar Foto'], ['historico', 'Historico'], ['feedback', 'Feedback']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
              background: tab === key ? 'var(--dark2)' : 'transparent',
              color: tab === key ? 'var(--green)' : 'var(--text2)',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'foto' && (
        <div className="card" style={{ maxWidth: 700 }}>
          <h3 style={{ color: 'var(--green)', marginBottom: 16 }}>ANALISE NUTRICIONAL POR FOTO</h3>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 20 }}>
            Tire uma foto do seu prato e a IA estima calorias e macronutrientes automaticamente.
          </p>

          <div onClick={() => document.getElementById('fotoInput')?.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer',
              background: preview ? 'transparent' : 'var(--dark3)', marginBottom: 16 }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 280, borderRadius: 10, maxWidth: '100%' }} />
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📷</div>
                <div style={{ color: 'var(--text1)', fontWeight: 600 }}>Clique para selecionar a foto</div>
                <div style={{ color: 'var(--text2)', fontSize: '0.78rem', marginTop: 6 }}>JPG, PNG ou WEBP</div>
              </>
            )}
            <input id="fotoInput" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFoto} />
          </div>

          {foto && !resultado && (
            <button className="btn btn-primary btn-full" onClick={analisar} disabled={loading} style={{ fontSize: '1rem', padding: 14 }}>
              {loading ? 'Analisando com IA...' : 'ANALISAR REFEICAO'}
            </button>
          )}

          {erro && <div className="alert alert-error" style={{ marginTop: 16 }}>{erro}</div>}

          {resultado && (
            <div style={{ marginTop: 20 }}>
              <div style={{ background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>ALIMENTOS IDENTIFICADOS</div>
                <div style={{ color: 'var(--text1)', fontSize: '0.9rem' }}>{resultado.descricao}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Calorias', v: `${resultado.kcal} kcal`, color: '#f97316' },
                  { l: 'Proteina', v: `${resultado.proteina}g`, color: '#22c55e' },
                  { l: 'Carboidratos', v: `${resultado.carboidratos}g`, color: '#3b82f6' },
                  { l: 'Gorduras', v: `${resultado.gorduras}g`, color: '#eab308' },
                ].map(m => (
                  <div key={m.l} style={{ background: 'var(--dark3)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.color }}>{m.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--dark3)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>FEEDBACK NUTRICIONAL</div>
                <div style={{ color: 'var(--text1)', fontSize: '0.88rem', lineHeight: 1.6 }}>{resultado.feedback}</div>
              </div>

              <button className="btn btn-outline btn-full" style={{ marginTop: 16 }}
                onClick={() => { setResultado(null); setFoto(null); setPreview(null) }}>
                Analisar Outra Foto
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'historico' && (
        <div style={{ maxWidth: 700 }}>
          {historico.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📷</div>
              <div style={{ color: 'var(--text2)' }}>Nenhuma refeicao analisada ainda.</div>
            </div>
          ) : historico.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text1)', fontSize: '0.9rem' }}>{r.descricao}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {[{ l: 'Kcal', v: r.kcal, c: '#f97316' }, { l: 'Prot', v: `${r.proteina}g`, c: '#22c55e' }, { l: 'Carb', v: `${r.carboidratos}g`, c: '#3b82f6' }, { l: 'Gord', v: `${r.gorduras}g`, c: '#eab308' }].map(m => (
                  <span key={m.l} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700, color: m.c }}>
                    {m.l}: {m.v}
                  </span>
                ))}
              </div>
              {r.feedback && <div style={{ fontSize: '0.82rem', color: 'var(--text2)', fontStyle: 'italic' }}>{r.feedback}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'feedback' && (
        <div style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ color: 'var(--green)', marginBottom: 16 }}>ENVIAR FEEDBACK AO PROFISSIONAL</h3>
            {feedbackEnviado && <div className="alert alert-success" style={{ marginBottom: 12 }}>Feedback enviado com sucesso!</div>}
            <form onSubmit={enviarFeedback}>
              <div className="form-group">
                <label>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="geral">Geral</option>
                  <option value="dieta">Sobre a Dieta</option>
                  <option value="duvida">Duvida</option>
                  <option value="sugestao">Sugestao</option>
                  <option value="resultado">Resultado Alcancado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mensagem *</label>
                <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Escreva seu feedback, duvida ou sugestao..." required
                  style={{ width: '100%', minHeight: 100, padding: 12, background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text1)', fontSize: '0.9rem', resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={enviandoFeedback || !mensagem.trim()}>
                {enviandoFeedback ? 'Enviando...' : 'ENVIAR FEEDBACK'}
              </button>
            </form>
          </div>

          {feedbacks.length > 0 && (
            <div>
              <h3 style={{ color: 'var(--text2)', fontSize: '0.8rem', letterSpacing: 1, marginBottom: 12 }}>SEUS FEEDBACKS ANTERIORES</h3>
              {feedbacks.map(f => (
                <div key={f.id} className="card" style={{ marginBottom: 10, borderColor: f.resposta ? 'rgba(0,255,65,0.3)' : 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', background: 'var(--dark3)', padding: '2px 8px', borderRadius: 20, color: 'var(--green)', fontWeight: 700 }}>{f.tipo}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{new Date(f.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{ color: 'var(--text1)', fontSize: '0.88rem', marginBottom: f.resposta ? 10 : 0 }}>{f.mensagem}</div>
                  {f.resposta && (
                    <div style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>RESPOSTA DO PROFISSIONAL</div>
                      <div style={{ color: 'var(--text1)', fontSize: '0.85rem' }}>{f.resposta}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
