'use client'

import { useState, useEffect, useRef } from 'react'

export default function DietaPage() {
  const [dietas, setDietas] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set())
  const [fotoModal, setFotoModal] = useState(false)
  const [fotoLoading, setFotoLoading] = useState(false)
  const [fotoResult, setFotoResult] = useState<any>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const saved = localStorage.getItem('refeicoes_concluidas')
    if (saved) setConcluidas(new Set(JSON.parse(saved)))
  }, [])

  function toggleConcluida(key: string) {
    setConcluidas(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      localStorage.setItem('refeicoes_concluidas', JSON.stringify(Array.from(next)))
      return next
    })
  }

  async function exportPDF() {
    if (!selected || !contentRef.current) return
    setPdfLoading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0d0d',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const ratio = canvasWidth / canvasHeight
      const imgWidth = pdfWidth
      const imgHeight = imgWidth / ratio

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`dieta-protocolo-nutricional.pdf`)
    } catch (e) {
      console.error(e)
    }
    setPdfLoading(false)
  }

  async function analisarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoLoading(true)
    setFotoResult(null)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const res = await fetch('/api/refeicao-foto', { method: 'POST', body: formData })
      const data = await res.json()
      setFotoResult(data)
    } catch {
      setFotoResult({ erro: 'Nao foi possivel analisar a foto.' })
    }
    setFotoLoading(false)
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
        .hamburger-btn {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 1000;
          background: var(--dark2, #1a1a1a);
          border: 1px solid var(--border, #333);
          border-radius: 8px;
          width: 42px;
          height: 42px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 0;
        }
        .hamburger-btn span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--green, #00ff41);
          border-radius: 2px;
          transition: all 0.25s;
        }
        .hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger-btn.open span:nth-child(2) { opacity: 0; }
        .hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .side-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 240px;
          height: 100vh;
          background: var(--dark2, #1a1a1a);
          border-right: 1px solid var(--border, #333);
          z-index: 999;
          padding: 70px 20px 30px;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .side-menu.open { transform: translateX(0); }
        .side-menu a {
          display: block;
          padding: 11px 14px;
          border-radius: 8px;
          color: var(--text1, #e0e0e0);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 600;
          transition: background 0.15s, color 0.15s;
        }
        .side-menu a:hover { background: var(--dark3, #222); color: var(--green, #00ff41); }
        .side-menu a.active { background: rgba(0,255,65,0.08); color: var(--green, #00ff41); }
        .side-menu .menu-label {
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          color: var(--text2, #888);
          padding: 14px 14px 6px;
          text-transform: uppercase;
        }

        .menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 998;
          background: rgba(0,0,0,0.5);
        }
        .menu-overlay.open { display: block; }

        .dieta-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 0.88rem;
        }
        .dieta-content th {
          background: var(--dark3, #222);
          color: var(--green, #00ff41);
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid var(--border, #333);
        }
        .dieta-content td {
          padding: 9px 12px;
          border: 1px solid var(--border, #333);
          color: var(--text1, #e0e0e0);
          vertical-align: top;
          line-height: 1.5;
        }
        .dieta-content tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
        .dieta-content p { margin: 10px 0; line-height: 1.7; color: var(--text1, #e0e0e0); }
        .dieta-content h1, .dieta-content h2, .dieta-content h3 {
          color: var(--green, #00ff41);
          margin: 24px 0 8px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .dieta-content strong { color: var(--text1, #e0e0e0); font-weight: 700; }
        .dieta-content ul, .dieta-content ol { padding-left: 20px; color: var(--text1, #e0e0e0); }
        .dieta-content li { margin: 4px 0; line-height: 1.6; }

        .refeicao-block {
          border: 1px solid var(--border, #333);
          border-radius: 10px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .refeicao-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--dark3, #222);
        }
        .refeicao-header h4 {
          margin: 0;
          color: var(--green, #00ff41);
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .btn-concluir {
          font-size: 0.75rem;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid var(--green, #00ff41);
          background: transparent;
          color: var(--green, #00ff41);
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-concluir.done {
          background: var(--green, #00ff41);
          color: #000;
        }

        .foto-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .foto-modal {
          background: var(--dark2, #1a1a1a);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 440px;
        }
        .foto-modal h3 {
          color: var(--green, #00ff41);
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .foto-modal p { color: var(--text2, #888); font-size: 0.85rem; margin: 0 0 20px; }
        .upload-area {
          border: 2px dashed var(--border, #333);
          border-radius: 10px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .upload-area:hover { border-color: var(--green, #00ff41); }
        .upload-area span { color: var(--text2, #888); font-size: 0.88rem; }
        .macro-card {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 16px;
        }
        .macro-item {
          background: var(--dark3, #222);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .macro-item .val {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--green, #00ff41);
        }
        .macro-item .label {
          font-size: 0.72rem;
          color: var(--text2, #888);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }
      `}</style>

      {/* Hamburguer */}
      <button
        className={`hamburger-btn${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      {/* Overlay */}
      <div className={`menu-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Side Menu */}
      <nav className={`side-menu${menuOpen ? ' open' : ''}`}>
        <div className="menu-label">Menu</div>
        <a href="/dashboard" onClick={() => setMenuOpen(false)}>Inicio</a>
        <a href="/dashboard/dieta" className="active" onClick={() => setMenuOpen(false)}>Meu Protocolo</a>
        <a href="/dashboard/compras" onClick={() => setMenuOpen(false)}>Lista de Compras</a>
        <a href="/dashboard/progresso" onClick={() => setMenuOpen(false)}>Progresso</a>
        <a href="/dashboard/imc" onClick={() => setMenuOpen(false)}>IMC</a>
        <a href="/dashboard/motivacao" onClick={() => setMenuOpen(false)}>Motivacao</a>
        <a href="/dashboard/ia" onClick={() => setMenuOpen(false)}>Assistente IA</a>
        <a href="/dashboard/configuracoes" onClick={() => setMenuOpen(false)}>Configuracoes</a>
      </nav>

      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, paddingLeft: 60 }}>
        <div>
          <h1>MEU PROTOCOLO</h1>
          <p>Seu plano alimentar personalizado</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setFotoModal(true)}>
            Analisar Prato
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportPDF} disabled={pdfLoading}>
            {pdfLoading ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
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
        <div className="card" ref={contentRef}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              TEAM SPANCERSKI
            </div>
            <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 2 }}>
              {selected.nome}
            </div>
          </div>

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

      {/* Secao marcar refeicoes */}
      {selected && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: 'var(--text1)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
            MARCAR REFEICOES DE HOJE
          </h3>
          {['Cafe da Manha', 'Lanche da Manha', 'Almoco', 'Lanche da Tarde', 'Jantar', 'Ceia'].map(ref => {
            const key = `${selected.id}-${ref}-${new Date().toDateString()}`
            const done = concluidas.has(key)
            return (
              <div key={ref} className="refeicao-block">
                <div className="refeicao-header">
                  <h4>{ref}</h4>
                  <button
                    className={`btn-concluir${done ? ' done' : ''}`}
                    onClick={() => toggleConcluida(key)}
                  >
                    {done ? 'Concluido' : 'Marcar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Foto */}
      {fotoModal && (
        <div className="foto-modal-overlay" onClick={() => { setFotoModal(false); setFotoResult(null) }}>
          <div className="foto-modal" onClick={e => e.stopPropagation()}>
            <h3>ANALISAR PRATO</h3>
            <p>Tire uma foto do seu prato e receba a analise nutricional automatica.</p>

            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <span>Clique para enviar foto do prato</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={analisarFoto}
              />
            </div>

            {fotoLoading && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <span className="loader" />
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 12 }}>Analisando seu prato...</p>
              </div>
            )}

            {fotoResult && !fotoResult.erro && (
              <div>
                <div style={{ color: 'var(--text1)', fontSize: '0.88rem', marginBottom: 8 }}>
                  {fotoResult.descricao}
                </div>
                <div className="macro-card">
                  <div className="macro-item">
                    <div className="val">{fotoResult.kcal} kcal</div>
                    <div className="label">Calorias</div>
                  </div>
                  <div className="macro-item">
                    <div className="val">{fotoResult.proteina}g</div>
                    <div className="label">Proteina</div>
                  </div>
                  <div className="macro-item">
                    <div className="val">{fotoResult.carboidratos}g</div>
                    <div className="label">Carboidratos</div>
                  </div>
                  <div className="macro-item">
                    <div className="val">{fotoResult.gorduras}g</div>
                    <div className="label">Gorduras</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,255,65,0.06)', borderRadius: 8, border: '1px solid rgba(0,255,65,0.15)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>FEEDBACK</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text1)' }}>{fotoResult.feedback}</div>
                </div>
              </div>
            )}

            {fotoResult?.erro && (
              <div style={{ color: '#ff4444', fontSize: '0.85rem' }}>{fotoResult.erro}</div>
            )}

            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 20, width: '100%' }}
              onClick={() => { setFotoModal(false); setFotoResult(null) }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
