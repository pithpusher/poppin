'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/sb';

export default function SupabaseTest() {
  const [ok, setOk] = useState<string>('Checking…');

  useEffect(() => {
    (async () => {
      try {
        const { error } = await sb.auth.getSession();
        if (error) throw error;
        setOk('Supabase client initialized. Keys look good.');
      } catch (e: any) {
        setOk('Error: ' + e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Supabase sanity check</h1>
      <p>{ok}</p>
    </div>
  );
}
