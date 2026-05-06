import { getSession } from '@/lib/auth'

import { redirect } from 'next/navigation'

import Link from 'next/link'

import { Logo } from '@/components/Logo'



export default async function DashLayout({ children }: { children: React.ReactNode }) {

  const session = await getSession()

  if (!session) redirect('/login')

  if (session.role === 'pro') redirect('/pro')



  const items = [

    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },

    { href: '/dashboard/motivacao', icon: '🔥', label: 'Motivação' },

    { href: '/dashboard/dieta', icon: '🥗', label: 'Minha Dieta' },

    { href: '/dashboard/compras', icon: '🛒', label: 'Lista de Compras' },

    { href: '/dashboard/imc', icon: '📊', label: 'Calculadora IMC' },

    { href: '/dashboard/progresso', icon: '📸', label: 'Meu Progresso' },

    { href: '/dashboard/ia', icon: '🤖', label: 'Assistente IA' },

    { href: '/dashboard/configuracoes', icon: '⚙️', label: 'Configurações' },

  ]



  return (

    <>

      <nav className="nav">

        <Link href="/dashboard" className="nav-brand">

          <Logo size={40} />

          <div className="nav-brand-text"><span>SPANCERSKI</span><small>TEAM</small></div>

        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{session.name}</span>

          <form action="/api/auth/logout" method="POST">

            <button type="submit" className="btn btn-outline btn-sm">Sair</button>

          </form>

        </div>

      </nav>

      <div className="dash-layout" style={{ marginTop: 64 }}>

        <aside className="sidebar">

          <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--border)' }}>

            <div style={{ fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: 2 }}>CLIENTE</div>

            <div style={{ fontWeight: 700, color: 'var(--green)', marginTop: 4, fontSize: '0.9rem' }}>{session.name}</div>

          </div>

          <div className="sidebar-section">PRINCIPAL</div>

          {items.slice(0,2).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">NUTRIÇÃO</div>

          {items.slice(2,4).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">SAÚDE</div>

          {items.slice(4,6).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">IA & SUPORTE</div>

          {items.slice(6,7).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

          <div className="sidebar-section">CONTA</div>

          {items.slice(7).map(i => <Link key={i.href} href={i.href} className="sidebar-item">{i.icon} {i.label}</Link>)}

        </aside>

        <main className="dash-main">{children}</main>

      </div>

    </>

  )

}
