'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login.');
        setLoading(false);
        return;
      }

      if (data.role === 'pro') {
        router.push('/pro');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tighter italic">SPANCERSKI</h1>
          <p className="text-[#39ff14] mt-2 uppercase tracking-widest text-sm">Professional Portal</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#39ff14] focus:outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#39ff14] focus:outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39ff14] hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ENTRANDO...' : 'ACESSAR PAINEL'}
          </button>
        </form>
      </div>
    </div>
  );
}
