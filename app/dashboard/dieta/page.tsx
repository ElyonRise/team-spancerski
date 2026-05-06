'use client'

import { useState, useEffect } from 'react'

export default function DietaPage() {
  const [dietas, setDietas] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dieta')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setDietas(list)
        if (list[0]) setSelected(list[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
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

    const lines = (selected.conteudo_raw || '').split('\n')
    let y = 50
    lines.forEach((line: string) => {
      doc.text(line, 20, y)
      y += 6
      if (y > 270) { doc.addPage(); y = 20 }
    })

    doc.save(`dieta-${selected.nome.replace(/\s/g, '-').toLowerCase()}.pdf`)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <span className="loader" />
    </div>
  )

  if (!dietas.length) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <h2 style={{ color: 'var(--text2)' }}>Nenhuma dieta enviada ainda</h2>
      <p className="text-muted mt-8">Aguarde seu personal trainer enviar seu protocolo.</p>
    </div>
  )

  return (
    <>
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>MEU PROTOCOLO</h1>
          <p>Seu plano alimentar personalizado</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportPDF}>
          Baixar PDF
        </button>
      </div>

      {/* Seletor de dietas */}
      {dietas.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {dietas.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`btn btn-sm ${selected?.id === d.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {d.nome}
            </button>
          ))}
        </div>
      )}

      {/* Conteudo da dieta */}
      {selected && (
        <div className="card" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text1)' }}>
          <h3 style={{ color: 'var(--green)', marginBottom: 16, fontSize: '1rem', letterSpacing: 1 }}>
            {selected.nome}
          </h3>
          <div style={{ color: 'var(--text1)' }}>
            {selected.conteudo_raw || 'Sem conteudo disponivel.'}
          </div>
        </div>
      )}
    </>
  )
}
