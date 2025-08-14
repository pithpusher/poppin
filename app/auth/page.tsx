'use client';
import { useState } from 'react';
import { sb } from '@/lib/sb';
import { ensureUserRow } from '@/lib/user';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Sending link...');
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) setMsg(error.message);
    else setMsg('Check your email for a sign-in link.');
  }

  async function getSession() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
      await ensureUserRow();
      setMsg('You are signed in.');
    } else {
      setMsg('No active session.');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Sign in</h1>
      <form onSubmit={sendLink} style={{ display:'grid', gap:8, maxWidth:360 }}>
        <input
          type="email"
          required
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ padding:8 }}
        />
        <button>Send magic link</button>
      </form>
      <div style={{ marginTop:12 }}>
        <button onClick={getSession}>Check session</button>
      </div>
      {msg && <p style={{ marginTop:12 }}>{msg}</p>}
    </div>
  );
}
