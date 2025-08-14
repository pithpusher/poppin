'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/sb';
import { ensureUserRow } from '@/lib/user';

type Ev = { id:string; title:string; start_at:string; city_slug:string; status:string };

export default function Moderation(){
  const [rows,setRows]=useState<Ev[]>([]);
  const [role,setRole]=useState<string>('resident');
  const [msg,setMsg]=useState<string|null>(null);

  useEffect(()=>{(async()=>{
    const u = await ensureUserRow();
    if(!u){ setMsg('Please sign in at /auth.'); return; }
    const { data: me } = await sb.from('users').select('role').eq('id', u.id).maybeSingle();
    setRole(me?.role || 'resident');
    await refresh();
  })();},[]);

  async function refresh(){
    const { data } = await sb.from('events')
      .select('id,title,start_at,city_slug,status')
      .neq('status','approved')
      .order('created_at', { ascending: true })
      .limit(50);
    setRows(data||[]);
  }

  async function setStatus(id:string, status:'approved'|'rejected'){
    const { error } = await sb.from('events').update({ status }).eq('id', id);
    if(error){ setMsg(error.message); return; }
    await refresh();
  }

  if(role!=='moderator' && role!=='admin'){
    return <div style={{ padding:24 }}><h1>Moderation</h1><p>You do not have access.</p></div>;
  }

  return (
    <div style={{ padding:24 }}>
      <h1>Moderation</h1>
      {msg && <p>{msg}</p>}
      <div style={{ display:'grid', gap:8, marginTop:12 }}>
        {rows.map(e=>(
          <div key={e.id} style={{ padding:12, borderRadius:8 }} className="token-border">
            <div style={{ fontWeight:600 }}>{e.title}</div>
            <div style={{ fontSize:12, opacity:.8 }}>{new Date(e.start_at).toLocaleString()} · {e.city_slug} · {e.status}</div>
            <div style={{ marginTop:8, display:'flex', gap:8 }}>
              <button onClick={()=>setStatus(e.id,'approved')}>Approve</button>
              <button onClick={()=>setStatus(e.id,'rejected')}>Reject</button>
            </div>
          </div>
        ))}
        {rows.length===0 && <div>No items in queue.</div>}
      </div>
    </div>
  );
}
