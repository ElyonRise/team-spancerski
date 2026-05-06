'use client'

import { useState, useEffect } from 'react'



declare const window: any



export default function DietaPage() {

  const [dietas, setDietas] = useState<any[]>([])

  const [selected, setSelected] = useState<any>(null)

  const [loading, setLoading] = useState(true)



  useEffect(() => {

    fetch('/api/dieta').then(r => r.json()).then(data => {

      setDietas(data)

      if (data[0]) setSelected(data[0])

      setLoading(false)

    })

  }, [])



  async function exportPDF() {

    if (!selected) return

    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()

    doc.setFontSize(18)

    doc.setTextColor(0, 255, 65)

    doc.text('TEAM SPANCERSKI', 20, 20)

    doc.setFontSize(14)

    doc.setTextColor(200, 200, 200)

    doc.text(selected.nome, 20, 32)

    doc.setFontSize(10)

    doc.setTextColor(150, 150, 150)

    doc.text(`Kcal: ${selected.kcal} | Proteína: ${selected.proteina}g | Carbs: ${selected.carboidratos}g | Gorduras: ${selected.gorduras}g`, 20, 42)

    let y = 56

    const protocolo = typeof selected.protocolo === 'string' ? JSON.parse(selected.protocolo) : selected.protocolo

    protocolo?.forEach((meal: any) => {

      doc.setFontSize(12)

      doc.setTextColor(0, 255, 65)

      doc.text(`${meal.horario} — ${meal.nome} (${meal.kcal_refeicao} kcal)`, 20, y)

      y += 8

      doc.setFontSize(10)

      doc.setTextColor(200, 200, 200)

      meal.alimentos?.forEach((a: any) => {

        doc.text(`  • ${a.item} — ${a.quantidade}`, 20, y)

        y += 6

        if (y > 270) { doc.addPage(); y = 20 }

      })

      y += 4

    })

    doc.save(`dieta-${selected.nome.replace(/\s/g, '-').toLowerCase()}.pdf`)

  }



  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loader" /></div>



  if (!dietas.length) return (

    <div style={{ textAlign: 'center', padding: 60 }}>

      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🥗</div>

      <h2 style={{ color: 'var(--text2)' }}>Nenhuma dieta enviada ainda</h2>

      <p className="text-muted mt-8">Aguarde seu personal trainer enviar seu protocolo.</p>

    </div>

  )



  const protocolo = selected ? (typeof selected.protocolo === 'string' ? JSON.parse(selected.protocolo) : selected.protocolo) : []



  return (

    <>

      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>

        <div><h1>🥗 MEU PROTOCOLO</h1><p>Seu plano alimentar personalizado</p></div>

        <button className="btn btn-primary btn-sm" onClick={exportPDF}>⬇️ Baixar PDF</button>

      </div>



      {/* Seletor de dietas */}

      {dietas.length > 1 && (

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>

          {dietas.map(d => (

            <button key={d.id} onClick={() => setSelected(d)}

              className={`btn btn-sm ${selected?.id === d.id ? 'btn-primary' : 'btn-outline'}`}>

              {d.nome}

            </button>

          ))}

        </div>

      )}



      {/* Macros */}

      {selected && (

        <div className="card mb-16">

          <h3>📈 MACROS DIÁRIOS</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>

            {[

              { label: 'KCAL', val: selected.kcal, color: 'var(--green)' },

              { label: 'PROTEÍNA', val: `${selected.proteina}g`, color: 'var(--purple)' },

              { label: 'CARBOS', val: `${selected.carboidratos}g`, color: '#fbbf24' },

              { label: 'GORDURAS', val: `${selected.gorduras}g`, color: '#f87171' },

            ].map(m => (

              <div key={m.label} style={{ textAlign: 'center', background: 'var(--dark3)', borderRadius: 10, padding: 14 }}>

                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: m.color }}>{m.val || '—'}</div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text2)', letterSpacing: 1 }}>{m.label}</div>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Refeições */}

      {protocolo?.map((meal: any, i: number) => (

        <div key={i} className="meal-card">

          <div className="meal-header">

            <div><div className="meal-time">{meal.horario}</div><div className="meal-name">{meal.nome}</div></div>

            <span className="meal-kcal">{meal.kcal_refeicao} kcal</span>

          </div>

          {meal.alimentos?.map((a: any, j: number) => (

            <div key={j} className="food-item">

              <span>{a.item}</span>

              <span className="food-qty">{a.quantidade}</span>

            </div>

          ))}

        </div>

      ))}

    </>

  )

}
