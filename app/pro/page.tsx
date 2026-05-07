import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProDashboard() {
  const [clientes, dietas] = await Promise.all([
    prisma.user.count({ where: { role: 'client' } }),
    prisma.dieta.count()
  ]).catch(() => [0, 0]);

  return (
    <div style={{ minHeight: '100vh', background: '#0c0e12', color: '#e2e2e8', padding: '40px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '32px', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', fontStyle: 'italic', margin: 0 }}>SPANCERSKI</h1>
            <p style={{ color: '#39ff14', letterSpacing: '4px', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '8px' }}>Optimization Hub</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/pro" style={{ background: '#39ff14', color: '#000', padding: '12px 28px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              PROFISSIONAL
            </Link>
            <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '12px 28px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              CLIENTE
            </Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#888', letterSpacing: '3px', textTransform: 'uppercase' }}>Total Clientes</span>
            <div style={{ fontSize: '5rem', fontWeight: 700, marginTop: '16px', letterSpacing: '-3px' }}>{clientes}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#888', letterSpacing: '3px', textTransform: 'uppercase' }}>Protocolos</span>
            <div style={{ fontSize: '5rem', fontWeight: 700, marginTop: '16px', letterSpacing: '-3px' }}>{dietas}</div>
          </div>

          <div style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)', borderRadius: '24px', padding: '40px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#39ff14', letterSpacing: '3px', textTransform: 'uppercase' }}>Status IA</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '24px', fontStyle: 'italic' }}>SISTEMA ATIVO</div>
          </div>
        </div>

      </div>
    </div>
  )
}
