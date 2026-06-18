const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ervnxamiknhghpviaont.supabase.co';
// Prefer the service role key for server-side operations (bypasses RLS).
// Fall back to the regular key when service role not provided.
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || 'sb_publishable_5xGQpzNSlygnvaId-gxTag_ebdPqlOe';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;