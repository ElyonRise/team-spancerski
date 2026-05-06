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

            <span>SPANCERSKI</span>

            <small>TEAM</small>

          </div>

        </Link>

        <Link href="/login" className="btn btn-primary btn-sm">Entrar</Link>

      </nav>



      {/* HERO */}

      <section style={{

        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',

        textAlign: 'center', padding: '80px 24px 40px',

        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(123,47,255,0.06) 0%, transparent 50%)'

      }}>

        <div>

          <div style={{ marginBottom: 32, animation: 'float 4s ease-in-out infinite' }}>

            <Logo size={120} />

          </div>

          <h1 style={{ fontSize: 'clamp(2rem,6vw,3.8rem)', fontWeight: 900, letterSpacing: 4,

            background: 'linear-gradient(135deg,#00ff41,#7b2fff)', WebkitBackgroundClip: 'text',

            WebkitTextFillColor: 'transparent', marginBottom: 8 }}>

            TEAM SPANCERSKI

          </h1>

          <h2 style={{ fontSize: 'clamp(0.8rem,2vw,1rem)', letterSpacing: 6, color: 'var(--text2)', marginBottom: 20 }}>

            PERSONAL TRAINING · NUTRIÇÃO · EVOLUÇÃO

          </h2>

          <p style={{ maxWidth: 520, margin: '0 auto 40px', color: 'var(--text2)', lineHeight: 1.8 }}>

            Plataforma exclusiva de acompanhamento nutricional com inteligência artificial.

            Protocolos personalizados, lista de compras automática e suporte 24/7.

          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>

            <Link href="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>

              🚀 Acessar Plataforma

            </Link>

          </div>

        </div>

      </section>



      {/* FEATURES */}

      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>

          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, letterSpacing: 2,

            background: 'linear-gradient(135deg,#00ff41,#7b2fff)', WebkitBackgroundClip: 'text',

            WebkitTextFillColor: 'transparent' }}>TUDO QUE VOCÊ PRECISA</h2>

          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Uma plataforma completa para sua transformação</p>

        </div>

        <div className="grid-3">

          {[

            { icon: '🥗', t: 'PROTOCOLO DE DIETA IA', d: 'O profissional cola a dieta e a IA estrutura automaticamente o protocolo completo com macros e horários.' },

            { icon: '🛒', t: 'LISTA DE COMPRAS', d: 'Gerada automaticamente a partir do protocolo nutricional, organizada por categoria.' },

            { icon: '📊', t: 'CALCULADORA IMC', d: 'Acompanhe seu índice de massa corporal com histórico visual e análise da evolução.' },

            { icon: '📸', t: 'GALERIA DE PROGRESSO', d: 'Fotos de antes e depois organizadas para você acompanhar sua transformação.' },

            { icon: '🤖', t: 'ASSISTENTE IA', d: 'Tire dúvidas nutricionais 24/7 com nossa IA especializada em nutrição.' },

            { icon: '🔥', t: 'ZONA DE MOTIVAÇÃO', d: 'Streak diário, frases motivacionais e metas para manter sua constância.' },

          ].map(f => (

            <div key={f.t} className="card" style={{ cursor: 'default' }}>

              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>

              <h3 style={{ marginBottom: 8 }}>{f.t}</h3>

              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.d}</p>

            </div>

          ))}

        </div>

      </section>



      {/* FOOTER */}

      <footer style={{ background: 'var(--dark2)', borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>

        <Logo size={40} />

        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginTop: 12 }}>

          © 2025 Team Spancerski · Todos os direitos reservados

        </p>

      </footer>



      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>

    </>

  )

}
