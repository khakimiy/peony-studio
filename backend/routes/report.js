const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// GET /api/report/inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    const { data: gullar, error: gErr } = await supabase.from('gullar').select('id, nomi, kirim, chiqim, narx_uzs');
    if (gErr) return res.status(400).json({ error: gErr.message });

    // Try the expected table name first. Some DBs might use a different name
    // (e.g. 'suvenir' vs 'suvenirlar') depending on migrations or manual SQL.
    let suvenir = null;
    let sErr = null;
    try {
      const resp = await supabase.from('suvenirlar').select('id, nomi, miqdor, narx_uzs');
      suvenir = resp.data;
      sErr = resp.error;
    } catch (e) {
      sErr = e;
    }

    // If first attempt failed due to missing table, try the alternate singular name.
    if (sErr && /suvenir/i.test(String(sErr.message || sErr))) {
      try {
        const resp2 = await supabase.from('suvenir').select('id, nomi, miqdor, narx_uzs');
        suvenir = resp2.data;
        sErr = resp2.error;
      } catch (e2) {
        sErr = e2;
      }
    }

    if (sErr) return res.status(400).json({ error: String(sErr.message || sErr) });

    const items = [];
    let totalValue = 0;

    (gullar || []).forEach(g => {
      const qty = (Number(g.kirim) || 0) - (Number(g.chiqim) || 0);
      const unit = Number(g.narx_uzs) || 0;
      const value = qty * unit;
      totalValue += value;
      items.push({ type: 'gul', id: g.id, nomi: g.nomi, qty, unit_price: unit, total: value });
    });

    (suvenir || []).forEach(s => {
      const qty = Number(s.miqdor) || 0;
      const unit = Number(s.narx_uzs) || 0;
      const value = qty * unit;
      totalValue += value;
      items.push({ type: 'suvenir', id: s.id, nomi: s.nomi, qty, unit_price: unit, total: value });
    });

    res.json({ items, totalValue, itemCount: items.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
