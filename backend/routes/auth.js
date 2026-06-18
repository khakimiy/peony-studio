const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username va parol kiritilishi shart' });

  const { data: user, error } = await supabase
    .from('adminlar')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user)
    return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: 'Parol noto\'g\'ri' });

  const token = jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, ism: user.ism, rol: user.rol } });
});

// Admin qo'shish (faqat super_admin)
router.post('/admin-qosh', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'super_admin')
    return res.status(403).json({ error: 'Faqat Super Admin admin qo\'sha oladi' });

  const { username, password, ism, rol } = req.body;
  if (!username || !password || !ism)
    return res.status(400).json({ error: 'Barcha maydonlar kiritilishi shart' });

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('adminlar')
    .insert([{ username, password: hashed, ism, rol: rol || 'admin' }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Admin qo\'shildi', admin: { id: data.id, username: data.username, ism: data.ism, rol: data.rol } });
});

// Adminlar ro'yxati (faqat super_admin)
router.get('/adminlar', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'super_admin')
    return res.status(403).json({ error: 'Ruxsat yo\'q' });

  const { data, error } = await supabase
    .from('adminlar')
    .select('id, username, ism, rol, created_at')
    .order('created_at');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Admin o'chirish (faqat super_admin)
router.delete('/adminlar/:id', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'super_admin')
    return res.status(403).json({ error: 'Ruxsat yo\'q' });

  const { error } = await supabase
    .from('adminlar')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Admin o\'chirildi' });
});

module.exports = router;