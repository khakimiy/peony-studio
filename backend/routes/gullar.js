const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// Barcha gullar
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('gullar')
    .select('*')
    .order('nomi');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Gul qo'shish yoki kirim
router.post('/', auth, async (req, res) => {
  const { nomi, kategoriya, kirim, narx_uzs, narx_usd } = req.body;
  if (!nomi || !kirim) return res.status(400).json({ error: 'Nomi va miqdor kiritilishi shart' });

  // Mavjudini tekshirish
  const { data: mavjud } = await supabase
    .from('gullar')
    .select('*')
    .ilike('nomi', nomi)
    .single();

  if (mavjud) {
    // Kirim qo'shish
    const yangiKirim = mavjud.kirim + Number(kirim);
    const { data, error } = await supabase
      .from('gullar')
      .update({ kirim: yangiKirim, narx_uzs: narx_uzs || mavjud.narx_uzs, narx_usd: narx_usd || mavjud.narx_usd })
      .eq('id', mavjud.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: `${nomi} ga ${kirim} ta qo'shildi`, data });
  }

  // Yangi gul
  const { data, error } = await supabase
    .from('gullar')
    .insert([{ nomi, kategoriya, kirim: Number(kirim), chiqim: 0, narx_uzs: narx_uzs || 0, narx_usd: narx_usd || 0 }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Yangi gul qo\'shildi', data });
});

// Gul tahrirlash
router.put('/:id', auth, async (req, res) => {
  const { nomi, kategoriya, narx_uzs, narx_usd } = req.body;
  const { data, error } = await supabase
    .from('gullar')
    .update({ nomi, kategoriya, narx_uzs, narx_usd })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Gul o'chirish
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('gullar').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Gul o\'chirildi' });
});

module.exports = router;