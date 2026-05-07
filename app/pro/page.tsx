import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  const [clientes, dietas] = await Promise.all([
    prisma.user.count({ where: { role: 'client' } }),
    prisma.dieta.count()
  ]).catch(() => [0, 0]);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#e2e2e8] p-4 md:p-10 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter italic leading-none">SPANCERSKI</h1>
            <p className="text-[#39ff14] font-['Space_Grotesk'] tracking-[0.4em] text-[10px] mt-2 uppercase">Optimization Hub</p>
          </div>
          <Link href="/pro/novo-cliente" className="bg-[#39ff14] text-black px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_25px_rgba(57,255,20,0.3)]">
            + NOVO ATLETA
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Total Clientes</span>
            <div className="text-7xl font-bold mt-4 tracking-tighter">{clientes}</div>
          </div>
          <div className="glass-card p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Protocolos</span>
            <div className="text-7xl font-bold mt-4 tracking-tighter">{dietas}</div>
          </div>
          <div className="glass-card p-10 rounded-[32px] border border-[#39ff14]/20 bg-[#39ff14]/5 backdrop-blur-3xl relative overflow-hidden">
            <span className="text-[10px] font-bold text-[#39ff14] tracking-[0.2em] uppercase">Status IA</span>
            <div className="text-3xl font-bold mt-4 text-white italic">SISTEMA ATIVO</div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#39ff14]/10 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
