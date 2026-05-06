'use client'

import { useState } from 'react'



const QUICK = ['Posso substituir frango por atum?', 'O que comer antes de dormir?', 'Quantos litros de água devo beber?', 'Qual o melhor horário para comer carboidrato?']



export default function IAPage() {

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([

    { role: 'assistant', content: 'Olá! Sou o NutriBot 🥗, seu assistente especializado em nutrição da Team Spancerski. Como posso te ajudar hoje?' }

  ])

  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(false)



  async function send(text?: string) {

    const msg = text || input.trim()

    if (!msg || loading) return

    const userMsg = { role: 'user', content: msg }

    const newMsgs = [...messages, userMsg]

    setMessages(newMsgs)

    setInput('')

    setLoading(true)

    const res = await fetch('/api/ia', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ messages: newMsgs.filter(m => m.role !== 'system'), type: 'chat' })

    })

    const data = await res.json()

    setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Erro ao obter resposta.' }])

    setLoading(false)

  }



  return (

    <>

      <div className="dash-header"><h1>🤖 ASSISTENTE IA</h1><p>Especialista em nutrição disponível 24/7</p></div>

      <div className="card mb-16" style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)' }}>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

          <div style={{ fontSize: '1.8rem' }}>🥗</div>

          <div>

            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>NUTRIBOT — Especialista em Nutrição</div>

            <p className="text-muted text-sm">Tire dúvidas sobre alimentação, macros, substitutos, hidratação e mais. Foco exclusivo em nutrição.</p>

          </div>

        </div>

      </div>



      <div className="chat-box" id="chatBox">

        {messages.map((m, i) => (

          <div key={i} className={`chat-msg ${m.role}`}>

            {m.role === 'assistant' && <div className="chat-ai-label">🥗 NUTRIBOT</div>}

            {m.content}

          </div>

        ))}

        {loading && (

          <div className="chat-msg ai">

            <div className="chat-ai-label">🥗 NUTRIBOT</div>

            <span>Digitando</span>

            <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6 }}>

              {[0,1,2].map(i => <span key={i} style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: `bounce 1.2s infinite ${i*.2}s` }} />)}

            </span>

          </div>

        )}

      </div>



      <div className="chat-input-row">

        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}

          onKeyDown={e => e.key === 'Enter' && send()} placeholder="Pergunte sobre nutrição..." />

        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}>Enviar</button>

      </div>



      <div style={{ marginTop: 16 }}>

        <p className="text-muted text-sm mb-8">💡 Perguntas frequentes:</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

          {QUICK.map(q => (

            <button key={q} onClick={() => send(q)} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--dark3)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.8rem' }}>

              {q}

            </button>

          ))}

        </div>

      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>

    </>

  )

}
