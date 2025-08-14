import { sb } from '@/lib/sb';

export async function ensureUserRow() {
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  // Upsert the app-side users row with your auth uid/email
  await sb.from('users').upsert(
    { id: auth.user.id, email: auth.user.email },
    { onConflict: 'id' }
  );
  return auth.user;
}
