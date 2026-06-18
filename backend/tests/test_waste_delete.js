// Test script: create then delete a waste entry and verify gullar.chiqim adjusts
const BASE = process.env.SUPABASE_URL || 'http://localhost:5000';
let fetchFn;
if (typeof fetch === 'function') fetchFn = fetch;
else {
  try { fetchFn = require('node-fetch'); } catch (e) { console.error('fetch not available. Install node-fetch or use Node 18+'); process.exit(1); }
}

async function login() {
  const res = await fetchFn(`${BASE}/api/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username: process.env.TEST_ADMIN || 'superadmin', password: process.env.TEST_PASS || '90opklnmA' })
  });
  return await res.json();
}

async function run() {
  const t = await login();
  if (!t || !t.token) return console.error('Login failed', t);
  const token = t.token;

  // get a flower
  let r = await fetchFn(`${BASE}/api/gullar`, { headers: { Authorization: `Bearer ${token}` } });
  const gullar = await r.json();
  if (!gullar || gullar.length === 0) return console.error('No flowers');
  const gul = gullar[0];
  console.log('Using:', gul.nomi, 'kirim', gul.kirim, 'chiqim', gul.chiqim);

  // create waste
  r = await fetchFn(`${BASE}/api/waste`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ gul_id: gul.id, son: 1, reason: 'test-delete' }) });
  const postRes = await r.json();
  console.log('POST waste ->', postRes);
  const wasteId = postRes?.data?.id || postRes?.id;
  if (!wasteId) return console.error('No waste id returned');

  // check gullar after post
  r = await fetchFn(`${BASE}/api/gullar`, { headers: { Authorization: `Bearer ${token}` } });
  const afterPost = await r.json();
  const updated = afterPost.find(x => x.id === gul.id);
  console.log('After POST - chiqim', updated.chiqim);

  // delete waste (use compatibility POST endpoint)
  r = await fetchFn(`${BASE}/api/waste/${wasteId}/delete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const raw = await r.text();
  let delRes;
  try { delRes = JSON.parse(raw); } catch (e) { delRes = raw; }
  console.log('DELETE ->', delRes);

  // check gullar after delete
  r = await fetchFn(`${BASE}/api/gullar`, { headers: { Authorization: `Bearer ${token}` } });
  const afterDel = await r.json();
  const final = afterDel.find(x => x.id === gul.id);
  console.log('After DELETE - chiqim', final.chiqim);
}

run().catch(console.error);
