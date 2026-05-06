'use client'

import { useState, useEffect } from 'react'



export default function ProgressoPage() {

  const [fotos, setFotos] = useState<any[]>([])

  const [tipo, setTipo] = useState('progress')

  const [data, setData] = useState(new Date().toISOString().split('T')[0])

  const [uploading, setUploading] = useState(false)



  useEffect(() => {

    fetch('/api/galeria').then(r => r.json()).then(setFotos)

  }, [])



  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0]

    if (!file) return

    setUploading(true)

    const reader = new FileReader()

    reader.onload = async (ev) => {

      const base64 = ev.target?.result as string

      const res = await fetch('/api/galeria', {

        method: 'POST', headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ url: base64, tipo, data_foto: data })

      })

      const d = await res.json()

      if (d.ok) setFotos(prev => [{ id: d.id, url: base64, tipo, data_foto: data }, ...prev])

      setUploading(false)

    }

    reader.readAsDataURL(file)

  }



  async function deleteFoto(id: number) {

    await fetch(`/api/galeria?id=${id}`, { method: 'DELETE' })

    setFotos(prev => prev.filter(f => f.id !== id))

  }



  const tipoLabel: Record<string, string> = { before: '🔴 ANTES', after: '🟢 DEPOIS', progress: '🔵 PROGRESSO' }



  return (

    <>

      <div className="dash-header"><h1>📸 MEU PROGRESSO</h1><p>Registre sua transformação</p></div>



      <div className="card mb-24">

        <h3>📤 NOVA FOTO</h3>

        <div className="form-row" style={{ marginBottom: 16 }}>

          <div className="form-group">

            <label>Tipo</label>

            <select value={tipo} onChange={e => setTipo(e.target.value)}>

              <option value="before">Antes</option>

              <option value="progress">Progresso</option>

              <option value="after">Depois</option>

            </select>

          </div>

          <div className="form-group">

            <label>Data</label>

            <input type="date" value={data} onChange={e => setData(e.target.value)} />

          </div>

        </div>

        <div className="upload-zone" onClick={() => document.getElementById('photoInput')?.click()}>

          <input type="file" id="photoInput" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

          <div style={{ fontSize: '2.5rem' }}>{uploading ? '⏳' : '📷'}</div>

          <p style={{ marginTop: 8, color: 'var(--text2)' }}>{uploading ? 'Enviando...' : 'Clique para selecionar foto'}</p>

        </div>

      </div>



      <h3 style={{ color: 'var(--green)', marginBottom: 16 }}>📸 GALERIA ({fotos.length} fotos)</h3>

      {fotos.length === 0 ? (

        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>

          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>

          <p>Nenhuma foto ainda. Faça upload acima!</p>

        </div>

      ) : (

        <div className="gallery-grid">

          {fotos.map(f => (

            <div key={f.id} className="gallery-item">

              <img src={f.url} alt={f.tipo} />

              <div className="gallery-label">

                <span>{tipoLabel[f.tipo] || f.tipo}</span>

                <button onClick={() => deleteFoto(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>

              </div>

            </div>

          ))}

        </div>

      )}

    </>

  )

}
