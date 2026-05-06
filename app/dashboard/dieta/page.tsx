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
    const lines = (selected.conteudo_raw || '').split('\n')
    let y = 50
    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    lines.forEach((line: string) => {
      if (line.trim()) {
        doc.text(line.trim(), 20, y)
        y += 6
        if (y > 270) { doc.addPage(); y = 20 }
      }
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

  const hasHtml = selected?.conteudo_html && selected.conteudo_html.trim().length > 10

  return (
    <>
      <style>{`
        .dieta-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 0.88rem;
        }
        .dieta-content th {
          background: var(--dark3);
          color: var(--green);
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid var(--border);
        }
        .dieta-content td {
          padding: 9px 12px;
          border: 1px solid var(--border);
          color: var(--text1);
          vertical-align: top;
          line-height: 1.5;
        }
        .dieta-content tr:nth-child(even) td {
          background: rgba(255,255,255,0.03);
        }
        .dieta-content p {
          margin: 10px 0;
          line-height: 1.7;
          color: var(--text1);
        }
        .dieta-content h1,
        .dieta-content h2,
        .dieta-content h3 {
          color: var(--green);
          margin: 24px 0 8px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .dieta-content strong {
          color: var(--text1);
          font-weight: 700;
        }
        .dieta-content ul,
        .dieta-content ol {
          padding-left: 20px;
          color: var(--text1);
        }
        .dieta-content li {
          margin: 4px 0;
          line-height: 1.6;
        }
      `}</style>

      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>MEU PROTOCOLO</h1>
          <p>Seu plano alimentar personalizado</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportPDF}>
          Baixar PDF
        </button>
      </div>

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

      {selected && (
        <div className="card">
          <h3 style={{ color: 'var(--green)', marginBottom: 20, fontSize: '1rem', letterSpacing: 1, fontWeight: 800 }}>
            {selected.nome}
          </h3>
          {hasHtml ? (
            <div
              className="dieta-content"
              dangerouslySetInnerHTML={{ __html: selected.conteudo_html }}
            />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.92rem', color: 'var(--text1)' }}>
              {selected.conteudo_raw || 'Sem conteudo disponivel.'}
            </div>
          )}
        </div>
      )}
    </>
  )
}
