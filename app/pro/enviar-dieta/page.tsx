'use client'

import { useState, useEffect, Suspense } from 'react'

import { useSearchParams } from 'next/navigation'



function EnviarDietaForm() {

  const params = useSearchParams()

  const preClientId = params.get('client')



  const [clientes, setClientes] = useState<any[]>([])

  const [clientId, setClientId] = useState(preClientId || '')

  const [nome, setNome] = useState('')

  const [raw, setRaw] = useState('')

  const [result, setResult] = useState<any>(null)

  const [loading, setLoading] = useState(false)

  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)



  useEffect(() => {

    fetch('/api/clientes').then(r => r.json()).then(setClientes)

  }, [])



  async function submit(e: React.FormEvent) {

    e.preventDefault()

    if (!clientId) { setAlert({ type: 'error', msg: 'Selecione um cliente.' }); return }

    if (!raw.trim()) { setAlert({ type: 'error', msg: 'Cole o texto da dieta.' }); return }

    setLoading(true); setAlert(null); setResult(null)

    const res = await fetch('/api/dieta', {

      method: 'POST', headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ client_id: clientId, nome: nome || 'Protocolo Nutricional', conteudo_raw: raw })

    })

    const data = await res.json()

    if (res.ok) setResult(data.parsed)

    else setAlert({ type: 'error', msg: data.error || 'Erro ao processar.' })

    setLoading(false)

  }



  return (

    <>

      <div className="dash-header"><h1>🥗 ENVIAR DIETA</h1><p>Cole a dieta e a IA estrutura automaticamente</p></div>

      {!result ? (

        <div className="card" style={{ maxWidth: 640 }}>

          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          <div className="alert alert-info" style={{ marginBottom: 20 }}>

            🤖 Cole o texto da dieta em qualquer formato — a Groq IA irá estruturar em protocolo completo com macros e lista de compras automaticamente.

          </div>

          <form onSubmit={submit}>

            <div className="form-group"><label>Cliente *</label>

              <select value={clientId} onChange={e => setClientId(e.target.value)} required>

                <option value="">— Selecione —</option>

                {clientes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}

              </select>

            </div>

            <div className="form-group"><label>Nome do Protocolo</label>

              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Protocolo Cutting — Semana 1" />

            </div>

            <div className="form-group">

              <label>TEXTO DA DIETA (qualquer formato)</label>

              <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={12}

                placeholder={`Cole aqui a dieta em qualquer formato. Exemplos:\n\nCafé da manhã (7h): 3 ovos mexidos, 2 fatias pão integral, café sem açúcar\n\nAlmoço (12h): 200g frango grelhado, 150g arroz integral, salada verde à vontade\n\nLanche (15h): 1 banana, 30g whey protein\n\nJantar (19h): 200g atum, legumes vapor`} required />

            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ fontSize: '1rem', padding: '13px' }}>

              {loading ? <><span className="loader" />&nbsp; Processando com IA...</> : '🚀 Criar Protocolo com IA'}

            </button>

          </form>

        </div>

      ) : (

        <>

          <div className="alert alert-success">✅ Protocolo criado e enviado ao cliente! A lista de compras foi gerada automaticamente.</div>

          <div className="card mb-16">

            <h3>📈 MACROS GERADOS PELA IA</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>

              {[['KCAL', result.kcal, 'var(--green)'], ['PROTEÍNA', `${result.proteina}g`, 'var(--purple)'], ['CARBOS', `${result.carboidratos}g`, '#fbbf24'], ['GORDURAS', `${result.gorduras}g`, '#f87171']].map(([l, v, c]) => (

                <div key={l as string} style={{ textAlign: 'center', background: 'var(--dark3)', borderRadius: 10, padding: 14 }}>

                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: c as string }}>{v}</div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text2)', letterSpacing: 1 }}>{l}</div>

                </div>

              ))}

            </div>

          </div>

          {result.protocolo?.map((meal: any, i: number) => (

            <div key={i} className="meal-card">

              <div className="meal-header">

                <div><div className="meal-time">{meal.horario}</div><div className="meal-name">{meal.nome}</div></div>

                <span className="meal-kcal">{meal.kcal_refeicao} kcal</span>

              </div>

              {meal.alimentos?.map((a: any, j: number) => (

                <div key={j} className="food-item"><span>{a.item}</span><span className="food-qty">{a.quantidade}</span></div>

              ))}

            </div>

          ))}

          <div className="card mt-16">

            <h3>🛒 LISTA DE COMPRAS GERADA</h3>

            {result.lista_compras?.map((i: any, idx: number) => (

              <div key={idx} className="shop-item" style={{ marginBottom: 6 }}>

                <span style={{ fontSize: '0.85rem', flex: 1 }}>• {i.item}</span>

                <span className="qty">{i.quantidade}</span>

                <span style={{ background: 'rgba(123,47,255,0.12)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem' }}>{i.categoria}</span>

              </div>

            ))}

          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>

            <button className="btn btn-primary" onClick={() => { setResult(null); setRaw(''); setNome('') }}>+ Enviar Nova Dieta</button>

          </div>

        </>

      )}

    </>

  )

}



export default function EnviarDietaPage() {

  return <Suspense><EnviarDietaForm /></Suspense>

}
