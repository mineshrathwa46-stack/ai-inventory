import React, { FormEvent, useState } from 'react';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { User } from '../types/index.ts';

interface AuthViewProps {
  onAuthenticated: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, storeName, storeCategory };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Authentication failed');
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">StockPulse<span className="text-indigo-600">AI</span></h1>
            <p className="text-xs text-slate-500">Inventory intelligence for your store</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 mb-6">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-bold ${mode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
            <LogIn className="inline w-4 h-4 mr-1" /> Login
          </button>
          <button type="button" onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-bold ${mode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
            <UserPlus className="inline w-4 h-4 mr-1" /> New User
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
              <input required value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
              <input value={storeCategory} onChange={(event) => setStoreCategory(event.target.value)} placeholder="Store category (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </>
          )}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (minimum 6 characters)" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 text-sm font-bold">
            {busy ? 'Please wait...' : mode === 'login' ? 'Login to dashboard' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
};
