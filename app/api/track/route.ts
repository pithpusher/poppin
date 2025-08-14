// app/api/track/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { event_name, event_id, city_slug, payload } = await req.json();
    if (!event_name) return NextResponse.json({ ok:false, error:'event_name required' }, { status: 400 });

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await db.from('analytics_events').insert({
      event_name,
      event_id: event_id || null,
      city_slug: city_slug || null,
      payload: payload || null,
    });

    if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok:true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 400 });
  }
}
