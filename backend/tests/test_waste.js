// Simple test script for waste flow (requires NODE env and backend running)
// Usage: node backend/tests/test_waste.js

// Use global fetch (Node 18+) or fallback to node-fetch if available
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:5000';
let fetchFn;
if (typeof fetch === 'function') fetchFn = fetch;
else {
  try { fetchFn = require('node-fetch'); } catch (e) { console.error('fetch not available. Install node-fetch or use Node 18+'); process.exit(1); }
}

async function login() {
  const res = await fetchFn(`${SUPABASE_URL}/api/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username: process.env.TEST_ADMIN || 'superadmin', password: process.env.TEST_PASS || '90opklnmA' })
  });
  return await res.json();
}

async function run() {
  const t = await login();
  if (!t || !t.token) return console.error('Login failed', t);
  const token = t.token;

  // 1) fetch flowers
  let r = await fetchFn(`${SUPABASE_URL}/api/gullar`, { headers: { Authorization: `Bearer ${token}` } });
  const gullar = await r.json();
  if (!gullar || !gullar.length) return console.error('No flowers found, add some first');
  const gul = gullar[0];

  console.log('Using flower:', gul.nomi, 'kirim', gul.kirim, 'chiqim', gul.chiqim);

  // 2) POST waste
  const body = { gul_id: gul.id, son: 1, reason: 'test-spoil' };
  r = await fetchFn(`${SUPABASE_URL}/api/waste`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const res = await r.json();
  console.log('Waste post result:', res);

  // 3) Re-fetch flower and show updated chiqim
  r = await fetchFn(`${SUPABASE_URL}/api/gullar`, { headers: { Authorization: `Bearer ${token}` } });
  const after = await r.json();
  const updated = after.find(x => x.id === gul.id);
  console.log('After update - kirim', updated.kirim, 'chiqim', updated.chiqim);
}

run().catch(console.error);
