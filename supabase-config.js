// Supabase browser configuration
// -------------------------------
// These values are safe to use in a browser application. The publishable key
// only identifies the project; database security still comes from RLS policies.
const SUPABASE_URL = "https://vktnoehxwswnjhmbwzzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NYnJc9T5JRbbqIBiTSoWwQ_CaErbqxy";

// The CDN script creates the global `supabase` object used here.
const campusSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
