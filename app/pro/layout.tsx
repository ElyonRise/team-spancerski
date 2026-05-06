import { getSession } from '@/lib/auth'

import { redirect } from 'next/navigation'

import Link from 'next/link'

import { Logo } from '@/components/Logo'



export default async function ProLayout({ children }: { children: React.ReactNode }) {

  const session = await getSession()

  if (!session) redirect('/login')

  if (session.role !== 'pro') redirect('/dashboard')



  const items = [

    { href: '/pro', icon: '🏠', label: 'Painel Geral' },

    { href: '/pro/clientes', icon: '👥', label: 'Clientes' },

    { href: '/pro/novo-cliente', icon: '➕', label: 'Novo Cliente' },

    { href: '/pro/enviar-dieta', icon: '🥗', label: 'Enviar Dieta' },

    { href: '/pro/galeria', icon: '📸', label: 'Galeria Geral' },

    { href: '/pro/configuracoes', icon: '⚙️', label: 'Configurações' },

  ]



  return (

    <>

      <nav className="nav">

        <Link href="/pro" className="nav-brand">

          <Logo size={40} />

          <div className="nav-brand-text"><span>SPANCERSKI</span><small>PROFISSIONAL</small></div>

        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <span style={{ background: 'rgba(123,47,255,0.15)', color: '#a78bfa', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>PRO</span>

          <form action="/api/auth/logout" method="POST">

            <button type="submit" className="btn btn-outline btn-sm">Sair</button>

          </form>

        </div>

      </nav>

      <div className="dash-layout" style={{ marginTop: 64 }}>

        <aside className="sidebar">

          <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--border)' }}>

            <div style={{ fontSize: '0.65rem', color: 'var(--purple)', letterSpacing: 2 }}>PROFISSIONAL</div>

            <div style={{ fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>Team Spancerski</div>

          </div>

          <div className="sidebar-section">GESTÃO</div>

          {items.slice(0,4).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">CONTEÚDO</div>

          {items.slice(4,5).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">CONTA</div>

          {items.slice(5).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

        </aside>

        <main className="dash-main">{children}</main>

      </div>

    </>

  )

}
