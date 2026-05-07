import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  const [clientes, dietas] = await Promise.all([
    prisma.user.count({ where: { role: 'client' } }),
    prisma.dieta.count()
  ]).catch(() => [0, 0]);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#e2e2e8] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic leading-none">SPANCERSKI</h1>
            <p className="text-[#39ff14] font-['Space_Grotesk'] tracking-[0.4em] text-xs mt-2 uppercase">Optimization Hub</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/pro" 
              className="bg-[#39ff14] text-black px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-[0_0_25px_rgba(57,255,20,0.3)] flex-1 md:flex-none text-center"
            >
              PROFISSIONAL
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all flex-1 md:flex-none text-center"
            >
              CLIENTE
            </Link>
          </div>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 md:p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Total Clientes</span>
            <div className="text-7xl font-bold mt-4 tracking-tighter">{clientes}</div>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Protocolos</span>
            <div className="text-7xl font-bold mt-4 tracking-tighter">{dietas}</div>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[32px] border border-[#39ff14]/20 bg-[#39ff14]/5 backdrop-blur-3xl relative overflow-hidden">
            <span className="text-[10px] font-bold text-[#39ff14] tracking-[0.2em] uppercase">Status IA</span>
            <div className="text-3xl font-bold mt-6 text-white italic">SISTEMA ATIVO</div>
          </div>
        </div>
      </div>
    </div>
  )
}
