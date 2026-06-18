const API = 'http://127.0.0.1:5000/api';

// Token saqlash
function saveToken(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || '{}'); }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Login sahifasida token bo'lsa dashboard ga o'tish
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  if (getToken()) window.location.href = 'dashboard.html';
}

// Toggle parol ko'rish
function togglePass() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// Alert ko'rsatish
function showAlert(msg, type = 'danger') {
  const el = document.getElementById('login-alert');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 4000);
}

// Login funksiyasi
async function login() {
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');

  // Login maydonlari bu sahifada yo'q bo'lsa (masalan dashboard'da Enter bosilsa) — chiqib ketamiz
  if (!usernameEl || !passwordEl) return;

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) {
    showAlert('Foydalanuvchi nomi va parolni kiriting!');
    return;
  }

  const btn = document.getElementById('login-btn');
  const text = document.getElementById('login-text');
  const spin = document.getElementById('login-spin');

  btn.disabled = true;
  text.style.display = 'none';
  spin.style.display = 'inline';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Xatolik yuz berdi');
      return;
    }

    saveToken(data.token, data.user);
    showAlert('Muvaffaqiyatli kirildi! Yo\'naltirilmoqda...', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);

  } catch (err) {
    console.error('Login xatosi:', err);
    showAlert('Server bilan bog\'lanib bo\'lmadi: ' + err.message);
  } finally {
    btn.disabled = false;
    text.style.display = 'inline';
    spin.style.display = 'none';
  }
}

// Enter tugmasi bilan login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});