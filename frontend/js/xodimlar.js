// ===== XODIMLAR =====
async function renderXodimlar() {
  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showXodimModal()">+ Xodim qo'shish</button>`;

  const xodimlar = await apiCall('/xodimlar');

  const ceo = (xodimlar||[]).filter(x => x.rol === 'ceo');
  const menejerlar = (xodimlar||[]).filter(x => x.rol === 'menejer');
  const floristlar = (xodimlar||[]).filter(x => x.rol === 'florist');

  function xodimCard(x) {
    const initials = (x.ism[0] + x.familiya[0]).toUpperCase();
    const rolBadge = x.rol === 'ceo' ? 'badge-danger' : x.rol === 'menejer' ? 'badge-warning' : 'badge-success';
    const rolText = x.rol === 'ceo' ? '👑 CEO' : x.rol === 'menejer' ? '📊 Menejer' : '🌸 Florist';
    return `<div class="xodim-card">
      <div class="xodim-av">${initials}</div>
      <div class="xodim-name">${x.ism} ${x.familiya}</div>
      <span class="badge ${rolBadge}">${rolText}</span>
      <div class="xodim-info">
        ${x.yosh ? `🎂 ${x.yosh} yosh<br>` : ''}
        ${x.tel ? `📞 ${x.tel}<br>` : ''}
        ${x.manzil ? `🏠 ${x.manzil}` : ''}
      </div>
      <div class="xodim-actions">
        <button class="btn btn-sm" onclick="showXodimTahrirla(${JSON.stringify(x).replace(/"/g,'&quot;')})">✏️ Tahrirla</button>
        <button class="btn btn-sm btn-danger" onclick="xodimOchir(${x.id},'${x.ism}')">🗑</button>
      </div>
    </div>`;
  }

  document.getElementById('content').innerHTML = `
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-icon pink">👑</div>
        <div><div class="metric-label">CEO</div><div class="metric-value">${ceo.length}</div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">📊</div>
        <div><div class="metric-label">Menejerlar</div><div class="metric-value">${menejerlar.length}</div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">🌸</div>
        <div><div class="metric-label">Floristlar</div><div class="metric-value">${floristlar.length}</div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">👥</div>
        <div><div class="metric-label">Jami xodimlar</div><div class="metric-value">${(xodimlar||[]).length}</div></div>
      </div>
    </div>

    ${ceo.length ? `
    <div class="card">
      <div class="card-header"><span class="card-title">👑 CEO</span></div>
      <div class="card-body"><div class="xodim-grid">${ceo.map(xodimCard).join('')}</div></div>
    </div>` : ''}

    ${menejerlar.length ? `
    <div class="card">
      <div class="card-header"><span class="card-title">📊 Menejerlar</span></div>
      <div class="card-body"><div class="xodim-grid">${menejerlar.map(xodimCard).join('')}</div></div>
    </div>` : ''}

    ${floristlar.length ? `
    <div class="card">
      <div class="card-header"><span class="card-title">🌸 Floristlar</span></div>
      <div class="card-body"><div class="xodim-grid">${floristlar.map(xodimCard).join('')}</div></div>
    </div>` : ''}

    ${!(xodimlar||[]).length ? `<div class="empty-state"><div class="empty-icon">👥</div><p>Hali xodim qo'shilmagan</p></div>` : ''}`;
}

function showXodimModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">👤 Yangi xodim qo'shish</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Ism *</label>
          <input class="form-control" id="xo-ism" placeholder="Ism">
        </div>
        <div class="form-group">
          <label>Familiya *</label>
          <input class="form-control" id="xo-fam" placeholder="Familiya">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Yoshi</label>
          <input class="form-control" id="xo-yosh" type="number" placeholder="25">
        </div>
        <div class="form-group">
          <label>Roli *</label>
          <select class="form-control" id="xo-rol">
            <option value="ceo">👑 CEO</option>
            <option value="menejer">📊 Menejer</option>
            <option value="florist" selected>🌸 Florist</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Telefon raqami</label>
        <input class="form-control" id="xo-tel" placeholder="+998 90 xxx xxxx">
      </div>
      <div class="form-group">
        <label>Uy manzili</label>
        <textarea class="form-control" id="xo-manzil" placeholder="Shahar, ko'cha, uy raqami..."></textarea>
      </div>
      <div id="xo-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="xodimSaqla()">💾 Saqlash</button>
    </div>`);
}

function showXodimTahrirla(x) {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">✏️ Xodim tahrirlash</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Ism *</label>
          <input class="form-control" id="xt-ism" value="${x.ism}">
        </div>
        <div class="form-group">
          <label>Familiya *</label>
          <input class="form-control" id="xt-fam" value="${x.familiya}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Yoshi</label>
          <input class="form-control" id="xt-yosh" type="number" value="${x.yosh||''}">
        </div>
        <div class="form-group">
          <label>Roli *</label>
          <select class="form-control" id="xt-rol">
            <option value="ceo" ${x.rol==='ceo'?'selected':''}>👑 CEO</option>
            <option value="menejer" ${x.rol==='menejer'?'selected':''}>📊 Menejer</option>
            <option value="florist" ${x.rol==='florist'?'selected':''}>🌸 Florist</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Telefon raqami</label>
        <input class="form-control" id="xt-tel" value="${x.tel||''}">
      </div>
      <div class="form-group">
        <label>Uy manzili</label>
        <textarea class="form-control" id="xt-manzil">${x.manzil||''}</textarea>
      </div>
      <div id="xt-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="xodimTahrirlaSaqla(${x.id})">💾 Saqlash</button>
    </div>`);
}

async function xodimSaqla() {
  const ism = document.getElementById('xo-ism').value.trim();
  const familiya = document.getElementById('xo-fam').value.trim();
  const yosh = document.getElementById('xo-yosh').value;
  const rol = document.getElementById('xo-rol').value;
  const tel = document.getElementById('xo-tel').value.trim();
  const manzil = document.getElementById('xo-manzil').value.trim();
  const al = document.getElementById('xo-alert');
  if (!ism || !familiya) { al.innerHTML = '<div class="alert alert-danger">Ism va familiya kiritilishi shart!</div>'; return; }
  const res = await apiCall('/xodimlar', 'POST', { ism, familiya, yosh, rol, tel, manzil });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Xodim qo\'shildi!</div>';
  setTimeout(() => { closeModal(); renderXodimlar(); }, 1000);
}

async function xodimTahrirlaSaqla(id) {
  const ism = document.getElementById('xt-ism').value.trim();
  const familiya = document.getElementById('xt-fam').value.trim();
  const yosh = document.getElementById('xt-yosh').value;
  const rol = document.getElementById('xt-rol').value;
  const tel = document.getElementById('xt-tel').value.trim();
  const manzil = document.getElementById('xt-manzil').value.trim();
  const al = document.getElementById('xt-alert');
  const res = await apiCall(`/xodimlar/${id}`, 'PUT', { ism, familiya, yosh, rol, tel, manzil });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Saqlandi!</div>';
  setTimeout(() => { closeModal(); renderXodimlar(); }, 1000);
}

async function xodimOchir(id, ism) {
  if (!confirm(`"${ism}" ni o'chirishni tasdiqlaysizmi?`)) return;
  await apiCall(`/xodimlar/${id}`, 'DELETE');
  renderXodimlar();
}

// ===== ADMINLAR (faqat super_admin) =====
async function renderAdminlar() {
  if (getUser().rol !== 'super_admin') {
    document.getElementById('content').innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><p>Ruxsat yo\'q</p></div>';
    return;
  }

  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showAdminModal()">+ Admin qo'shish</button>`;

  const adminlar = await apiCall('/auth/adminlar');

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">⚙️ Tizim adminlari</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Username</th><th>Ismi</th><th>Roli</th><th>Qo'shilgan</th><th>Amal</th></tr></thead>
          <tbody>
            ${(adminlar||[]).map((a, i) => `<tr>
              <td>${i+1}</td>
              <td><strong>${a.username}</strong></td>
              <td>${a.ism}</td>
              <td><span class="badge ${a.rol==='super_admin'?'badge-danger':'badge-info'}">${a.rol==='super_admin'?'👑 Super Admin':'🔑 Admin'}</span></td>
              <td>${new Date(a.created_at).toLocaleDateString('uz-UZ')}</td>
              <td>${a.rol !== 'super_admin' ? `<button class="btn btn-sm btn-danger" onclick="adminOchir(${a.id},'${a.username}')">🗑 O'chirish</button>` : '<span style="color:var(--text3);font-size:12px">O\'chirib bo\'lmaydi</span>'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function showAdminModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">⚙️ Yangi admin qo'shish</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Ismi *</label>
        <input class="form-control" id="ad-ism" placeholder="To'liq ism">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Username *</label>
          <input class="form-control" id="ad-user" placeholder="username">
        </div>
        <div class="form-group">
          <label>Parol *</label>
          <input class="form-control" id="ad-pass" type="password" placeholder="••••••••">
        </div>
      </div>
      <div class="form-group">
        <label>Roli</label>
        <select class="form-control" id="ad-rol">
          <option value="admin">🔑 Admin</option>
        </select>
        <div class="form-hint">Super Admin faqat 1 ta bo'ladi</div>
      </div>
      <div id="ad-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="adminSaqla()">💾 Saqlash</button>
    </div>`);
}

async function adminSaqla() {
  const ism = document.getElementById('ad-ism').value.trim();
  const username = document.getElementById('ad-user').value.trim();
  const password = document.getElementById('ad-pass').value;
  const rol = document.getElementById('ad-rol').value;
  const al = document.getElementById('ad-alert');
  if (!ism || !username || !password) { al.innerHTML = '<div class="alert alert-danger">Barcha maydonlar kiritilishi shart!</div>'; return; }
  const res = await apiCall('/auth/admin-qosh', 'POST', { ism, username, password, rol });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Admin qo\'shildi!</div>';
  setTimeout(() => { closeModal(); renderAdminlar(); }, 1000);
}

async function adminOchir(id, username) {
  if (!confirm(`"${username}" adminni o'chirishni tasdiqlaysizmi?`)) return;
  await apiCall(`/auth/adminlar/${id}`, 'DELETE');
  renderAdminlar();
}