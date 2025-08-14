'use client';
import { useState } from 'react';
import { sb } from '@/lib/sb';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setMsg(error ? error.message : 'Check your email for a magic link.');
  }

  return (
    <div style={{maxWidth:480, margin:'40px auto', padding:16}}>
      <h1 style={{fontSize:24, fontWeight:600}}>Sign in</h1>
      <form onSubmit={submit} style={{display:'grid', gap:8, marginTop:12}}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={{padding:10, border:'1px solid #ccc', borderRadius:8}}
        />
        <button style={{padding:10, borderRadius:8, background:'#4EA8FF', color:'#fff'}}>Send magic link</button>
      </form>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
    </div>
  );
}
