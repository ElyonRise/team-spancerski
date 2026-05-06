'use client';
import { useState, useEffect } from 'react';

export default function RefeicoesPage() {
  const [tab, setTab] = useState<'foto' | 'historico'>('foto');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'historico') {
      fetch('/api/refeicao-foto').then(r => r.json()).then(setHistorico);
    }
  }, [tab]);

  const handleFoto = (e: any) => {
    const file = e.target.files[0];
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analisarFoto = async () => {
    if (!foto) return;
    setLoading(true);
    const form = new FormData();
    form.append('foto', foto);

    const res = await fetch('/api/refeicao-foto', { method: 'POST', body: form });
    const data = await res.json();
    setResultado(data);
    setLoading(false);
  };

  return (
    <div className="glass-card p-8 rounded-3xl max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Registro de Refeições</h1>

      <div className="flex gap-2 mb-8 border-b border-white/10 pb-2">
        <button onClick={() => setTab('foto')} className={`flex-1 py-3 rounded-2xl ${tab === 'foto' ? 'bg-green-500 text-black' : 'bg-white/10'}`}>Analisar Foto</button>
        <button onClick={() => setTab('historico')} className={`flex-1 py-3 rounded-2xl ${tab === 'historico' ? 'bg-green-500 text-black' : 'bg-white/10'}`}>Histórico</button>
      </div>

      {tab === 'foto' && (
        <div>
          <div className="border-2 border-dashed border-green-500/30 rounded-3xl p-12 text-center">
            {preview ? (
              <img src={preview} className="mx-auto max-h-80 rounded-2xl" />
            ) : (
              <p className="text-gray-400">Clique para selecionar foto da refeição</p>
            )}
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" id="foto" />
            <label htmlFor="foto" className="cursor-pointer mt-6 block bg-green-500/10 text-green-400 py-3 px-8 rounded-2xl inline-block">Selecionar Foto</label>
          </div>

          {foto && !resultado && (
            <button onClick={analisarFoto} disabled={loading} className="w-full mt-6 bg-green-500 py-4 rounded-2xl font-bold text-black">
              {loading ? 'Analisando com IA...' : 'ANALISAR REFEIÇÃO'}
            </button>
          )}

          {resultado && (
            <div className="mt-8 glass-card p-6 rounded-2xl">
              <h3 className="text-green-400 mb-4">Análise da IA</h3>
              <p className="text-xl">{resultado.descricao}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>Kcal: <strong>{resultado.kcal}</strong></div>
                <div>Proteína: <strong>{resultado.proteina}g</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'historico' && (
        <div className="space-y-4">
          {historico.length === 0 && <p className="text-gray-400 text-center py-12">Nenhuma refeição registrada ainda.</p>}
          {historico.map(r => (
            <div key={r.id} className="glass-card p-5 rounded-2xl">
              <p className="font-medium">{r.descricao}</p>
              <p className="text-sm text-green-400">{r.kcal} kcal • {r.proteina}g prot</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}'use client';
import { useState, useEffect } from 'react';

export default function RefeicoesPage() {
  const [tab, setTab] = useState<'foto' | 'historico'>('foto');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'historico') {
      fetch('/api/refeicao-foto').then(r => r.json()).then(setHistorico);
    }
  }, [tab]);

  const handleFoto = (e: any) => {
    const file = e.target.files[0];
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analisarFoto = async () => {
    if (!foto) return;
    setLoading(true);
    const form = new FormData();
    form.append('foto', foto);

    const res = await fetch('/api/refeicao-foto', { method: 'POST', body: form });
    const data = await res.json();
    setResultado(data);
    setLoading(false);
  };

  return (
    <div className="glass-card p-8 rounded-3xl max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Registro de Refeições</h1>

      <div className="flex gap-2 mb-8 border-b border-white/10 pb-2">
        <button onClick={() => setTab('foto')} className={`flex-1 py-3 rounded-2xl ${tab === 'foto' ? 'bg-green-500 text-black' : 'bg-white/10'}`}>Analisar Foto</button>
        <button onClick={() => setTab('historico')} className={`flex-1 py-3 rounded-2xl ${tab === 'historico' ? 'bg-green-500 text-black' : 'bg-white/10'}`}>Histórico</button>
      </div>

      {tab === 'foto' && (
        <div>
          <div className="border-2 border-dashed border-green-500/30 rounded-3xl p-12 text-center">
            {preview ? (
              <img src={preview} className="mx-auto max-h-80 rounded-2xl" />
            ) : (
              <p className="text-gray-400">Clique para selecionar foto da refeição</p>
            )}
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" id="foto" />
            <label htmlFor="foto" className="cursor-pointer mt-6 block bg-green-500/10 text-green-400 py-3 px-8 rounded-2xl inline-block">Selecionar Foto</label>
          </div>

          {foto && !resultado && (
            <button onClick={analisarFoto} disabled={loading} className="w-full mt-6 bg-green-500 py-4 rounded-2xl font-bold text-black">
              {loading ? 'Analisando com IA...' : 'ANALISAR REFEIÇÃO'}
            </button>
          )}

          {resultado && (
            <div className="mt-8 glass-card p-6 rounded-2xl">
              <h3 className="text-green-400 mb-4">Análise da IA</h3>
              <p className="text-xl">{resultado.descricao}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>Kcal: <strong>{resultado.kcal}</strong></div>
                <div>Proteína: <strong>{resultado.proteina}g</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'historico' && (
        <div className="space-y-4">
          {historico.length === 0 && <p className="text-gray-400 text-center py-12">Nenhuma refeição registrada ainda.</p>}
          {historico.map(r => (
            <div key={r.id} className="glass-card p-5 rounded-2xl">
              <p className="font-medium">{r.descricao}</p>
              <p className="text-sm text-green-400">{r.kcal} kcal • {r.proteina}g prot</p>
            </div>
          ))}
 
       </div>
      )}
    </div>
  );
}
