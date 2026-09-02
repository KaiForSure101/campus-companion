// Supabase browser configuration
// -------------------------------
// These values are safe to use in a browser application. The publishable key
// only identifies the project; database security still comes from RLS policies.
const SUPABASE_URL = "https://vktnoehxwswnjhmbwzzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NYnJc9T5JRbbqIBiTSoWwQ_CaErbqxy";
const SUPABASE_REDIRECT_URL = "https://campus-companion-mu.vercel.app/";

// These public values let the Settings page retry Auth directly if a browser
// extension or client wrapper interrupts the normal Supabase request.
window.CAMPUS_SUPABASE_URL = SUPABASE_URL;
window.CAMPUS_SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

// The CDN script creates the global `supabase` object used here.
const campusSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
