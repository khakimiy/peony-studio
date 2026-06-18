const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// Barcha suvenirlar
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('suvenirlar')
    .select('*')
    .order('tur, nomi');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Suvenir qo'shish
router.post('/', auth, async (req, res) => {
  const { nomi, tur, miqdor, narx_uzs, narx_usd, tavsif } = req.body;
  // tur: 'suvenir' | 'shokolad'

  if (!nomi || !tur) return res.status(400).json({ error: 'Nomi va turi kiritilishi shart' });

  const { data, error } = await supabase
    .from('suvenirlar')
    .insert([{ nomi, tur, miqdor: miqdor || 0, narx_uzs: narx_uzs || 0, narx_usd: narx_usd || 0, tavsif }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Qo\'shildi', data });
});

// Miqdor yangilash (kirim)
router.put('/:id/kirim', auth, async (req, res) => {
  const { miqdor } = req.body;
  const { data: mavjud } = await supabase.from('suvenirlar').select('miqdor').eq('id', req.params.id).single();
  if (!mavjud) return res.status(404).json({ error: 'Topilmadi' });

  const { data, error } = await supabase
    .from('suvenirlar')
    .update({ miqdor: mavjud.miqdor + Number(miqdor) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Tahrirlash
router.put('/:id', auth, async (req, res) => {
  const { nomi, tur, narx_uzs, narx_usd, tavsif } = req.body;
  const { data, error } = await supabase
    .from('suvenirlar')
    .update({ nomi, tur, narx_uzs, narx_usd, tavsif })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// O'chirish
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('suvenirlar').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'O\'chirildi' });
});

module.exports = router;