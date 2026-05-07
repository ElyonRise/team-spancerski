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
    <div style={{
      minHeight: '100vh',
      background: 'var(--dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 0 40px rgba(0,255,65,0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '4px',
            color: 'var(--green)',
            textShadow: 'var(--glow)',
          }}>SPANCERSKI</h1>
          <p style={{
            color: 'var(--text2)',
            marginTop: '6px',
            letterSpacing: '3px',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
          }}>Professional Portal</p>
        </div>
           
         <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(57,255,20,0.3)', marginBottom: '24px' }}>
          <button type="button" style={{ flex: 1, padding: '10px', fontWeight: 700, letterSpacing: '2px', fontSize: '0.75rem', background: '#39ff14', color: '#000', border: 'none', cursor: 'pointer' }}>
            PROFISSIONAL
          </button>
          <button type="button" style={{ flex: 1, padding: '10px', fontWeight: 700, letterSpacing: '2px', fontSize: '0.75rem', background: 'transparent', color: '#39ff14', border: 'none', cursor: 'pointer' }}>
            CLIENTE
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
           <input
  type="email"
  required
  placeholder="seu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="off"
/>

<input
  type="password"
  required
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="new-password"
/>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '8px', fontSize: '0.95rem', letterSpacing: '1.5px' }}
          >
            {loading ? (
              <><span className="loader" style={{ marginRight: '8px' }}></span>ENTRANDO...</>
            ) : 'ACESSAR PAINEL'}
          </button>
        </form>
      </div>
    </div>
  );
}
