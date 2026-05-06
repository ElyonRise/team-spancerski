'use client';
import { useState, useEffect } from 'react';

export default function ComprasPage() {
  const [lista, setLista] = useState<any>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compras').then(r => r.json()).then(d => {
      setLista(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="glass-card p-12 text-center text-white">Carregando lista de compras...</div>;
  if (!lista) return <div className="glass-card p-12 text-center">Nenhuma lista gerada ainda.</div>;

  const itens = typeof lista.itens === 'string' ? JSON.parse(lista.itens) : lista.itens;

  return (
    <div className="max-w-4xl mx-auto glass-card p-10 rounded-3xl">
      <h1 className="text-4xl font-bold text-white">Lista de Compras</h1>
      <p className="text-green-400 mt-2">Protocolo: {lista.dieta_nome}</p>

      <div className="mt-10 space-y-12">
        {itens && itens.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl">
            <span className="text-lg text-white">{item.item}</span>
            <span className="text-green-400 font-medium">{item.quantidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
