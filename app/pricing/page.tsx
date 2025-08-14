'use client';
import { useState } from 'react';

type Plan = { key:string; name:string; desc:string; priceId?:string };

const plans: Plan[] = [
  { key:'starter', name:'Starter', desc:'3 posts / month', priceId: process.env.NEXT_PUBLIC_PRICE_SUB_STARTER },
  { key:'host', name:'Host', desc:'10 posts / month', priceId: process.env.NEXT_PUBLIC_PRICE_SUB_HOST },
  { key:'pro', name:'Pro', desc:'Unlimited posts', priceId: process.env.NEXT_PUBLIC_PRICE_SUB_PRO },
  { key:'premium', name:'Premium', desc:'Unlimited + priority support', priceId: process.env.NEXT_PUBLIC_PRICE_SUB_PREMIUM },
];

export default function Pricing(){
  const [msg,setMsg] = useState<string|null>(null);

  async function checkout(priceId?:string){
    if(!priceId){ setMsg('Missing Stripe price id.'); return; }
    setMsg('Creating checkout…');
    const res = await fetch('/api/checkout', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ mode:'subscription', priceId })
    });
    const json = await res.json();
    if(!res.ok){ setMsg(json.error || 'Checkout error'); return; }
    window.location.href = json.url;
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {plans.map(p=>(
        <div key={p.key} className="token-border rounded-xl p-4 bg-white">
          <div className="font-semibold text-lg">{p.name}</div>
          <div className="text-sm text-gray-600">{p.desc}</div>
          <button onClick={()=>checkout(p.priceId)} className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white">
            Choose
          </button>
        </div>
      ))}
      <div className="md:col-span-4">
        <p className="text-sm text-gray-600">
          Need a one-off post? <a className="text-blue-600 underline" href="/pricing/yard-sale">Yard sale</a>
        </p>
      </div>
    </div>
  );
}
