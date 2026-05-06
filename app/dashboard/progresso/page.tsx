'use client';
import { useState } from 'react';

export default function ProgressoPage() {
  const [fotoAntes, setFotoAntes] = useState<File | null>(null);
  const [fotoDepois, setFotoDepois] = useState<File | null>(null);
  const [previewAntes, setPreviewAntes] = useState<string | null>(null);
  const [previewDepois, setPreviewDepois] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<any>(null);
  const [erro, setErro] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'antes' | 'depois') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tipo === 'antes') {
      setFotoAntes(file);
      const reader = new FileReader();
      reader.onload = ev => setPreviewAntes(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFotoDepois(file);
      const reader = new FileReader();
      reader.onload = ev => setPreviewDepois(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const gerarAnalise = async () => {
    if (!fotoAntes || !fotoDepois) return setErro('Envie foto ANTES e DEPOIS');
    setLoading(true);
    setErro('');

    const form = new FormData();
    form.append('foto_antes', fotoAntes);
    form.append('foto_depois', fotoDepois);

    const res = await fetch('/api/analise-corporal', { method: 'POST', body: form });
    const data = await res.json();

    if (data.erro) setErro(data.erro);
    else setAnalise(data);

    setLoading(false);
  };

  return (
    <div className="card">
      <h1>Análise Corporal por IA</h1>
      <p>Envie foto antiga e atual para comparação.</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', margin:'25px 0'}}>
        <div>
          <h3>Foto ANTES</h3>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, 'antes')} />
          {previewAntes && <img src={previewAntes} style={{maxWidth:'100%', marginTop:10, borderRadius:12}} />}
        </div>
        <div>
          <h3>Foto DEPOIS</h3>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, 'depois')} />
          {previewDepois && <img src={previewDepois} style={{maxWidth:'100%', marginTop:10, borderRadius:12}} />}
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={gerarAnalise} disabled={loading}>
        {loading ? 'Analisando...' : 'GERAR ANÁLISE CORPORAL'}
      </button>

      {erro && <div className="alert alert-error">{erro}</div>}

      {analise && (
        <div style={{marginTop:30, padding:20, background:'var(--dark3)', borderRadius:12}}>
          <h2>Resultado da IA</h2>
          <p><strong>{analise.resumo}</strong></p>
          <h3>Pontos Positivos:</h3>
          <ul>{analise.pontos_positivos?.map((p:string,i:number) => <li key={i}>• {p}</li>)}</ul>
          <h3>Áreas para Melhorar:</h3>
          <ul>{analise.areas_melhoria?.map((p:string,i:number) => <li key={i}>• {p}</li>)}</ul>
          <p><strong>Motivação:</strong> {analise.motivacao}</p>
        </div>
      )}
    </div>
  );
}
