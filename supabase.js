let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (typeof supabase === 'undefined') {
      console.error('Supabase library not loaded');
      return null;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase credentials not configured in config.js');
      return null;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

async function checkAuth() {
  const client = getSupabaseClient();
  if (!client) return { session: null, user: null };
  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    console.error('Auth check error:', error);
    return { session: null, user: null };
  }
  return { session, user: session?.user ?? null };
}

async function signOut() {
  const client = getSupabaseClient();
  if (!client) return { error: new Error('Supabase not initialized') };
  return await client.auth.signOut();
}
