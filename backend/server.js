require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// Har bir so'rovni logga yozish (nima kelganini ko'rish uchun)
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gullar', require('./routes/gullar'));
app.use('/api/buketlar', require('./routes/buketlar'));
app.use('/api/buyurtmalar', require('./routes/buyurtmalar'));
app.use('/api/suvenir', require('./routes/suvenir'));
app.use('/api/xodimlar', require('./routes/xodimlar'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/report', require('./routes/report'));

app.get('/', (req, res) => {
  res.json({ message: '🌸 Peony Studio API ishlayapti!' });
});

// 404 — topilmagan yo'l
app.use((req, res) => {
  console.log(`❌ Topilmadi: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Yo\'l topilmadi: ' + req.url });
});

// GLOBAL XATO USHLAGICH — har qanday yashirin xatoni ko'rsatadi
app.use((err, req, res, next) => {
  console.log('🔴🔴🔴 SERVER XATOSI 🔴🔴🔴');
  console.log(err); // to'liq xato shu yerda chiqadi
  res.status(500).json({ error: 'Server xatosi: ' + (err.message || 'noma\'lum xato') });
});

// Kutilmagan xatolarni ham ushlash (process darajasida)
process.on('uncaughtException', (err) => {
  console.log('🔴 KUTILMAGAN XATO:', err);
});
process.on('unhandledRejection', (err) => {
  console.log('🔴 PROMISE XATOSI:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('==============================================');
  console.log('🆕 YANGI SERVER.JS ISHGA TUSHDI — VERSIYA 2');
  console.log(`✅ Server ${PORT} portda ishlamoqda`);
  console.log('==============================================');
});