import { getSession } from '@/lib/auth'

import { db } from '@/lib/db'

import Link from 'next/link'



export default async function ProDashboard() {

  const session = await getSession()

  const [clientsRes, dietasRes] = await Promise.all([

    db.query('SELECT id, name, email, goal, created_at FROM users WHERE role=\'client\' ORDER BY created_at DESC LIMIT 5'),

    db.query('SELECT COUNT(*) as total FROM dietas'),

  ])

  const clients = clientsRes.rows

  const totalDietas = dietasRes.rows[0]?.total || 0



  const totalClients = await db.query('SELECT COUNT(*) as total FROM users WHERE role=\'client\'')



  return (

    <>

      <div className="dash-header"><h1>PAINEL PROFISSIONAL 🏆</h1><p>Bem-vindo(a), Team Spancerski</p></div>

      <div className="stats-grid">

        <div className="stat-card"><div style={{ fontSize: '1.6rem' }}>👥</div><div className="num">{totalClients.rows[0]?.total || 0}</div><div className="lbl">clientes ativos</div></div>

        <div className="stat-card"><div style={{ fontSize: '1.6rem' }}>🥗</div><div className="num">{totalDietas}</div><div className="lbl">dietas enviadas</div></div>

      </div>

      <div className="card mt-16">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

          <h3>👥 CLIENTES RECENTES</h3>

          <Link href="/pro/clientes" className="btn btn-outline btn-sm">Ver todos →</Link>

        </div>

        {clients.length === 0 ? (

          <div style={{ textAlign: 'center', padding: 24 }}>

            <p className="text-muted">Nenhum cliente ainda.</p>

            <Link href="/pro/novo-cliente" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-block' }}>+ Adicionar Primeiro Cliente</Link>

          </div>

        ) : (

          <div className="table-wrap">

            <table>

              <thead><tr><th>Nome</th><th>Email</th><th>Objetivo</th><th>Cadastro</th><th>Ação</th></tr></thead>

              <tbody>

                {clients.map(c => (

                  <tr key={c.id}>

                    <td style={{ fontWeight: 600 }}>{c.name}</td>

                    <td style={{ color: 'var(--text2)' }}>{c.email}</td>

                    <td><span className="badge badge-green">{c.goal || '—'}</span></td>

                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>

                    <td><Link href={`/pro/enviar-dieta?client=${c.id}`} className="btn btn-outline btn-sm">🥗 Enviar dieta</Link></td>

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
