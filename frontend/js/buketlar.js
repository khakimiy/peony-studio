    async function renderBuketlar() {
  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showBuketModal()">+ Buket tayyorlash</button>`;

  const [buketlar, xodimlar] = await Promise.all([
    apiCall('/buketlar'),
    apiCall('/xodimlar')
  ]);

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">💐 Tayyorlangan buketlar</span>
        <span style="font-size:12px;color:var(--text3)">Jami ${(buketlar||[]).length} ta</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Buket nomi</th>
              <th>Florist</th>
              <th>Tarkibi</th>
              <th>Son</th>
              <th>Foiz</th>
                <th>Narx UZS</th>
              <th>Sana</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            ${(buketlar||[]).map((b, i) => {
              const tarkib = (b.buket_tarkib||[]).map(t => `${t.gullar?.nomi||'?'} x${t.son}`).join(', ');
              const florist = (xodimlar||[]).find(x => x.id === b.florist_id);
              const sana = new Date(b.created_at).toLocaleDateString('uz-UZ');
              return `<tr>
                <td style="color:var(--text3)">${i+1}</td>
                <td><strong>${b.nomi}</strong></td>
                <td>${florist ? florist.ism + ' ' + florist.familiya : '—'}</td>
                <td style="font-size:12px;color:var(--text2);max-width:200px">${tarkib||'—'}</td>
                <td>${b.miqdor}</td>
                <td><span class="badge badge-info">%${b.tayyorlash_foiz}</span></td>
                <td>${Number(b.narx_uzs).toLocaleString()} UZS</td>
                <td>${sana}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="buketOchir(${b.id})">🗑</button>
                </td>
              </tr>`;
            }).join('') || '<tr><td colspan="9" class="empty-state"><div class="empty-icon">💐</div><p>Hali buket tayyorlanmagan</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

async function showBuketModal() {
  const [gullar, xodimlar] = await Promise.all([
    apiCall('/gullar'),
    apiCall('/xodimlar')
  ]);
  const floristlar = (xodimlar||[]).filter(x => x.rol === 'florist');

  openModal(`
    <div class="modal-header">
      <span class="modal-title">💐 Buket tayyorlash</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Buket nomi *</label>
          <input class="form-control" id="bk-nomi" placeholder="Masalan: Klassik buket">
        </div>
        <div class="form-group">
          <label>Florist *</label>
          <select class="form-control" id="bk-florist">
            <option value="">— Florist tanlang —</option>
            ${floristlar.map(f=>`<option value="${f.id}">${f.ism} ${f.familiya}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tayyorlash foizi (%)</label>
          <select class="form-control" id="bk-foiz" onchange="buketNarxHisob()">
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="7" selected>7%</option>
            <option value="10">10%</option>
            <option value="15">15%</option>
          </select>
        </div>
        <div class="form-group">
          <label>Soni (ta)</label>
          <input class="form-control" id="bk-son" type="number" value="1" min="1" oninput="buketNarxHisob()">
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <label style="font-size:12.5px;font-weight:600;color:var(--text2)">Gul tarkibi *</label>
        <button class="btn btn-sm btn-success" onclick="tarkibQator()">+ Gul qo'shish</button>
      </div>
      <div id="tarkib-list"></div>

      <div class="narx-box" id="narx-box" style="display:none">
        <div class="narx-label">Hisoblangan narx</div>
        <div class="narx-val" id="narx-uzs-val">0 UZS</div>
      </div>

      <div id="bk-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="buketTayyorla(${JSON.stringify(gullar||[]).replace(/"/g,'&quot;')})">✂️ Tayyorla</button>
    </div>`);

  window._gullar_list = gullar || [];
  tarkibQator();
}

function tarkibQator() {
  const list = document.getElementById('tarkib-list');
  const idx = list.children.length;
  const opts = window._gullar_list.map(g => {
    const q = g.kirim - g.chiqim;
    return `<option value="${g.id}" data-uzs="${g.narx_uzs}">${g.nomi} (${q} ta bor)</option>`;
  }).join('');

  const row = document.createElement('div');
  row.className = 'tarkib-row';
  row.id = `trow-${idx}`;
  row.innerHTML = `
    <select class="form-control" id="tgul-${idx}" onchange="buketNarxHisob()">${opts}</select>
    <input class="form-control" id="tson-${idx}" type="number" value="1" min="1" placeholder="Soni" oninput="buketNarxHisob()">
    <button class="btn btn-icon btn-danger" onclick="document.getElementById('trow-${idx}').remove();buketNarxHisob()">✕</button>`;
  list.appendChild(row);
  buketNarxHisob();
}

function buketNarxHisob() {
  const foiz = parseFloat(document.getElementById('bk-foiz')?.value || 0);
  const son = parseInt(document.getElementById('bk-son')?.value || 1);
  const list = document.getElementById('tarkib-list');
  let uzs = 0;
  for (const row of list.children) {
    const idx = row.id.split('-')[1];
    const sel = document.getElementById(`tgul-${idx}`);
    const qty = parseInt(document.getElementById(`tson-${idx}`)?.value || 0);
    if (sel && qty) {
      const opt = sel.options[sel.selectedIndex];
      uzs += (parseFloat(opt.dataset.uzs) || 0) * qty;
    }
  }
  uzs = Math.round(uzs * son * (1 + foiz / 100));
  const box = document.getElementById('narx-box');
  if (uzs > 0) {
    box.style.display = 'block';
    document.getElementById('narx-uzs-val').textContent = uzs.toLocaleString() + ' UZS';
  }
  return { uzs };
}

async function buketTayyorla() {
  const nomi = document.getElementById('bk-nomi').value.trim();
  const florist_id = document.getElementById('bk-florist').value;
  const foiz = parseFloat(document.getElementById('bk-foiz').value);
  const miqdor = parseInt(document.getElementById('bk-son').value || 1);
  const al = document.getElementById('bk-alert');

  if (!nomi) { al.innerHTML = '<div class="alert alert-danger">Buket nomi kiritilishi shart!</div>'; return; }
  if (!florist_id) { al.innerHTML = '<div class="alert alert-danger">Floristni tanlang!</div>'; return; }

  const list = document.getElementById('tarkib-list');
  const tarkib = [];
  for (const row of list.children) {
    const idx = row.id.split('-')[1];
    const gul_id = document.getElementById(`tgul-${idx}`)?.value;
    const son = parseInt(document.getElementById(`tson-${idx}`)?.value || 0);
    if (gul_id && son > 0) tarkib.push({ gul_id: parseInt(gul_id), son });
  }

  if (!tarkib.length) { al.innerHTML = '<div class="alert alert-danger">Kamida 1 ta gul qo\'shilishi shart!</div>'; return; }

  const res = await apiCall('/buketlar/tayyorla', 'POST', { buket_nomi: nomi, florist_id: parseInt(florist_id), tarkib, foiz, miqdor });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">❌ ${res.error}</div>`; return; }

  al.innerHTML = `<div class="alert alert-success">✅ Buket tayyorlandi! Narx: ${res.narx_uzs?.toLocaleString()} UZS</div>`;
  setTimeout(() => { closeModal(); renderBuketlar(); }, 1500);
}

async function buketOchir(id) {
  if (!confirm('Buketni o\'chirishni tasdiqlaysizmi?')) return;
  await apiCall(`/buketlar/${id}`, 'DELETE');
  renderBuketlar();
}