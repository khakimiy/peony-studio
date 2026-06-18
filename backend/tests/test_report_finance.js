// Test report and finance endpoints: login, fetch inventory, create/list/delete finance
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

  // report
  let r = await fetchFn(`${BASE}/api/report/inventory`, { headers: { Authorization: `Bearer ${token}` } });
  const report = await r.json();
  console.log('REPORT:', report && report.itemCount ? `items=${report.itemCount} total=${report.totalValue}` : report);

  // create finance in
  r = await fetchFn(`${BASE}/api/finance`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'in', party: 'Mijoz', reason: 'Test kirim', amount: 10000 }) });
  const inRes = await r.json();
  console.log('FINANCE POST IN ->', inRes);

  // list finance
  r = await fetchFn(`${BASE}/api/finance`, { headers: { Authorization: `Bearer ${token}` } });
  const fl = await r.json();
  console.log('FINANCE LIST length=', Array.isArray(fl)?fl.length:fl);

  // create finance out
  r = await fetchFn(`${BASE}/api/finance`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'out', party: 'Yetkazuvchi', reason: 'Test chiqim', amount: 2500 }) });
  const outRes = await r.json();
  console.log('FINANCE POST OUT ->', outRes);

  // delete the IN entry created earlier (if id present)
  const createdId = inRes?.data?.id || inRes?.id;
  if (createdId) {
    r = await fetchFn(`${BASE}/api/finance/${createdId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const del = await r.json().catch(()=>null);
    console.log('DELETE IN ->', del || 'no-json');
  }
}

run().catch(console.error);
