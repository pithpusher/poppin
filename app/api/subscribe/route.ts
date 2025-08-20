// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function sendVerifyEmail(email:string, city:string, token:string){
  const key = process.env.POSTMARK_API_KEY;
  const from = process.env.POSTMARK_FROM;
  const app = process.env.APP_BASE_URL || 'http://localhost:3000';
  if(!key || !from) return; // Skip email if not configured
  const link = `${app}/api/verify-sub?city=${encodeURIComponent(city)}&token=${encodeURIComponent(token)}`;
  const html = `<p>Confirm your subscription to Poppin ${city}.</p><p><a href="${link}">Verify your email</a></p>`;
  await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: { 'Accept':'application/json', 'Content-Type':'application/json', 'X-Postmark-Server-Token': key },
    body: JSON.stringify({ From: from, To: email, Subject: `Confirm your Poppin ${city} subscription`, HtmlBody: html })
  });
}

export async function POST(req: Request){
  try{
    const { email, city_slug } = await req.json();
    if(!email || !city_slug) return NextResponse.json({ ok:false, error:'email and city_slug required' }, { status: 400 });

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await db.from('subscribers')
      .upsert({ email, city_slug, verified: false }, { onConflict: 'email,city_slug' })
      .select('verify_token').single();

    if(error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });

    if (data?.verify_token) {
      await db.from('subscribers').update({ verify_sent_at: new Date().toISOString() }).eq('email', email).eq('city_slug', city_slug);
      await sendVerifyEmail(email, city_slug, data.verify_token);
    }
    return NextResponse.json({ ok:true });
  }catch(e: unknown){
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok:false, error: errorMessage }, { status: 400 });
  }
}
