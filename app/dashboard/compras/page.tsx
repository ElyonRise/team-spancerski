'use client'

import { useState, useEffect } from 'react'



export default function ComprasPage() {

  const [lista, setLista] = useState<any>(null)

  const [checked, setChecked] = useState<Set<string>>(new Set())

  const [loading, setLoading] = useState(true)



  useEffect(() => {

    fetch('/api/compras').then(r => r.json()).then(data => { setLista(data); setLoading(false) })

    const saved = localStorage.getItem('compras_checked')

    if (saved) setChecked(new Set(JSON.parse(saved)))

  }, [])



  function toggle(key: string) {

    setChecked(prev => {

      const next = new Set(prev)

      next.has(key) ? next.delete(key) : next.add(key)

      localStorage.setItem('compras_checked', JSON.stringify(Array.from(next)))

      return next

    })

  }



  function clearChecked() { setChecked(new Set()); localStorage.removeItem('compras_checked') }



  async function exportPDF() {

    if (!lista) return

    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()

    doc.setFontSize(16); doc.setTextColor(0,255,65)

    doc.text('TEAM SPANCERSKI — LISTA DE COMPRAS', 20, 20)

    doc.setFontSize(10); doc.setTextColor(150,150,150)

    doc.text(`Dieta: ${lista.dieta_nome}`, 20, 30)

    let y = 44

    const itens: any[] = typeof lista.itens === 'string' ? JSON.parse(lista.itens) : lista.itens

    const cats: Record<string, any[]> = {}

    itens.forEach((i: any) => { if (!cats[i.categoria]) cats[i.categoria] = []; cats[i.categoria].push(i) })

    Object.entries(cats).forEach(([cat, items]) => {

      doc.setFontSize(11); doc.setTextColor(123,47,255); doc.text(cat.toUpperCase(), 20, y); y += 8

      doc.setFontSize(10); doc.setTextColor(200,200,200)

      items.forEach((i: any) => { doc.text(`  ☐ ${i.item} — ${i.quantidade}`, 20, y); y += 6; if (y > 270) { doc.addPage(); y = 20 } })

      y += 4

    })

    doc.save('lista-compras-spancerski.pdf')

  }



  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loader" /></div>



  if (!lista) return (

    <div style={{ textAlign: 'center', padding: 60 }}>

      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</div>

      <h2 style={{ color: 'var(--text2)' }}>Nenhuma lista disponível</h2>

      <p className="text-muted mt-8">A lista é gerada automaticamente quando seu protocolo de dieta for enviado.</p>

    </div>

  )



  const itens: any[] = typeof lista.itens === 'string' ? JSON.parse(lista.itens) : lista.itens

  const cats: Record<string, any[]> = {}

  itens.forEach((i: any) => { if (!cats[i.categoria]) cats[i.categoria] = []; cats[i.categoria].push(i) })

  const done = itens.filter(i => checked.has(`${i.categoria}-${i.item}`)).length



  return (

    <>

      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>

        <div><h1>🛒 LISTA DE COMPRAS</h1><p>Baseada no seu protocolo: {lista.dieta_nome}</p></div>

        <div style={{ display: 'flex', gap: 8 }}>

          <button className="btn btn-outline btn-sm" onClick={clearChecked}>Limpar marcados</button>

          <button className="btn btn-primary btn-sm" onClick={exportPDF}>⬇️ PDF</button>

        </div>

      </div>



      {/* Progresso */}

      <div className="card mb-24">

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>

          <span style={{ fontSize: '0.85rem' }}>Itens comprados</span>

          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{done}/{itens.length}</span>

        </div>

        <div style={{ height: 8, background: 'var(--dark3)', borderRadius: 4 }}>

          <div style={{ width: `${itens.length ? (done/itens.length)*100 : 0}%`, height: 8, background: 'linear-gradient(90deg,var(--green),var(--purple))', borderRadius: 4, transition: 'width .3s' }} />

        </div>

      </div>



      {Object.entries(cats).map(([cat, items]) => (

        <div key={cat}>

          <div className="shop-category">{cat}</div>

          {items.map((i: any) => {

            const key = `${i.categoria}-${i.item}`

            return (

              <div key={key} className="shop-item">

                <input type="checkbox" id={key} checked={checked.has(key)} onChange={() => toggle(key)} />

                <label htmlFor={key} className={checked.has(key) ? 'done' : ''}>{i.item}</label>

                <span className="qty">{i.quantidade}</span>

              </div>

            )

          })}

        </div>

      ))}

    </>

  )

}
