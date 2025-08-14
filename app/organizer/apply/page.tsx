'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/sb';
import { ensureUserRow } from '@/lib/user';

export default function OrganizerApply(){
  const [orgName,setOrgName]=useState('');
  const [msg,setMsg]=useState<string|null>(null);
  const [userId,setUserId]=useState<string|null>(null);

  useEffect(()=>{(async()=>{
    const u = await ensureUserRow();
    if(!u){ setMsg('Please sign in first at /auth.'); return; }
    setUserId(u.id);
    const { data: existing } = await sb.from('organizers')
      .select('status, org_name').eq('user_id', u.id).maybeSingle();
    if(existing){ setMsg(`You already applied (${existing.status}).`); }
  })();},[]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!userId){ setMsg('Sign in first.'); return; }
    const { error } = await sb.from('organizers').insert({ user_id: userId, org_name: orgName });
    setMsg(error ? error.message : 'Application submitted. A moderator will review.');
  }

  return (
    <div style={{ padding:24, maxWidth:480 }}>
      <h1>Apply as organizer</h1>
      <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
        <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="Organization name" required />
        <button>Submit</button>
      </form>
      {msg && <p style={{ marginTop:12 }}>{msg}</p>}
    </div>
  );
}
