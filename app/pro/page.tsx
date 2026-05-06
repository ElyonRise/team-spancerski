import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  const session = await getSession()

  const [stats] = await Promise.all([
    db.query(`SELECT 
      (SELECT COUNT(*) FROM users WHERE role='client') as total_clientes,
      (SELECT COUNT(*) FROM dietas) as total_dietas,
      (SELECT COUNT(*) FROM feedbacks WHERE lido=false) as pendentes
    `)
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tighter">SPANCERSKI</h1>
          <p className="text-green-400 text-xl">Painel do Profissional</p>
        </div>
        <Link href="/pro/novo-cliente" className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-2xl font-semibold text-black">
          + Novo Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-8 rounded-3xl">
          <p className="text-gray-400">CLIENTES ATIVOS</p>
          <p className="text-6xl font-bold text-white mt-4">{stats.rows[0].total_clientes}</p>
        </div>
        <div className="glass-card p-8 rounded-3xl">
          <p className="text-gray-400">DIETAS ENVIADAS</p>
          <p className="text-6xl font-bold text-white mt-4">{stats.rows[0].total_dietas}</p>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-red-500/30">
          <p className="text-gray-400">FEEDBACKS PENDENTES</p>
          <p className="text-6xl font-bold text-red-400 mt-4">{stats.rows[0].pendentes}</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Clientes Recentes</h2>
        {/* Tabela será carregada no client component se necessário */}
      </div>
    </div>
  )
}
