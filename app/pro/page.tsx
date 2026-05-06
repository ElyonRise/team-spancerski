import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  // Buscando dados reais via Prisma
  const [clientesCount, dietasCount] = await Promise.all([
    prisma.user.count({ where: { role: 'client' } }),
    prisma.dieta.count()
  ]).catch(() => [0, 0]); // Evita quebra se a tabela não existir

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white p-6 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter italic">SPANCERSKI</h1>
          <p className="text-[#39ff14] font-mono text-sm tracking-[0.3em]">PROFESSIONAL PORTAL</p>
        </div>
        <Link href="/pro/novo-cliente" className="px-8 py-4 bg-[#39ff14] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all">
          + NOVO CLIENTE
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-xl">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Atletas Ativos</p>
          <h2 className="text-6xl font-bold mt-4">{clientesCount}</h2>
        </div>
        <div className="glass-card p-8 rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-xl">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Protocolos Gerados</p>
          <h2 className="text-6xl font-bold mt-4">{dietasCount}</h2>
        </div>
        <div className="glass-card p-8 rounded-[24px] border border-[#39ff14]/20 bg-[#39ff14]/5 backdrop-blur-xl">
          <p className="text-[#39ff14] text-xs font-bold uppercase tracking-widest">Status da IA</p>
          <h2 className="text-2xl font-bold mt-4">SISTEMA ONLINE</h2>
        </div>
      </div>
    </div>
  )
}
