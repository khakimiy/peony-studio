const router = require('express').Router();
const supabase = require('../supabase');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Barcha buyurtmalar
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('buyurtmalar')
    .select('*')
    .order('sana', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Buyurtma qo'shish
router.post('/', auth, async (req, res) => {
  const { mijoz_ism, mijoz_tel, buket_nomi, gullar_tarkib, sana, vaqt, narx_uzs, narx_usd, izoh } = req.body;

  if (!mijoz_ism || !sana || !vaqt)
    return res.status(400).json({ error: 'Mijoz ismi, sana va vaqt kiritilishi shart' });

  // Prepare payload and attempt insert. If Supabase reports missing columns
  // in the schema cache, remove them from payload and retry. Also ensure an
  // `id` value exists for tables that require it: try UUID first, then
  // fallback to numeric id using the current max.
  const payload = {
    mijoz_ism,
    mijoz_tel,
    buket_nomi,
    gullar_tarkib,
    sana,
    vaqt,
    narx_uzs: narx_uzs || 0,
    narx_usd: narx_usd || 0,
    izoh,
    status: 'kutilmoqda'
  };

  // Generate an id (UUID) to avoid "null value in column \"id\"" errors
  try {
    if (!Object.prototype.hasOwnProperty.call(payload, 'id')) payload.id = crypto.randomUUID();
  } catch (e) {
    // crypto.randomUUID may not be available; ignore and continue
  }

  // Proactive mappings: many DB schemas use different column names.
  if (!Object.prototype.hasOwnProperty.call(payload, 'mijoz') && Object.prototype.hasOwnProperty.call(payload, 'mijoz_ism')) {
    payload.mijoz = payload.mijoz_ism; delete payload.mijoz_ism;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'tarkib') && Object.prototype.hasOwnProperty.call(payload, 'gullar_tarkib')) {
    payload.tarkib = payload.gullar_tarkib; delete payload.gullar_tarkib;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'narx') && Object.prototype.hasOwnProperty.call(payload, 'narx_uzs')) {
    payload.narx = payload.narx_uzs; /* keep narx_uzs as well */
  }

  let attempts = 0;
  let result, err;
  while (attempts < 8) {
    const r = await supabase.from('buyurtmalar').insert([payload]).select().single();
    result = r.data;
    err = r.error;
    if (!err) break;

    const msg = String(err.message || err);
    const match = msg.match(/Could not find the '(.+?)' column/);
    if (match && match[1]) {
      const col = match[1];
      // Try to map common frontend fields to DB columns before removing
      const map = (from, to) => { if (Object.prototype.hasOwnProperty.call(payload, from) && !Object.prototype.hasOwnProperty.call(payload, to)) { payload[to] = payload[from]; delete payload[from]; return true; } return false; };

      let mapped = false;
      if (col === 'mijoz') mapped = map('mijoz_ism', 'mijoz');
      if (!mapped && (col.includes('buket') || col.includes('nomi'))) mapped = map('buket_nomi', col);
      if (!mapped && (col.includes('gullar') || col.includes('tarkib'))) mapped = map('gullar_tarkib', col);
      if (!mapped && col.includes('narx')) mapped = map('narx_uzs', col) || map('narx_usd', col);
      if (!mapped && col === 'mijoz_tel') mapped = map('mijoz_tel', col);

      if (!mapped) {
        if (Object.prototype.hasOwnProperty.call(payload, col)) delete payload[col];
      }

      attempts++;
      continue;
    }

    // If error indicates id type/format problem or still null id, try numeric id fallback
    if (/null value in column "id"|invalid input syntax for type integer|invalid input syntax for type uuid/i.test(msg)) {
      // attempt to fetch current max id and use next integer
      const last = await supabase.from('buyurtmalar').select('id').order('id', { ascending: false }).limit(1);
      if (last.error) return res.status(400).json({ error: String(last.error.message || last.error) });
      const lastId = last.data && last.data[0] && last.data[0].id;
      const nextId = lastId && !isNaN(parseInt(lastId)) ? (parseInt(lastId) + 1) : 1;
      payload.id = nextId;
      attempts++;
      continue;
    }

    // If error is not missing-column, stop and return it
    return res.status(400).json({ error: msg });
  }

  if (err) return res.status(400).json({ error: String(err.message || err) });
  res.json({ message: 'Buyurtma qo\'shildi', data: result });
});

// Status o'zgartirish (tayyor ✓ yoki bekor ✗)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  // status: 'tayyor' | 'bekor' | 'kutilmoqda'

  const { data, error } = await supabase
    .from('buyurtmalar')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Buyurtma tahrirlash
router.put('/:id', auth, async (req, res) => {
  const { mijoz_ism, mijoz_tel, buket_nomi, gullar_tarkib, sana, vaqt, narx_uzs, narx_usd, izoh } = req.body;

  // Build update payload and retry if Supabase reports missing columns
  const payload = { mijoz_ism, mijoz_tel, buket_nomi, gullar_tarkib, sana, vaqt, narx_uzs, narx_usd, izoh };
  let attempts = 0;
  let updResult, updError;
  while (attempts < 8) {
    const r = await supabase.from('buyurtmalar').update(payload).eq('id', req.params.id).select().single();
    updResult = r.data;
    updError = r.error;
    if (!updError) break;

    const msg = String(updError.message || updError);
    const match = msg.match(/Could not find the '(.+?)' column/);
    if (match && match[1]) {
      const col = match[1];
      if (Object.prototype.hasOwnProperty.call(payload, col)) delete payload[col];
      attempts++;
      continue;
    }

    return res.status(400).json({ error: msg });
  }

  if (updError) return res.status(400).json({ error: String(updError.message || updError) });
  res.json(updResult);
});

// Buyurtma o'chirish
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('buyurtmalar').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Buyurtma o\'chirildi' });
});

module.exports = router;