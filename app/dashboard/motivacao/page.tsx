'use client'

import { useState, useEffect } from 'react'



export default function MotivacaoPage() {

  const [streak, setStreak] = useState<string[]>([])

  const [quote, setQuote] = useState<{ frase: string; autor: string } | null>(null)

  const [loading, setLoading] = useState(false)



  useEffect(() => {

    fetch('/api/motivacao').then(r => r.json()).then(setStreak)

    loadQuote()

  }, [])



  async function loadQuote() {

    setLoading(true)

    const res = await fetch('/api/ia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'quote' }) })

    const d = await res.json()

    setQuote(d)

    setLoading(false)

  }



  async function markToday() {

    await fetch('/api/motivacao', { method: 'POST' })

    const today = new Date().toISOString().split('T')[0]

    if (!streak.includes(today)) setStreak(prev => [today, ...prev])

  }



  const today = new Date().toISOString().split('T')[0]

  const isDoneToday = streak.includes(today)

  const totalStreak = streak.length



  // Últimos 7 dias

  const last7 = Array.from({ length: 7 }, (_, i) => {

    const d = new Date(); d.setDate(d.getDate() - (6 - i))

    return d.toISOString().split('T')[0]

  })



  return (

    <>

      <div className="dash-header"><h1>🔥 ZONA DE MOTIVAÇÃO</h1><p>Mantenha sua constância</p></div>



      <div className="motiv-card">

        {quote ? (

          <>

            <div className="motiv-quote">"{quote.frase}"</div>

            <div className="motiv-author">— {quote.autor?.toUpperCase()}</div>

          </>

        ) : <div className="motiv-quote">Carregando frase do dia...</div>}

        <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={loadQuote} disabled={loading}>

          {loading ? <span className="loader" /> : '🔄 Nova frase'}

        </button>

      </div>



      <div className="grid-2">

        <div className="card">

          <h3>📅 STREAK SEMANAL</h3>

          <div className="streak-display">

            {last7.map(d => (

              <div key={d} className={`streak-day ${streak.includes(d) ? 'done' : ''} ${d === today ? 'today' : ''}`}>

                {new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)}

              </div>

            ))}

          </div>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)' }}>{totalStreak}</div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text2)', letterSpacing: 2 }}>DIAS REGISTRADOS</div>

          </div>

          <button className="btn btn-primary btn-full" onClick={markToday} disabled={isDoneToday}>

            {isDoneToday ? '✅ Hoje já marcado!' : '✅ Marcar hoje como concluído'}

          </button>

        </div>



        <div className="card">

          <h3>🏆 SUAS CONQUISTAS</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {[

              { label: 'Total de dias registrados', val: totalStreak, icon: '📅' },

              { label: 'Dias esta semana', val: last7.filter(d => streak.includes(d)).length, icon: '⚡' },

              { label: 'Status hoje', val: isDoneToday ? 'Concluído ✓' : 'Pendente', icon: '🎯' },

            ].map((c: any) => (

              <div key={c.label} style={{ background: 'var(--dark3)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <span style={{ fontSize: '0.9rem' }}>{c.icon} {c.label}</span>

                <span style={{ fontWeight: 700, color: 'var(--green)' }}>{c.val}</span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </>

  )

}
