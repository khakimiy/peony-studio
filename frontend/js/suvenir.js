async function renderSuvenir() {
  const A = document.getElementById('topbar-actions');
  A.innerHTML = `<button class="btn btn-primary" onclick="showSuvenirModal()">+ Mahsulot qo'shish</button>`;

  const suvenirlar = await apiCall('/suvenir');
  const suvenirList = (suvenirlar||[]).filter(s => s.tur === 'suvenir');
  const shokoladList = (suvenirlar||[]).filter(s => s.tur === 'shokolad');

  document.getElementById('content').innerHTML = `
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-icon pink">🎁</div>
        <div>
          <div class="metric-label">Suvenirlar</div>
          <div class="metric-value">${suvenirList.reduce((s,x)=>s+x.miqdor,0)}</div>
          <div class="metric-sub">${suvenirList.length} xil tur</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon orange">🍫</div>
        <div>
          <div class="metric-label">Shokoladlar</div>
          <div class="metric-value">${shokoladList.reduce((s,x)=>s+x.miqdor,0)}</div>
          <div class="metric-sub">${shokoladList.length} xil tur</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">📦</div>
        <div>
          <div class="metric-label">Jami mahsulot</div>
          <div class="metric-value">${(suvenirlar||[]).reduce((s,x)=>s+x.miqdor,0)}</div>
          <div class="metric-sub">ta</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">🏷️</div>
        <div>
          <div class="metric-label">Jami tur</div>
          <div class="metric-value">${(suvenirlar||[]).length}</div>
          <div class="metric-sub">xil</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
      <div class="card">
        <div class="card-header"><span class="card-title">🎁 Suvenirlar</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nomi</th><th>Miqdor</th><th>Narx UZS</th><th>Amal</th></tr></thead>
            <tbody>
              ${suvenirList.map(s => `<tr>
                <td><strong>${s.nomi}</strong>${s.tavsif?`<br><span style="font-size:11px;color:var(--text3)">${s.tavsif}</span>`:''}</td>
                <td><strong>${s.miqdor}</strong> ta</td>
                <td>${Number(s.narx_uzs).toLocaleString()} UZS</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm" onclick="showKirimModal(${s.id},'${s.nomi}',${s.miqdor})">+</button>
                    <button class="btn btn-sm btn-danger" onclick="suvenirOchir(${s.id})">🗑</button>
                  </div>
                </td>
              </tr>`).join('') || '<tr><td colspan="4"><div class="empty-state"><p>Suvenir yo\'q</p></div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">🍫 Shokoladlar</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nomi</th><th>Miqdor</th><th>Narx UZS</th><th>Amal</th></tr></thead>
            <tbody>
              ${shokoladList.map(s => `<tr>
                <td><strong>${s.nomi}</strong>${s.tavsif?`<br><span style="font-size:11px;color:var(--text3)">${s.tavsif}</span>`:''}</td>
                <td><strong>${s.miqdor}</strong> ta</td>
                <td>${Number(s.narx_uzs).toLocaleString()} UZS</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm" onclick="showKirimModal(${s.id},'${s.nomi}',${s.miqdor})">+</button>
                    <button class="btn btn-sm btn-danger" onclick="suvenirOchir(${s.id})">🗑</button>
                  </div>
                </td>
              </tr>`).join('') || '<tr><td colspan="4"><div class="empty-state"><p>Shokolad yo\'q</p></div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function showSuvenirModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">🎁 Yangi mahsulot qo'shish</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Nomi *</label>
          <input class="form-control" id="sv-nomi" placeholder="Mahsulot nomi">
        </div>
        <div class="form-group">
          <label>Turi *</label>
          <select class="form-control" id="sv-tur">
            <option value="suvenir">🎁 Suvenir</option>
            <option value="shokolad">🍫 Shokolad</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Miqdor (ta)</label>
        <input class="form-control" id="sv-miq" type="number" value="0" min="0">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Narx UZS</label>
          <input class="form-control" id="sv-uzs" type="number" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label>Tavsif (ixtiyoriy)</label>
        <textarea class="form-control" id="sv-tavsif" placeholder="Qisqacha tavsif..."></textarea>
      </div>
      <div id="sv-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="suvenirSaqla()">💾 Saqlash</button>
    </div>`);
}

function showKirimModal(id, nomi, joriy) {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">${nomi} — Kirim qo'shish</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--primary-light);border-radius:var(--radius);padding:12px;margin-bottom:1rem;text-align:center">
        <div style="font-size:12px;color:var(--primary)">Joriy miqdor</div>
        <div style="font-size:28px;font-weight:700;color:var(--primary)">${joriy} ta</div>
      </div>
      <div class="form-group">
        <label>Qo'shiladigan miqdor *</label>
        <input class="form-control" id="sk-son" type="number" value="10" min="1">
      </div>
      <div id="sk-alert"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" onclick="suvenirKirim(${id})">+ Qo'shish</button>
    </div>`);
}

async function suvenirSaqla() {
  const nomi = document.getElementById('sv-nomi').value.trim();
  const tur = document.getElementById('sv-tur').value;
  const miqdor = document.getElementById('sv-miq').value;
  const narx_uzs = document.getElementById('sv-uzs').value;
  const tavsif = document.getElementById('sv-tavsif').value.trim();
  const al = document.getElementById('sv-alert');
  if (!nomi) { al.innerHTML = '<div class="alert alert-danger">Nomi kiritilishi shart!</div>'; return; }
  const res = await apiCall('/suvenir', 'POST', { nomi, tur, miqdor, narx_uzs, tavsif });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Qo\'shildi!</div>';
  setTimeout(() => { closeModal(); renderSuvenir(); }, 1000);
}

async function suvenirKirim(id) {
  const son = document.getElementById('sk-son').value;
  const al = document.getElementById('sk-alert');
  if (!son || son <= 0) { al.innerHTML = '<div class="alert alert-danger">Miqdor kiritilishi shart!</div>'; return; }
  const res = await apiCall(`/suvenir/${id}/kirim`, 'PUT', { miqdor: son });
  if (res?.error) { al.innerHTML = `<div class="alert alert-danger">${res.error}</div>`; return; }
  al.innerHTML = '<div class="alert alert-success">✅ Qo\'shildi!</div>';
  setTimeout(() => { closeModal(); renderSuvenir(); }, 1000);
}

async function suvenirOchir(id) {
  if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
  await apiCall(`/suvenir/${id}`, 'DELETE');
  renderSuvenir();
}