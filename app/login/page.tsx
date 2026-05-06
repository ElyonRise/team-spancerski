'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tighter italic">SPANCERSKI</h1>
          <p className="text-primary mt-2 uppercase tracking-widest text-sm">Professional Portal</p>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); signIn('credentials', { email, password }); }}>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary focus:ring-0 transition-all"
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Senha</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary focus:ring-0 transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-primary hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            ACESSAR PAINEL
          </button>
        </form>
      </div>
    </div>
  );
}
