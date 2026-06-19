const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// Barcha buketlar (tarkib bilan)
router.get('/', auth, async (req, res) => {
  const { data: buketlar, error } = await supabase
    .from('buketlar')
    .select('*, buket_tarkib(*, gullar(id, nomi, narx_uzs, narx_usd))')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(buketlar);
});

// Buket tayyorlash — ombordan ayirish
router.post('/tayyorla', auth, async (req, res) => {
  const { florist_id, buket_nomi, tarkib, foiz, miqdor } = req.body;
  // tarkib: [{gul_id, son}]

  if (!tarkib || !tarkib.length)
    return res.status(400).json({ error: 'Tarkib kiritilishi shart' });

  // Omborni tekshirish va narx hisoblash
  let jami_narx_uzs = 0;
  let jami_narx_usd = 0;

  for (const item of tarkib) {
    const { data: gul, error } = await supabase
      .from('gullar')
      .select('*')
      .eq('id', item.gul_id)
      .single();

    if (error || !gul) return res.status(400).json({ error: `Gul topilmadi (id: ${item.gul_id})` });

    const qoldiq = gul.kirim - gul.chiqim;
    const kerak = item.son * (miqdor || 1);

    if (qoldiq < kerak)
      return res.status(400).json({ error: `"${gul.nomi}" yetarli emas! Kerak: ${kerak}, Bor: ${qoldiq}` });

    jami_narx_uzs += gul.narx_uzs * item.son;
    jami_narx_usd += gul.narx_usd * item.son;
  }

  // Foiz qo'shish (tayyorlash haqqi)
  const f = (foiz || 0) / 100;
  const narx_uzs = Math.round(jami_narx_uzs * (1 + f));

  // Buket saqlash
  // Insert only fields present in the DB schema to avoid schema cache errors
  const { data: buket, error: bError } = await supabase
    .from('buketlar')
    .insert([{ nomi: buket_nomi, miqdor: miqdor || 1, tayyorlash_foiz: foiz || 0, narx_uzs }])
    .select()
    .single();

  if (bError) return res.status(400).json({ error: bError.message || String(bError) });

  // Tarkib saqlash va ombordan ayirish
  for (const item of tarkib) {
    await supabase.from('buket_tarkib').insert([{ buket_id: buket.id, gul_id: item.gul_id, son: item.son }]);

    const { data: gul } = await supabase.from('gullar').select('chiqim').eq('id', item.gul_id).single();
    await supabase.from('gullar').update({ chiqim: gul.chiqim + item.son * (miqdor || 1) }).eq('id', item.gul_id);
  }

  res.json({ message: 'Buket tayyorlandi!', buket, narx_uzs });
});

// Buket o'chirish
router.delete('/:id', auth, async (req, res) => {
  const buketId = req.params.id;

  // 1) Buket tarkibini o'qiymiz
  const { data: tarkib, error: tErr } = await supabase.from('buket_tarkib').select('*').eq('buket_id', buketId);
  if (tErr) return res.status(400).json({ error: tErr.message || String(tErr) });

  // 2) Har bir tarkib elementi bo'yicha gullar chiqimini kamaytiramiz (omborga qaytarish)
  for (const item of tarkib || []) {
    try {
      const { data: gul, error: gErr } = await supabase.from('gullar').select('chiqim').eq('id', item.gul_id).single();
      if (gErr || !gul) continue;
      const newChiqim = Math.max(0, (gul.chiqim || 0) - (item.son || 0));
      await supabase.from('gullar').update({ chiqim: newChiqim }).eq('id', item.gul_id);
    } catch (err) {
      // skip error for this item but continue processing others
      console.warn('Error restoring gul:', err);
    }
  }

  // 3) Buket tarkibini o'chirish
  const { error: delTarkibErr } = await supabase.from('buket_tarkib').delete().eq('buket_id', buketId);
  if (delTarkibErr) return res.status(400).json({ error: delTarkibErr.message || String(delTarkibErr) });

  // 4) Buket o'chirish
  const { error: delBError } = await supabase.from('buketlar').delete().eq('id', buketId);
  if (delBError) return res.status(400).json({ error: delBError.message || String(delBError) });

  res.json({ message: 'Buket o\'chirildi va gullar omborga qaytarildi' });
});

module.exports = router;