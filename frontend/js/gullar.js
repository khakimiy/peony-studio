async function renderGullar() {
  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showGulModal()">+ Yangi gul / Kirim</button>`;

  const gullar = await apiCall('/gullar');
  const jami = (gullar || []).reduce((s, g) => s + (g.kirim - g.chiqim), 0);

  document.getElementById('content').innerHTML = `
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-icon pink">🌸</div>
        <div>
          <div class="metric-label">Jami qoldiq</div>
          <div class="metric-value">${jami}</div>
          <div class="metric-sub">ta gul</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">📦</div>
        <div>
          <div class="metric-label">Gul turlari</div>
          <div class="metric-value">${(gullar||[]).length}</div>
          <div class="metric-sub">xil tur</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">⬇️</div>
        <div>
          <div class="metric-label">Jami kirim</div>
          <div class="metric-value">${(gullar||[]).reduce((s,g)=>s+g.kirim,0)}</div>
          <div class="metric-sub">ta</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">⬆️</div>
        <div>
          <div class="metric-label">Jami chiqim</div>
          <div class="metric-value">${(gullar||[]).reduce((s,g)=>s+g.chiqim,0)}</div>
          <div class="metric-sub">ta</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">🌸 Barcha gullar</span>
        <span style="font-size:12px;color:var(--text3)">Jami ${(gullar||[]).length} tur</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Gul nomi</th>
              
              <th>Kirim</th>
              <th>Chiqim</th>
              <th>Qoldiq</th>
                <th>Narx UZS</th>
              <th>Zaxira holati</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            ${(gullar||[]).map((g, i) => {
              const q = g.kirim - g.chiqim;
              const f = g.kirim > 0 ? Math.round((g.chiqim / g.kirim) * 100) : 0;
              const col = f > 70 ? '#e24b4a' : f > 40 ? '#e09020' : '#2d6a4f';
              const badge = q < 10 ? 'badge-danger' : q < 30 ? 'badge-warning' : 'badge-success';
              const badgeTxt = q < 10 ? 'Kritik' : q < 30 ? 'Kam' : 'Yetarli';
              return `<tr>
                <td style="color:var(--text3)">${i+1}</td>
                <td><strong>${g.nomi}</strong></td>
                
                <td>${g.kirim}</td>
                <td>${g.chiqim}</td>
                <td><strong style="color:${q<10?'var(--danger)':q<30?'var(--warning)':'var(--success)'}">${q} ta</strong></td>
                <td>${Number(g.narx_uzs).toLocaleString()} UZS</td>
                <td>
                  <div class="stock-wrap">
                    <div class="stock-bar"><div class="stock-fill" style="width:${f}%;background:${col}"></div></div>
                    <span class="stock-text">${f}%</span>
                    <span class="badge ${badge}">${badgeTxt}</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;gap:5px">
                    <button class="btn btn-sm" onclick="showGulKirim(${g.id},'${g.nomi}',${q})">+ Kirim</button>
                    <button class="btn btn-sm" onclick="showGulTahrirla(${JSON.stringify(g).replace(/"/g,'&quot;')})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="gulOchir(${g.id},'${g.nomi}')">🗑</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function showGulModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">🌸 Yangi gul qo'shish / Kirim</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="alert alert-info">💡 Agar bu gul allaqachon omborida bo'lsa, miqdor ustiga qo'shiladi.</div>
      <div class="form-row">
        <div class="form-group">
          <label>Gul nomi *</label>
          <input class="form-control" id="g-nomi" placeholder="Masalan: Qizil atirgul">
        </div>
      </div>
      <div class="form-group">
        <label>Kirim miqdori (ta) *</label>
        <input class="form-control" id="g-son" type="number" value="100" min="1">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Narx UZS (1 ta)</label>
          <input class="form-control" id="g-uzs" type="number" placeholder="8000">
        </div>
      </div>
      <div id="g-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="gulSaqla()">💾 Saqlash</button>
    </div>`);

      // no USD field — prices are in UZS only
}

function showGulKirim(id, nomi, qoldiq) {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">📦 ${nomi} — Kirim qo'shish</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--primary-light);border-radius:var(--radius);padding:12px;margin-bottom:1rem;text-align:center">
        <div style="font-size:12px;color:var(--primary)">Joriy qoldiq</div>
        <div style="font-size:28px;font-weight:700;color:var(--primary)">${qoldiq} ta</div>
      </div>
      <div class="form-group">
        <label>Qo'shiladigan miqdor (ta) *</label>
        <input class="form-control" id="gk-son" type="number" value="100" min="1">
      </div>
      <div id="gk-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="gulKirimSaqla(${id},'${nomi}')">+ Qo'shish</button>
    </div>`);
}

function showGulTahrirla(g) {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">✏️ Gul tahrirlash</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Gul nomi *</label>
          <input class="form-control" id="gt-nomi" value="${g.nomi}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Narx UZS</label>
          <input class="form-control" id="gt-uzs" type="number" value="${g.narx_uzs}">
        </div>
      </div>
      <div id="gt-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="gulTahrirlaSaqla(${g.id})">💾 Saqlash</button>
    </div>`);

    // no USD field in edit modal
}

async function gulSaqla() {
  const nomi = document.getElementById('g-nomi').value.trim();
  const kategoriya = null; // kategoriya removed from UI
  const kirim = document.getElementById('g-son').value;
  const narx_uzs = document.getElementById('g-uzs').value;
  const al = document.getElementById('g-alert');
  if (!nomi || !kirim) { al.innerHTML = '<div class="alert alert-danger">Nomi va miqdor kiritilishi shart!</div>'; return; }
  const res = await apiCall('/gullar', 'POST', { nomi, kategoriya, kirim, narx_uzs });
  if (res.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = `<div class="alert alert-success">✅ ${res.message}</div>`;
  setTimeout(() => { closeModal(); renderGullar(); }, 1000);
}

async function gulKirimSaqla(id, nomi) {
  const son = document.getElementById('gk-son').value;
  const al = document.getElementById('gk-alert');
  if (!son || son <= 0) { al.innerHTML = '<div class="alert alert-danger">Miqdor kiritilishi shart!</div>'; return; }
  const res = await apiCall('/gullar', 'POST', { nomi, kirim: son });
  if (res.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = `<div class="alert alert-success">✅ ${son} ta qo'shildi!</div>`;
  setTimeout(() => { closeModal(); renderGullar(); }, 1000);
}

async function gulTahrirlaSaqla(id) {
  const nomi = document.getElementById('gt-nomi').value.trim();
  const kategoriya = null; // kategoriya removed from UI
  const narx_uzs = document.getElementById('gt-uzs').value;
  const al = document.getElementById('gt-alert');
  const res = await apiCall(`/gullar/${id}`, 'PUT', { nomi, kategoriya, narx_uzs });
  if (res.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Saqlandi!</div>';
  setTimeout(() => { closeModal(); renderGullar(); }, 1000);
}

async function gulOchir(id, nomi) {
  if (!confirm(`"${nomi}" ni o'chirishni tasdiqlaysizmi?`)) return;
  const res = await apiCall(`/gullar/${id}`, 'DELETE');
  if (res.error) { alert(res.error); return; }
  renderGullar();
}

// USD removed — prices stored only in UZS