'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clientes').then(r => r.json()).then(d => { setClientes(d); setLoading(false) })
  }, [])

  async function remover(id: number, name: string) {
    if (!confirm(`Remover cliente ${name}? Esta acao e irreversivel.`)) return
    await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' })
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loader" /></div>

  return (
    <>
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div><h1>CLIENTES</h1><p>{clientes.length} cliente(s) cadastrado(s)</p></div>
        <Link href="/pro/novo-cliente" className="btn btn-primary">+ Novo Cliente</Link>
      </div>
      <div className="card">
        {clientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p className="text-muted">Nenhum cliente cadastrado.</p>
            <Link href="/pro/novo-cliente" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>+ Adicionar Primeiro</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Email</th><th>Objetivo</th><th>Dietas</th><th>Streak</th><th>Cadastro</th><th>Acoes</th></tr></thead>
              <tbody>
                {clientes.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{c.email}</td>
                    <td><span className="badge badge-green">{c.goal || '—'}</span></td>
                    <td style={{ textAlign: 'center' }}>{c.total_dietas}</td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--green)', fontWeight: 700 }}>{c.streak_total}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/pro/enviar-dieta?client=${c.id}`} className="btn btn-outline btn-sm">Dieta</Link>
                        <button onClick={() => remover(c.id, c.name)} className="btn btn-danger btn-sm">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
