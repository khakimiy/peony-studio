// Finance (kassa) UI
async function renderFinance() {
  const C = document.getElementById('content');
  C.innerHTML = '<div class="loading"><div class="spinner"></div> Yuklanmoqda...</div>';

  const data = await apiCall('/finance');
  if (!data || data.error) return C.innerHTML = '<div class="card">Kassa ma\'lumotlarini olishda xato</div>';

  const rows = (data||[]).map(t => `
    <tr data-id="${t.id}">
      <td>${t.type === 'in' ? 'Kirim' : 'Chiqim'}</td>
      <td>${t.party || '—'}</td>
      <td>${t.reason || '—'}</td>
      <td>${Number(t.amount).toLocaleString()}</td>
      <td>${new Date(t.created_at).toLocaleString()}</td>
      <td><button class="btn btn-danger btn-sm btn-del-fin" data-id="${t.id}">O'chirish</button></td>
    </tr>
  `).join('');

  C.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">💰 Pul harakatlari (Kassa)</span></div>
      <div style="padding:1rem;display:flex;gap:.5rem;align-items:center">
        <select id="txn-type"><option value="in">Kirim</option><option value="out">Chiqim</option></select>
        <input id="txn-party" placeholder="Kimdan/kimga" style="flex:1;padding:.4rem" />
        <input id="txn-amount" type="number" placeholder="Summasi" style="width:140px;padding:.4rem" />
        <input id="txn-reason" placeholder="Sabab" style="flex:1;padding:.4rem" />
        <button id="txn-add" class="btn">Qo'shish</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tur</th><th>Kim</th><th>Sabab</th><th>Summa</th><th>Sana</th><th></th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('txn-add').addEventListener('click', async () => {
    const type = document.getElementById('txn-type').value;
    const party = document.getElementById('txn-party').value;
    const amount = Number(document.getElementById('txn-amount').value || 0);
    const reason = document.getElementById('txn-reason').value;
    if (!amount || amount <= 0) return alert('Iltimos summa kiriting');
    const res = await apiCall('/finance', 'POST', { type, party, reason, amount });
    if (res && res.error) return alert('Xato: ' + res.error);
    alert('Saqlandi');
    goPage('finance');
  });

  // delete handlers
  document.querySelectorAll('.btn-del-fin').forEach(b => b.addEventListener('click', async () => {
    const id = b.getAttribute('data-id');
    if (!confirm('O\'chirilsinmi?')) return;
    const r = await apiCall(`/finance/${id}`, 'DELETE');
    if (r && r.error) return alert('Xato: ' + r.error);
    alert('O\'chirildi');
    goPage('finance');
  }));
}

if (typeof module !== 'undefined') module.exports = { renderFinance };
