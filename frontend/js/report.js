// Inventory report: aggregated flowers + suvenir
async function renderReport() {
  const C = document.getElementById('content');
  C.innerHTML = '<div class="loading"><div class="spinner"></div> Yuklanmoqda...</div>';
  const data = await apiCall('/report/inventory');
  if (!data || data.error) return C.innerHTML = '<div class="card">Hisobotni olishda xato</div>';

  const rows = (data.items||[]).map((it, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${it.type === 'gul' ? 'Gul' : 'Suvenir'}</td>
      <td>${it.nomi}</td>
      <td>${it.qty}</td>
      <td>${Number(it.unit_price).toLocaleString()}</td>
      <td>${Number(it.total).toLocaleString()}</td>
    </tr>
  `).join('');

  C.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">🧾 Inventar hisobot</span>
        <div style="margin-left:auto"><button id="export-csv" class="btn">CSV export</button></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Tur</th><th>Nomi</th><th>Miqdor</th><th>Narx UZS</th><th>Qiymat UZS</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div style="padding:1rem;text-align:right"><strong>Umumiy qiymat: </strong> ${Number(data.totalValue||0).toLocaleString()} UZS</div>
    </div>
  `;

  document.getElementById('export-csv').addEventListener('click', () => {
    const items = data.items || [];
    const hdr = ['#','type','nomi','qty','unit_price','total'];
    const csv = [hdr.join(',')].concat(items.map((it,i)=>[i+1,it.type,`"${String(it.nomi).replace(/"/g,'""')}"`,it.qty,it.unit_price,it.total].join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
}

// export for dashboard to call
if (typeof module !== 'undefined') module.exports = { renderReport };
