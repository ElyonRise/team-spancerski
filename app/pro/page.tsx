import { db } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  const stats = await db.query(`SELECT 
    (SELECT COUNT(*) FROM users WHERE role='client') as clientes,
    (SELECT COUNT(*) FROM dietas) as planos
  `);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white p-6 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter">DASHBOARD</h1>
          <p className="text-gray-500 font-mono">SISTEMA DE OTIMIZAÇÃO CORPORAL</p>
        </div>
        <Link href="/pro/novo-cliente" className="group relative px-8 py-4 bg-primary text-black font-bold rounded-full overflow-hidden transition-all">
          <span className="relative z-10">+ CADASTRAR ATLETA</span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[24px] backdrop-blur-md">
          <span className="text-primary text-sm font-bold">CLIENTES</span>
          <h2 className="text-6xl font-bold mt-2">{stats.rows[0].clientes}</h2>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[24px] backdrop-blur-md">
          <span className="text-primary text-sm font-bold">PLANOS ATIVOS</span>
          <h2 className="text-6xl font-bold mt-2">{stats.rows[0].planos}</h2>
        </div>
        <div className="md:col-span-2 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-8 rounded-[24px]">
          <h3 className="text-xl font-bold mb-4 italic">PRÓXIMAS AVALIAÇÕES</h3>
          <p className="text-gray-400">3 atletas aguardando feedback de progresso IA.</p>
        </div>
      </div>
    </div>
  )
}
