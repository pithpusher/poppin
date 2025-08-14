'use client';
import { useState } from 'react';

export function ComingSoon({ city }:{ city:string }) {
  const [email,setEmail]=useState('');
  const [msg,setMsg]=useState<string|null>(null);

  async function subscribe(e:React.FormEvent){
    e.preventDefault();
    const res = await fetch('/api/subscribe', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ email, city_slug: city })
    });
    setMsg(res.ok ? 'Check your email to confirm.' : 'Could not subscribe.');
  }

  return (
    <div className="max-w-lg p-4 space-y-3 token-border rounded-lg bg-white">
      <h2 className="text-xl font-semibold">Poppin is coming soon to {city}</h2>
      <p className="text-sm text-gray-600">We’re seeding events and organizers. Get notified:</p>
      <form onSubmit={subscribe} className="flex gap-2">
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
          className="flex-1 px-3 py-2 rounded-md token-border" />
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white">Notify me</button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
