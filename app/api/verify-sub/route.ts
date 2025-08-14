// app/api/verify-sub/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request){
  const url = new URL(req.url);
  const city = url.searchParams.get('city');
  const token = url.searchParams.get('token');
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  if(!city || !token){
    return new Response('Missing params', { status: 400 });
  }
  const { error } = await db.from('subscribers')
    .update({ verified: true, verified_at: new Date().toISOString() })
    .eq('city_slug', city).eq('verify_token', token);
  const ok = !error;
  const html = `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">
  <h1>${ok ? 'Subscribed' : 'Oops'}</h1>
  <p>${ok ? 'You are verified. You will receive digests.' : 'Verification failed.'}</p>
  <p><a href="/">Back to Poppin</a></p>
  </body>`;
  return new Response(html, { headers: { 'content-type':'text/html' }, status: ok?200:400 });
}
