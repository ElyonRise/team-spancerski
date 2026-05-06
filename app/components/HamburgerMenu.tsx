'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ fontSize: '28px', background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', padding: '8px' }}
      >
        ☰
      </button>

      {open && (
        <div style={{ position: 'fixed', top: '70px', left: '15px', background: 'var(--dark2)', padding: '20px', borderRadius: '12px', zIndex: 9999, minWidth: '230px', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
          <Link href="/dashboard" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/dashboard/dieta" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Dieta</Link>
          <Link href="/dashboard/refeicoes" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Refeicoes</Link>
          <Link href="/dashboard/compras" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Compras</Link>
          <Link href="/dashboard/progresso" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Progresso</Link>
          <Link href="/dashboard/ia" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>NutriBot</Link>
          <Link href="/dashboard/configuracoes" style={{display:'block', padding:'10px 0', color:'var(--text1)'}} onClick={() => setOpen(false)}>Configuracoes</Link>
        </div>
      )}
    </>
  );
}
