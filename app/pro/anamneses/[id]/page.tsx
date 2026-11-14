'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SECTIONS, FOTO_POSICOES, NUMERO, formatValue, isVisible } from '@/lib/anamnese-schema'

export default function AnamneseDetalhe({ params }: { params: { id: string } }) {
  const [a, setA] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [ampliada, setAmpliada] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/anamnese?id=${params.id}`)
      .then(async r => { const d = await r.json(); r.ok ? setA(d) : setErro(d.error || 'Erro') })
      .catch(() => setErro('Erro ao carregar'))
  }, [params.id])

  if (erro) return <div className="card" style={{ margin: 32 }}><p>{erro}</p></div>
  if (!a) return <div className="text-center" style={{ padding: 40 }}><span className="loader" /></div>

  const dados = a.dados || {}
  const foto = (pos: string) => a.fotos?.find((f: any) => f.posicao === pos)?.url

  return (
    <div className="anamnese-print" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .anamnese-print .card { background: #fff !important; border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; }
          .anamnese-print .card h3, .anamnese-print h1 { color: #000 !important; text-shadow: none !important; }
          .anamnese-print td, .anamnese-print th, .anamnese-print p, .anamnese-print span { color: #000 !important; }
        }
      `}</style>

      <div className="dash-header no-print" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/pro/anamneses" className="btn btn-outline">← Anamneses</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>Imprimir / salvar PDF</button>
      </div>

      <div className="dash-header">
        <h1>FICHA DE ANAMNESE</h1>
        <p>{a.client_name} — recebida em {new Date(a.submitted_at).toLocaleString('pt-BR')}</p>
      </div>

      {SECTIONS.map((s, i) => (
        <div className="card mb-16" key={s.id}>
          <h3>{String(i + 1).padStart(2, '0')} │ {s.title}</h3>
          <table>
            <tbody>
              {s.fields.filter(f => isVisible(f, dados)).map(f => (
                <tr key={f.id}>
                  <td style={{ width: 36, color: 'var(--text2)' }}>{NUMERO[f.id]}.</td>
                  <td style={{ width: '46%', color: 'var(--text2)' }}>
                    {f.label}{f.isNew && <span className="badge badge-purple no-print" style={{ marginLeft: 6 }}>rotina</span>}
                  </td>
                  <td style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{formatValue(f, dados[f.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="card mb-16">
        <h3>Registro fotográfico</h3>
        <div className="grid-3">
          {FOTO_POSICOES.map(p => (
            <div key={p.id}>
              <div className="font-bold text-sm mb-8" style={{ color: 'var(--green)' }}>{p.label.toUpperCase()}</div>
              {foto(p.id)
                ? <img src={foto(p.id)} alt={p.label} onClick={() => setAmpliada(foto(p.id))}
                    style={{ width: '100%', borderRadius: 10, cursor: 'zoom-in', display: 'block' }} />
                : <div className="upload-zone text-muted text-sm" style={{ cursor: 'default' }}>Não enviada</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Assinatura</h3>
        <p><b>{a.assinatura_nome}</b></p>
        <p className="text-muted text-sm">
          Consentimento LGPD: {a.consentimento ? 'sim' : 'não'} · {new Date(a.submitted_at).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {ampliada && (
        <div className="no-print" onClick={() => setAmpliada(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          <img src={ampliada} alt="Foto ampliada" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}
