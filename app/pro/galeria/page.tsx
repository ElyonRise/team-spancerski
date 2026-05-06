'use client'

import { useState, useEffect } from 'react'

export default function GaleriaProPage() {
  const [fotos, setFotos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [tipo, setTipo] = useState('before')
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/galeria').then(r => r.json()).then(setFotos)
    fetch('/api/clientes').then(r => r.json()).then(setClientes)
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !clientId) { alert('Selecione um cliente primeiro.'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const res = await fetch('/api/galeria', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: base64, tipo, client_id: clientId })
      })
      const d = await res.json()
      if (d.ok) {
        const client = clientes.find(c => c.id == clientId)
        setFotos(prev => [{ id: d.id, url: base64, tipo, client_name: client?.name }, ...prev])
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const filtered = filter ? fotos.filter(f => f.tipo === filter) : fotos
  const tipoLabel: Record<string, string> = { before: 'ANTES', after: 'DEPOIS', progress: 'PROGRESSO' }

  return (
    <>
      <div className="dash-header"><h1>GALERIA GERAL</h1><p>Transformacoes de todos os clientes</p></div>
      <div className="card mb-24">
        <h3>UPLOAD</h3>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group"><label>Cliente</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Selecione</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="before">Antes</option><option value="after">Depois</option><option value="progress">Progresso</option>
            </select>
          </div>
        </div>
        <div className="upload-zone" onClick={() => document.getElementById('proUpload')?.click()}>
          <input type="file" id="proUpload" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>{uploading ? 'Enviando...' : 'Clique para selecionar'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'before', 'progress', 'after'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-outline'}`}>
            {t === '' ? 'Todas' : tipoLabel[t]}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
            <p>Nenhuma foto encontrada.</p>
          </div>
        ) : (
          filtered.map(f => (
            <div key={f.id} className="gallery-item">
              <img src={f.url} alt={f.tipo} />
              <div className="gallery-label">
                <span>{tipoLabel[f.tipo] || f.tipo}</span>
                <span style={{ color: 'var(--green)' }}>{f.client_name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
