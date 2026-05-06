'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-brand">
          <Logo size={44} />
          <div className="nav-brand-text">
            <span>NUTRILENS</span>
            <small>PRO</small>
          </div>
        </Link>
        <Link href="/login" className="btn btn-primary btn-sm">Entrar</Link>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center', 
        padding: '80px 24px 40px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)'
      }}>
        <div>
          <div style={{ marginBottom: 32 }}>
            <Logo size={100} />
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 7vw, 4.2rem)', 
            fontWeight: 900, 
            letterSpacing: 2,
            background: 'linear-gradient(135deg,#00ff41,#7b2fff)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', 
            marginBottom: 12 
          }}>
            NUTRILENS PRO
          </h1>
          <p style={{ 
            maxWidth: 620, 
            margin: '0 auto 40px', 
            color: 'var(--text2)', 
            lineHeight: 1.7,
            fontSize: '1.1rem'
          }}>
            Plataforma exclusiva de acompanhamento nutricional.<br />
            Protocolos personalizados e lista de compras automática.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }}>
            Acessar Plataforma
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        background: 'var(--dark2)', 
        borderTop: '1px solid var(--border)', 
        padding: '40px 24px', 
        textAlign: 'center' 
      }}>
        <Logo size={40} />
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 12 }}>
          © 2026 NutriLens Pro · Todos os direitos reservados
        </p>
      </footer>
    </>
  )
}
