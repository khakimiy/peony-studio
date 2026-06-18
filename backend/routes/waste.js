const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// Ro'yxat — eskirgan gullar logi (agar jadval mavjud bo'lsa)
router.get('/', auth, async (req, res) => {
  // Try to join waste records with flower names if possible
  const { data, error } = await supabase
    .from('waste')
    .select('*, gullar(id, nomi)')
    .order('created_at', { ascending: false });

  // If above fails (different schema), fallback to plain select
  if (error) {
    const { data: plain, error: e2 } = await supabase.from('waste').select('*').order('created_at', { ascending: false });
    if (e2) return res.status(400).json({ error: e2.message });
    return res.json(plain);
  }

  // Map to include `nomi` on each record when available
  const mapped = (data || []).map(w => {
    const nomi = w.gullar && w.gullar.nomi ? w.gullar.nomi : null;
    return { ...w, nomi };
  });
  res.json(mapped);
});

// Eskirgan gul(lar)ni qayd etish va ombordan chiqim sifatida belgilash
router.post('/', auth, async (req, res) => {
  const { gul_id, son, reason } = req.body;
  if (!gul_id || !son) return res.status(400).json({ error: 'gul_id va son kiritilishi shart' });

  // Gulni tekshirish (gul_id may be uuid or numeric id depending on your schema)
  const { data: gul, error: gErr } = await supabase.from('gullar').select('kirim, chiqim').eq('id', gul_id).single();
  if (gErr || !gul) return res.status(400).json({ error: 'Gul topilmadi' });

  const qty = Number(son);
  if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: "son ijobiy son bo'lishi kerak" });

  // Try to insert into waste first; if waste table missing, continue to update inventory and warn
  try {
    const { data: wData, error: wErr } = await supabase
      .from('waste')
      .insert([{ gul_id, son: qty, reason: reason || null }])
      .select()
      .single();

    if (wErr) {
      const msg = String(wErr.message || wErr).toLowerCase();
      // If table not found or schema issue, still update inventory
      if (msg.includes('could not find') || msg.includes('schema') || msg.includes('table') || msg.includes('does not exist')) {
        const newChiqim = (gul.chiqim || 0) + qty;
        const { error: updErr } = await supabase.from('gullar').update({ chiqim: newChiqim }).eq('id', gul_id);
        if (updErr) return res.status(400).json({ error: updErr.message });
        return res.json({ message: 'Gullar ombordan chiqarildi (waste log saqlanmadi)', warning: wErr.message });
      }
      return res.status(400).json({ error: wErr.message || String(wErr) });
    }

    // success: update gullar chiqim
    const newChiqim = (gul.chiqim || 0) + qty;
    const { error: updErr } = await supabase.from('gullar').update({ chiqim: newChiqim }).eq('id', gul_id);
    if (updErr) return res.status(400).json({ error: updErr.message });

    return res.json({ message: 'Gul eskirdi — ombordagi chiqim yangilandi', data: wData });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/waste/:id - delete waste record and decrement gullar.chiqim accordingly
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Id kerak' });

  try {
    // fetch the waste row to know gul_id and son
    const { data: rows, error: fetchErr } = await supabase
      .from('waste')
      .select('id, gul_id, son')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      // If table doesn't exist or RLS blocks, return informative error
      return res.status(500).json({ error: fetchErr.message || String(fetchErr) });
    }

    if (!rows) return res.status(404).json({ error: 'Topilmadi' });

    const gul_id = rows.gul_id;
    const son = Number(rows.son) || 0;

    // delete the waste row
    const { error: delErr } = await supabase
      .from('waste')
      .delete()
      .eq('id', id);

    if (delErr) {
      return res.status(500).json({ error: delErr.message || String(delErr) });
    }

    // decrement gullar.chiqim by son (don't go below 0)
    const { data: g, error: gErr } = await supabase
      .from('gullar')
      .select('id, kirim, chiqim')
      .eq('id', gul_id)
      .limit(1)
      .maybeSingle();

    if (gErr) {
      // return success for deletion but warn about inventory
      return res.json({ message: 'O‘chirildi, ammo ombordagi miqdor yangilanmadi', warning: gErr.message });
    }

    if (g) {
      const newChiqim = Math.max(0, (Number(g.chiqim) || 0) - son);
      const { error: upErr } = await supabase
        .from('gullar')
        .update({ chiqim: newChiqim })
        .eq('id', gul_id);

      if (upErr) {
        return res.json({ message: 'O‘chirildi, ammo ombordagi miqdor yangilanmadi', warning: upErr.message });
      }
    }

    return res.json({ message: 'O‘chirildi' });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;

// Compatibility: allow POST /:id/delete for environments where DELETE isn't accepted
router.post('/:id/delete', auth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Id kerak' });
  try {
    // reuse the same logic as DELETE
    const { data: rows, error: fetchErr } = await supabase
      .from('waste')
      .select('id, gul_id, son')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (fetchErr) return res.status(500).json({ error: fetchErr.message || String(fetchErr) });
    if (!rows) return res.status(404).json({ error: 'Topilmadi' });

    const gul_id = rows.gul_id;
    const son = Number(rows.son) || 0;

    const { error: delErr } = await supabase.from('waste').delete().eq('id', id);
    if (delErr) return res.status(500).json({ error: delErr.message || String(delErr) });

    const { data: g, error: gErr } = await supabase.from('gullar').select('id, kirim, chiqim').eq('id', gul_id).limit(1).maybeSingle();
    if (gErr) return res.json({ message: 'O‘chirildi, ammo ombordagi miqdor yangilanmadi', warning: gErr.message });

    if (g) {
      const newChiqim = Math.max(0, (Number(g.chiqim) || 0) - son);
      const { error: upErr } = await supabase.from('gullar').update({ chiqim: newChiqim }).eq('id', gul_id);
      if (upErr) return res.json({ message: 'O‘chirildi, ammo ombordagi miqdor yangilanmadi', warning: upErr.message });
    }

    return res.json({ message: 'O‘chirildi' });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

