// Dashboard sahifasida token tekshirish
if (!getToken()) window.location.href = 'index.html';

const user = getUser();

// Foydalanuvchi ma'lumotlarini ko'rsatish
document.getElementById('user-name').textContent = user.ism || user.username;
document.getElementById('user-role').textContent = user.rol === 'super_admin' ? '👑 Super Admin' : '🔑 Admin';
document.getElementById('user-av').textContent = (user.ism || user.username || 'A')[0].toUpperCase();

// Super admin bo'lsa Adminlar menyusini ko'rsatish
if (user.rol === 'super_admin') {
  document.getElementById('nav-adminlar').style.display = 'flex';
}

// Sidebar toggle
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Modal
function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// API so'rov
async function apiCall(url, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`http://127.0.0.1:5000/api${url}`, opts);
  if (res.status === 401) { logout(); return null; }
  return await res.json();
}

// Sahifa o'tish
function goPage(page) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  const nav = document.getElementById('nav-' + page);
  if (nav) nav.classList.add('active');
  document.getElementById('topbar-actions').innerHTML = '';

  const titles = {
    dashboard: ['Dashboard', 'Umumiy ko\'rinish'],
    gullar: ['🌸 Gullar ombori', 'Barcha gullar va zaxiralar'],
    suvenir: ['🎁 Suvenir & Shokolad', 'Qo\'shimcha mahsulotlar'],
    buketlar: ['💐 Buket tayyorlash', 'Floristlar ishi'],
    buyurtmalar: ['📋 Buyurtmalar', 'Mijozlar buyurtmalari'],
    waste: ['♻️ Eskirgan gullar', 'Eskirgan yoki tashlangan gullarni boshqarish'],
    report: ['🧾 Hisobot', 'Inventar va umumiy qiymat'],
    finance: ['💰 Pul harakatlari', 'Kassaga kirim/chiqimlar'],
    xodimlar: ['👥 Xodimlar', 'Jamoa a\'zolari'],
    adminlar: ['⚙️ Adminlar', 'Tizim foydalanuvchilari'],
  };

  const [title, sub] = titles[page] || [page, ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-sub').textContent = sub;

  const C = document.getElementById('content');
  C.innerHTML = '<div class="loading"><div class="spinner"></div> Yuklanmoqda...</div>';

  if (page === 'dashboard') renderDashboard();
  else if (page === 'gullar') renderGullar();
  else if (page === 'suvenir') renderSuvenir();
  else if (page === 'buketlar') renderBuketlar();
  else if (page === 'buyurtmalar') renderBuyurtmalar();
  else if (page === 'waste') renderWaste();
  else if (page === 'report') renderReport();
  else if (page === 'finance') renderFinance();
  else if (page === 'xodimlar') renderXodimlar();
  else if (page === 'adminlar') renderAdminlar();
}

// DASHBOARD
async function renderDashboard() {
  const [gullar, buketlar, buyurtmalar, suvenirlar] = await Promise.all([
    apiCall('/gullar'),
    apiCall('/buketlar'),
    apiCall('/buyurtmalar'),
    apiCall('/suvenir'),
  ]);

  const totGul = (gullar || []).reduce((s, g) => s + (g.kirim - g.chiqim), 0);
  const aktiv = (buyurtmalar || []).filter(b => b.status === 'kutilmoqda').length;
  const tayyor = (buyurtmalar || []).filter(b => b.status === 'tayyor').length;
  const totSuv = (suvenirlar || []).reduce((s, x) => s + x.miqdor, 0);

  document.getElementById('content').innerHTML = `
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-icon pink">🌸</div>
        <div>
          <div class="metric-label">Ombordagi gullar</div>
          <div class="metric-value">${totGul}</div>
          <div class="metric-sub">${(gullar||[]).length} xil tur</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">📋</div>
        <div>
          <div class="metric-label">Aktiv buyurtmalar</div>
          <div class="metric-value">${aktiv}</div>
          <div class="metric-sub">${tayyor} ta tayyor</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">💐</div>
        <div>
          <div class="metric-label">Tayyorlangan buketlar</div>
          <div class="metric-value">${(buketlar||[]).length}</div>
          <div class="metric-sub">jami</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">🎁</div>
        <div>
          <div class="metric-label">Suvenir & Shokolad</div>
          <div class="metric-value">${totSuv}</div>
          <div class="metric-sub">${(suvenirlar||[]).length} xil tur</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚠️ Kam qolgan gullar</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Gul</th><th>Qoldiq</th><th>Holat</th></tr></thead>
            <tbody>
              ${(gullar||[]).filter(g=>(g.kirim-g.chiqim)<20).map(g=>{
                const q = g.kirim - g.chiqim;
                return `<tr>
                  <td>${g.nomi}</td>
                  <td><strong style="color:${q<10?'var(--danger)':'var(--warning)'}">${q} ta</strong></td>
                  <td><span class="badge ${q<10?'badge-danger':'badge-warning'}">${q<10?'Kritik':'Kam'}</span></td>
                </tr>`;
              }).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:1rem">✅ Barcha gullar yetarli</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📋 Kutilayotgan buyurtmalar</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mijoz</th><th>Sana</th><th>Vaqt</th></tr></thead>
            <tbody>
              ${(buyurtmalar||[]).filter(b=>b.status==='kutilmoqda').slice(0,5).map(b=>`
                <tr>
                  <td>${b.mijoz_ism}</td>
                  <td>${b.sana}</td>
                  <td><strong>${b.vaqt}</strong></td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:1rem">📭 Buyurtma yo\'q</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">🌸 Gullar zaxirasi</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Gul nomi</th><th>Kategoriya</th><th>Kirim</th><th>Chiqim</th><th>Qoldiq</th><th>Narx UZS</th><th>Zaxira</th></tr></thead>
          <tbody>
            ${(gullar||[]).map(g => {
              const q = g.kirim - g.chiqim;
              const f = g.kirim > 0 ? Math.round((g.chiqim/g.kirim)*100) : 0;
              const col = f>70?'#e24b4a':f>40?'#e09020':'#2d6a4f';
              return `<tr>
                <td><strong>${g.nomi}</strong></td>
                <td>${g.kategoriya||'—'}</td>
                <td>${g.kirim}</td><td>${g.chiqim}</td>
                <td><strong style="color:${q<10?'var(--danger)':'var(--success)'}">${q}</strong></td>
                <td>${Number(g.narx_uzs).toLocaleString()} UZS</td>
                <td>
                  <div class="stock-wrap">
                    <div class="stock-bar"><div class="stock-fill" style="width:${f}%;background:${col}"></div></div>
                    <span class="stock-text">${f}%</span>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// Boshlash
goPage('dashboard');