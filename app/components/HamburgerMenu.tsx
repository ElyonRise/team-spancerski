'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} className="text-3xl text-green-400 hover:text-white transition-colors">
        ☰
      </button>

      {open && (
        <div className="fixed top-20 left-6 glass-card p-6 rounded-2xl z-50 min-w-[240px] shadow-2xl">
          <Link href="/dashboard" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Início</Link>
          <Link href="/dashboard/dieta" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Meu Protocolo</Link>
          <Link href="/dashboard/refeicoes" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Registro de Refeições</Link>
          <Link href="/dashboard/compras" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Lista de Compras</Link>
          <Link href="/dashboard/progresso" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Progresso & Análise IA</Link>
          <Link href="/dashboard/ia" className="block py-3 text-white hover:text-green-400" onClick={() => setOpen(false)}>Assistente IA</Link>
        </div>
      )}
    </>
  );
}
