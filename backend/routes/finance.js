const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// List transactions
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase.from('finance').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

// Create transaction
router.post('/', auth, async (req, res) => {
  const { type, party, reason, amount } = req.body;
  if (!type || !['in','out'].includes(type)) return res.status(400).json({ error: 'type in|out bo\'lishi kerak' });
  if (!amount || isNaN(Number(amount))) return res.status(400).json({ error: 'amount raqam bo\'lishi kerak' });

  const row = { type, party: party || null, reason: reason || null, amount: Number(amount) };
  const { data, error } = await supabase.from('finance').insert([row]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Transaction saqlandi', data });
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('finance').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'O\'chirildi' });
});

module.exports = router;
