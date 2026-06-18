// Waste (eskirgan) flowers UI and API
// Relies on global functions: apiCall(url, method, body) and openModal

async function renderWaste() {
  const gullar = await apiCall('/gullar');
  const waste = await apiCall('/waste');

  const C = document.getElementById('content');
  C.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">♻️ Eskirgan / tashlangan gullar</span></div>
      <div style="padding:1rem;">
        <form id="waste-form" style="display:flex;gap:.5rem;align-items:center">
          <select id="waste-gul" required style="flex:1;padding:.5rem">
            <option value="">— Gulni tanlang —</option>
            ${(Array.isArray(gullar) ? gullar : []).map(g=>`<option value="${g.id}">${g.nomi} (qoldiq: ${g.kirim - g.chiqim})</option>`).join('')}
          </select>
          <input id="waste-son" type="number" min="1" placeholder="Soni" style="width:90px;padding:.5rem" required />
          <input id="waste-reason" placeholder="Sabab (ixtiyoriy)" style="flex:1;padding:.5rem" />
          <button class="btn" type="submit">Qayd et</button>
        </form>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Gul</th><th>Soni</th><th>Sabab</th><th>Sana</th><th></th></tr></thead>
          <tbody>
            ${(Array.isArray(waste) ? waste : []).map((w,i)=>`<tr data-id="${w.id}"><td>${i+1}</td><td>${w.nomi||w.gul_id}</td><td>${w.son}</td><td>${w.reason||'—'}</td><td>${new Date(w.created_at).toLocaleString()}</td><td><button class="btn btn-danger btn-sm btn-delete-waste" data-id="${w.id}">O'chirish</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('waste-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const gul_id = document.getElementById('waste-gul').value;
    const son = Number(document.getElementById('waste-son').value || 0);
    const reason = document.getElementById('waste-reason').value || null;
    if (!gul_id || son <= 0) return alert('Iltimos gul va sonni kiriting');

    const r = await apiCall('/waste', 'POST', { gul_id, son, reason });
    if (r && r.error) return alert('Xato: ' + r.error);
    alert(r.message || 'Saqlandi');
    goPage('waste');
  });

  // Attach delete handlers
  document.querySelectorAll('.btn-delete-waste').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      if (!confirm("Bu yozuvni o'chirmoqchimisiz? Bu ombordagi chiqimni kamaytiradi.")) return;
      // Use POST /:id/delete as a compatibility fallback
      const res = await apiCall(`/waste/${id}/delete`, 'POST');
      if (res && res.error) return alert('Xato: ' + res.error);
      alert(res.message || 'O‘chirildi');
      goPage('waste');
    });
  });
}