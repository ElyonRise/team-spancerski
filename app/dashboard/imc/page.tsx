'use client'

import { useState, useEffect } from 'react'

export default function IMCPage() {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [result, setResult] = useState<any>(null)
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/imc').then(r => r.json()).then(setHistorico)
  }, [])

  async function calcular(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/imc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peso: +peso, altura: +altura })
    })
    const data = await res.json()
    setResult(data)
    setHistorico(prev => [data, ...prev].slice(0, 10))
    setLoading(false)
  }

  function imcColor(v: number) {
    if (v < 18.5) return '#3b82f6'
    if (v < 25) return '#22c55e'
    if (v < 30) return '#eab308'
    if (v < 35) return '#f97316'
    return '#ef4444'
  }

  function markerLeft(v: number) {
    const pct = Math.min(Math.max(((v - 10) / 35) * 100, 0), 100)
    return `${pct}%`
  }

  return (
    <>
      <div className="dash-header"><h1>CALCULADORA IMC</h1><p>Acompanhe sua evolucao</p></div>
      <div className="grid-2">
        <div className="card">
          <h3>SEUS DADOS</h3>
          <form onSubmit={calcular}>
            <div className="form-group"><label>Peso (kg)</label>
              <input type="number" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 75" min="30" max="300" step="0.1" required />
            </div>
            <div className="form-group"><label>Altura (cm)</label>
              <input type="number" value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ex: 175" min="100" max="250" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="loader" /> : 'CALCULAR'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <h3>RESULTADO</h3>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: imcColor(result.imc) }}>{result.imc}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: imcColor(result.imc), marginBottom: 8 }}>{result.categoria}</div>
            </div>
            <div className="imc-bar">
              <div className="imc-marker" style={{ left: markerLeft(result.imc) }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text2)', marginBottom: 16 }}>
              <span>Baixo</span><span>Normal</span><span>Sobrepeso</span><span>Obeso</span>
            </div>
            <div style={{ background: 'var(--dark3)', borderRadius: 10, padding: 14 }}>
              {[
                { l: 'Peso informado', v: `${result.peso} kg` },
                { l: 'Altura informada', v: `${result.altura} cm` },
                { l: 'IMC calculado', v: result.imc },
                { l: 'Classificacao', v: result.categoria },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{r.l}</span>
                  <span style={{ fontWeight: 700 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {historico.length > 0 && (
        <div className="card mt-24">
          <h3>HISTORICO</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Peso</th><th>Altura</th><th>IMC</th><th>Classificacao</th></tr></thead>
              <tbody>
                {historico.map((r, i) => (
                  <tr key={i}>
                    <td>{new Date(r.recorded_at).toLocaleDateString('pt-BR')}</td>
                    <td>{r.peso} kg</td>
                    <td>{r.altura} cm</td>
                    <td style={{ fontWeight: 700, color: imcColor(r.imc) }}>{r.imc}</td>
                    <td><span className="badge badge-green">{r.categoria}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
