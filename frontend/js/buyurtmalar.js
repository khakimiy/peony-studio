async function renderBuyurtmalar() {
  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showBuyurtmaModal()">+ Buyurtma qo'shish</button>`;

  const buyurtmalar = await apiCall('/buyurtmalar');

  const kutilmoqda = (buyurtmalar||[]).filter(b => b.status === 'kutilmoqda');
  const tayyor = (buyurtmalar||[]).filter(b => b.status === 'tayyor');
  const bekor = (buyurtmalar||[]).filter(b => b.status === 'bekor');

  document.getElementById('content').innerHTML = `
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-icon orange">⏳</div>
        <div>
          <div class="metric-label">Kutilmoqda</div>
          <div class="metric-value">${kutilmoqda.length}</div>
          <div class="metric-sub">ta buyurtma</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">✅</div>
        <div>
          <div class="metric-label">Tayyor</div>
          <div class="metric-value">${tayyor.length}</div>
          <div class="metric-sub">ta buyurtma</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon pink">❌</div>
        <div>
          <div class="metric-label">Bekor</div>
          <div class="metric-value">${bekor.length}</div>
          <div class="metric-sub">ta buyurtma</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">📋</div>
        <div>
          <div class="metric-label">Jami</div>
          <div class="metric-value">${(buyurtmalar||[]).length}</div>
          <div class="metric-sub">ta buyurtma</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">📋 Barcha buyurtmalar</span>
      </div>
      <div class="tabs" style="padding:0 1.25rem">
        <button class="tab active" onclick="filterBuyurtma('barchasi',this)">Barchasi (${(buyurtmalar||[]).length})</button>
        <button class="tab" onclick="filterBuyurtma('kutilmoqda',this)">⏳ Kutilmoqda (${kutilmoqda.length})</button>
        <button class="tab" onclick="filterBuyurtma('tayyor',this)">✅ Tayyor (${tayyor.length})</button>
        <button class="tab" onclick="filterBuyurtma('bekor',this)">❌ Bekor (${bekor.length})</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Buket</th>
              <th>Gullar tarkibi</th>
              <th>Sana</th>
              <th>Vaqt</th>
              <th>Narx UZS</th>
              <th>Izoh</th>
              <th>Status</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody id="buyurtma-tbody">
            ${buyurtmaRows(buyurtmalar||[])}
          </tbody>
        </table>
      </div>
    </div>`;

  window._buyurtmalar = buyurtmalar || [];
}

function buyurtmaRows(list) {
  if (!list.length) return `<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">📭</div><p>Buyurtma yo'q</p></div></td></tr>`;
  return list.map((b, i) => {
    const statusBadge = b.status === 'tayyor'
      ? '<span class="badge badge-success">✅ Tayyor</span>'
      : b.status === 'bekor'
      ? '<span class="badge badge-danger">❌ Bekor</span>'
      : '<span class="badge badge-warning">⏳ Kutilmoqda</span>';

    return `<tr id="brow-${b.id}">
      <td style="color:var(--text3)">${i+1}</td>
      <td><strong>${b.mijoz_ism}</strong></td>
      <td style="font-size:12px">${b.mijoz_tel||'—'}</td>
      <td>${b.buket_nomi||'—'}</td>
      <td style="font-size:12px;color:var(--text2);max-width:180px">${b.gullar_tarkib||'—'}</td>
      <td><strong>${b.sana}</strong></td>
      <td><strong style="color:var(--primary)">${b.vaqt}</strong></td>
      <td>${b.narx_uzs ? Number(b.narx_uzs).toLocaleString()+' UZS' : '—'}</td>
      <td style="font-size:12px;color:var(--text2)">${b.izoh||'—'}</td>
      <td>${statusBadge}</td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${b.status === 'kutilmoqda' ? `
            <button class="status-btn tayyor" onclick="buyurtmaStatus('${b.id}','tayyor')" title="Tayyor">✓</button>
            <button class="status-btn bekor" onclick="buyurtmaStatus('${b.id}','bekor')" title="Bekor">✗</button>
          ` : ''}
          <button class="btn btn-sm btn-danger" onclick="buyurtmaOchir('${b.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterBuyurtma(status, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const list = status === 'barchasi' ? window._buyurtmalar : window._buyurtmalar.filter(b => b.status === status);
  document.getElementById('buyurtma-tbody').innerHTML = buyurtmaRows(list);
}

async function buyurtmaStatus(id, status) {
  const res = await apiCall(`/buyurtmalar/${id}/status`, 'PUT', { status });
  if (res?.error) { alert(res.error); return; }
  renderBuyurtmalar();
}

async function buyurtmaOchir(id) {
  if (!confirm('Buyurtmani o\'chirishni tasdiqlaysizmi?')) return;
  await apiCall(`/buyurtmalar/${id}`, 'DELETE');
  renderBuyurtmalar();
}

function showBuyurtmaModal() {
  const today = new Date().toISOString().split('T')[0];
  openModal(`
    <div class="modal-header">
      <span class="modal-title">📋 Yangi buyurtma</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Mijoz ismi *</label>
          <input class="form-control" id="bu-ism" placeholder="Ism Familiya">
        </div>
        <div class="form-group">
          <label>Telefon raqam</label>
          <input class="form-control" id="bu-tel" placeholder="+998 90 xxx xxxx">
        </div>
      </div>
      <div class="form-group">
        <label>Buket nomi / turi</label>
        <input class="form-control" id="bu-buket" placeholder="Masalan: Klassik buket, VIP guldasta...">
      </div>
      <div class="form-group">
        <label>Gullar tarkibi va soni</label>
        <textarea class="form-control" id="bu-tarkib" placeholder="Masalan: Qizil atirgul x10, Oq lilyum x5, Lavanda x3"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tayyor bo'lish sanasi *</label>
          <input class="form-control" id="bu-sana" type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>Tayyor bo'lish vaqti *</label>
          <input class="form-control" id="bu-vaqt" type="time" value="12:00">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Narx UZS</label>
          <input class="form-control" id="bu-uzs" type="number" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label>Qo'shimcha izoh</label>
        <textarea class="form-control" id="bu-izoh" placeholder="Masalan: Qizil lentali bo'lsin, sovg'a qog'ozga o'rab..."></textarea>
      </div>
      <div id="bu-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="buyurtmaSaqla()">💾 Saqlash</button>
    </div>`);
}

async function buyurtmaSaqla() {
  const mijoz_ism = document.getElementById('bu-ism').value.trim();
  const mijoz_tel = document.getElementById('bu-tel').value.trim();
  const buket_nomi = document.getElementById('bu-buket').value.trim();
  const gullar_tarkib = document.getElementById('bu-tarkib').value.trim();
  const sana = document.getElementById('bu-sana').value;
  const vaqt = document.getElementById('bu-vaqt').value;
  const narx_uzs = document.getElementById('bu-uzs').value;
  const izoh = document.getElementById('bu-izoh').value.trim();
  const al = document.getElementById('bu-alert');

  if (!mijoz_ism || !sana || !vaqt) {
    al.innerHTML = '<div class="alert alert-danger">Mijoz ismi, sana va vaqt kiritilishi shart!</div>';
    return;
  }

  const res = await apiCall('/buyurtmalar', 'POST', { mijoz_ism, mijoz_tel, buket_nomi, gullar_tarkib, sana, vaqt, narx_uzs, izoh });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Buyurtma saqlandi!</div>';
  setTimeout(() => { closeModal(); renderBuyurtmalar(); }, 1000);
}