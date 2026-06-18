const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// Barcha xodimlar
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('xodimlar')
    .select('*')
    .order('rol, ism');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Xodim qo'shish
router.post('/', auth, async (req, res) => {
  const { ism, familiya, yosh, tel, manzil, rol } = req.body;
  // rol: 'ceo' | 'menejer' | 'florist'

  if (!ism || !familiya || !rol)
    return res.status(400).json({ error: 'Ism, familiya va rol kiritilishi shart' });

  const { data, error } = await supabase
    .from('xodimlar')
    .insert([{ ism, familiya, yosh, tel, manzil, rol }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Xodim qo\'shildi', data });
});

// Xodim tahrirlash
router.put('/:id', auth, async (req, res) => {
  const { ism, familiya, yosh, tel, manzil, rol } = req.body;
  const { data, error } = await supabase
    .from('xodimlar')
    .update({ ism, familiya, yosh, tel, manzil, rol })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Xodim o'chirish
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('xodimlar').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Xodim o\'chirildi' });
});

module.exports = router;