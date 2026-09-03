// Same-origin authentication proxy for networks that block browser requests to Supabase.
// It forwards only the public publishable key, never a service-role secret.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vktnoehxwswnjhmbwzzv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_NYnJc9T5JRbbqIBiTSoWwQ_CaErbqxy';

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const { action, email, password } = request.body || {};
  const endpoint = action === 'signup' ? 'signup' : action === 'signin' ? 'token?grant_type=password' : null;

  if (!endpoint || typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'A valid authentication action, email, and password are required.' });
  }

  try {
    const supabaseResponse = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const payload = await supabaseResponse.json().catch(() => ({}));
    return response.status(supabaseResponse.status).json(payload);
  } catch (error) {
    return response.status(502).json({ error: 'The server could not reach Supabase Auth.', detail: error.message });
  }
}
