/**
 * APP.JS - Catatan Kasir Penjualan Keliling PIK-R
 * Single Page sederhana, tanpa produk bawaan, tanpa menu berbelit-belit.
 */

// 1. Data Struktur Target Jurusan & Kelas (Kelas 10 & 11 Saja)
const KELAS_BY_JURUSAN = {
  'PH': ['10 PH', '11 PH 1', '11 PH 2'],
  'AKL': ['10 AKL 1', '10 AKL 2', '11 AKL 1', '11 AKL 2'],
  'TO': ['10 Teknik Otomotif 1', '10 Teknik Otomotif 2', '11 Teknik Otomotif 1', '11 Teknik Otomotif 2'],
  'DKV': ['10 DKV 1', '10 DKV 2', '11 DKV 1', '11 DKV 2'],
  'PPLG': ['10 PPLG 1', '11 PPLG 1', '11 PPLG 2'] // 10 PPLG hanya 1 kelas
};

const JURUSAN_LABELS = {
  'PH': 'Perhotelan (PH)',
  'AKL': 'Akuntansi & Keuangan Lembaga (AKL)',
  'TO': 'Teknik Otomotif',
  'DKV': 'Desain Komunikasi Visual (DKV)',
  'PPLG': 'Pengembangan Perangkat Lunak & Gim (PPLG)'
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'pikr_tx_v2',
  MEMORY_PRODUCTS: 'pikr_prod_memory_v2'
};

// Format Angka ke Rupiah (RpXX.XXX)
function formatRupiah(amount) {
  if (isNaN(amount) || amount === null) return 'Rp0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (isNegative ? '-Rp' : 'Rp') + formatted;
}

// ==========================================================================
// KONTROL UTAMA APLIKASI
// ==========================================================================
const App = {
  init() {
    this.bindJurusanAndKelas();
    this.bindProductAutofill();
    this.bindLiveCalculation();
    this.bindQtyStepper();
    this.bindPaymentMethod();
    this.bindFormSubmit();
    this.bindWhatsAppCopy();
    this.bindResetData();

    // Render data awal dari localStorage
    this.loadProductDatalist();
    this.renderHistoryList();
    this.renderRecap();
  },

  // 1. Dropdown Jurusan & Kelas
  bindJurusanAndKelas() {
    const selectDept = document.getElementById('selectDept');
    const selectClass = document.getElementById('selectClass');

    selectDept.addEventListener('change', () => {
      const dept = selectDept.value;
      selectClass.innerHTML = '';

      if (!dept || !KELAS_BY_JURUSAN[dept]) {
        selectClass.innerHTML = '<option value="">Pilih Jurusan Dahulu</option>';
        selectClass.disabled = true;
        return;
      }

      selectClass.disabled = false;
      selectClass.innerHTML = '<option value="">Pilih Kelas ▼</option>';
      KELAS_BY_JURUSAN[dept].forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls;
        opt.textContent = cls;
        selectClass.appendChild(opt);
      });
    });
  },

  // 2. Memori Produk (Autofill Cerdas Tanpa Produk Bawaan)
  getSavedProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORY_PRODUCTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveProductToMemory(name, costPrice, sellingPrice) {
    if (!name) return;
    const cleanName = name.trim();
    const products = this.getSavedProducts();
    products[cleanName.toLowerCase()] = {
      name: cleanName,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0
    };
    localStorage.setItem(STORAGE_KEYS.MEMORY_PRODUCTS, JSON.stringify(products));
    this.loadProductDatalist();
  },

  loadProductDatalist() {
    const datalist = document.getElementById('productSuggestions');
    if (!datalist) return;
    const products = Object.values(this.getSavedProducts());
    datalist.innerHTML = products.map(p => `<option value="${p.name}"></option>`).join('');
  },

  bindProductAutofill() {
    const inputName = document.getElementById('inputProductName');
    const inputCost = document.getElementById('inputCostPrice');
    const inputPrice = document.getElementById('inputSellingPrice');
    const hint = document.getElementById('autofillHint');

    inputName.addEventListener('input', () => {
      const query = inputName.value.trim().toLowerCase();
      const products = this.getSavedProducts();
      if (products[query]) {
        inputCost.value = products[query].costPrice;
        inputPrice.value = products[query].sellingPrice;
        if (hint) hint.style.display = 'block';
        this.updateLiveCalc();
      } else {
        if (hint) hint.style.display = 'none';
      }
    });
  },

  // 3. Kalkulator Live (Harga Jual × Jumlah = Pemasukan, Modal × Jumlah = Modal)
  bindLiveCalculation() {
    const inputCost = document.getElementById('inputCostPrice');
    const inputPrice = document.getElementById('inputSellingPrice');
    const inputQty = document.getElementById('inputQty');

    [inputCost, inputPrice, inputQty].forEach(input => {
      input.addEventListener('input', () => this.updateLiveCalc());
    });
  },

  updateLiveCalc() {
    const cost = parseFloat(document.getElementById('inputCostPrice').value) || 0;
    const price = parseFloat(document.getElementById('inputSellingPrice').value) || 0;
    const qty = parseInt(document.getElementById('inputQty').value, 10) || 0;

    const totalAmount = price * qty;
    const totalCost = cost * qty;
    const profit = totalAmount - totalCost;

    document.getElementById('previewTotalAmount').textContent = formatRupiah(totalAmount);
    document.getElementById('previewTotalCost').textContent = formatRupiah(totalCost);
    document.getElementById('previewProfit').textContent = formatRupiah(profit);

    this.updateSplitStatus(totalAmount);
  },

  // 4. Tombol Stepper Jumlah (+) dan (-)
  bindQtyStepper() {
    const inputQty = document.getElementById('inputQty');
    const btnMinus = document.getElementById('btnQtyMinus');
    const btnPlus = document.getElementById('btnQtyPlus');

    btnMinus.addEventListener('click', () => {
      const cur = parseInt(inputQty.value, 10) || 1;
      if (cur > 1) {
        inputQty.value = cur - 1;
        this.updateLiveCalc();
      }
    });

    btnPlus.addEventListener('click', () => {
      const cur = parseInt(inputQty.value, 10) || 0;
      inputQty.value = cur + 1;
      this.updateLiveCalc();
    });
  },

  // 5. Metode Pembayaran (Cash / QRIS / Split)
  bindPaymentMethod() {
    const radios = document.querySelectorAll('input[name="payMethod"]');
    const splitBox = document.getElementById('splitPaymentRow');
    const inputCash = document.getElementById('inputSplitCash');
    const inputQris = document.getElementById('inputSplitQris');

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'Split') {
          splitBox.style.display = 'block';
          // Default: bagi 2 atau isi salah satu
          const price = parseFloat(document.getElementById('inputSellingPrice').value) || 0;
          const qty = parseInt(document.getElementById('inputQty').value, 10) || 1;
          const total = price * qty;
          inputCash.value = Math.round(total / 2);
          inputQris.value = total - Math.round(total / 2);
        } else {
          splitBox.style.display = 'none';
        }
        this.updateLiveCalc();
      });
    });

    [inputCash, inputQris].forEach(inp => {
      inp.addEventListener('input', () => {
        const price = parseFloat(document.getElementById('inputSellingPrice').value) || 0;
        const qty = parseInt(document.getElementById('inputQty').value, 10) || 1;
        this.updateSplitStatus(price * qty);
      });
    });
  },

  updateSplitStatus(totalExpected) {
    const isSplit = document.querySelector('input[name="payMethod"]:checked')?.value === 'Split';
    if (!isSplit) return;

    const cash = parseFloat(document.getElementById('inputSplitCash').value) || 0;
    const qris = parseFloat(document.getElementById('inputSplitQris').value) || 0;
    const totalSplit = cash + qris;
    const statusElem = document.getElementById('splitStatus');

    if (totalSplit === totalExpected) {
      statusElem.textContent = `✓ Pas: Total Rp${cash.toLocaleString('id-ID')} + Rp${qris.toLocaleString('id-ID')} = ${formatRupiah(totalExpected)}`;
      statusElem.className = 'split-status valid';
    } else {
      const diff = totalExpected - totalSplit;
      const textDiff = diff > 0 ? `Kurang Rp${diff.toLocaleString('id-ID')}` : `Kelebihan Rp${Math.abs(diff).toLocaleString('id-ID')}`;
      statusElem.textContent = `⚠️ Selisih: ${textDiff} (Harus pas ${formatRupiah(totalExpected)})`;
      statusElem.className = 'split-status invalid';
    }
  },

  // 6. Simpan Penjualan
  bindFormSubmit() {
    const form = document.getElementById('formPenjualan');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('inputProductName').value.trim();
      const cost = parseFloat(document.getElementById('inputCostPrice').value);
      const price = parseFloat(document.getElementById('inputSellingPrice').value);
      const dept = document.getElementById('selectDept').value;
      const className = document.getElementById('selectClass').value;
      const qty = parseInt(document.getElementById('inputQty').value, 10);
      const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

      if (!name) return this.showToast('Masukkan nama produk!', 'danger');
      if (isNaN(cost) || isNaN(price)) return this.showToast('Masukkan modal dan harga jual!', 'danger');
      if (!dept || !className) return this.showToast('Pilih jurusan dan kelas!', 'danger');
      if (!qty || qty < 1) return this.showToast('Jumlah barang minimal 1!', 'danger');

      const totalAmount = price * qty;
      const totalCost = cost * qty;
      const profit = totalAmount - totalCost;

      let cashAmount = 0;
      let qrisAmount = 0;

      if (payMethod === 'Cash') {
        cashAmount = totalAmount;
      } else if (payMethod === 'QRIS') {
        qrisAmount = totalAmount;
      } else if (payMethod === 'Split') {
        const c = parseFloat(document.getElementById('inputSplitCash').value) || 0;
        const q = parseFloat(document.getElementById('inputSplitQris').value) || 0;
        if (c + q !== totalAmount) {
          return this.showToast('Nominal Cash + QRIS harus pas dengan total!', 'danger');
        }
        cashAmount = c;
        qrisAmount = q;
      }

      // Waktu transaksi
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newTx = {
        id: 'tx_' + Date.now(),
        timeStr,
        name,
        costPrice: cost,
        sellingPrice: price,
        dept,
        className,
        qty,
        totalAmount,
        totalCost,
        profit,
        payMethod,
        cashAmount,
        qrisAmount
      };

      // Simpan transaksi
      const transactions = this.getTransactions();
      transactions.unshift(newTx);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

      // Simpan ke memori produk agar saat jualan ke kelas berikutnya nama & harga langsung muncul
      this.saveProductToMemory(name, cost, price);

      // Feedback HP
      if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 50, 40]); } catch (err) {}
      }

      this.showToast(`Berhasil dicatat: ${className} (${name} × ${qty})!`);

      // Reset kuantitas & kelas agar siap catat kelas berikutnya
      document.getElementById('inputQty').value = 1;
      document.getElementById('selectClass').value = '';
      this.updateLiveCalc();

      // Perbarui Tampilan
      this.renderHistoryList();
      this.renderRecap();
    });
  },

  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // 7. Render Riwayat Penjualan
  renderHistoryList() {
    const container = document.getElementById('historyListContainer');
    const badge = document.getElementById('txCountBadge');
    const emptyMsg = document.getElementById('emptyHistoryMsg');

    const txs = this.getTransactions();
    badge.textContent = `${txs.length} Transaksi`;

    if (txs.length === 0) {
      container.innerHTML = '';
      if (emptyMsg) container.appendChild(emptyMsg);
      return;
    }

    container.innerHTML = txs.map((t, idx) => {
      let payBadge = '';
      if (t.payMethod === 'Cash') {
        payBadge = '<span class="badge-pay badge-cash">Cash</span>';
      } else if (t.payMethod === 'QRIS') {
        payBadge = '<span class="badge-pay badge-qris">QRIS</span>';
      } else {
        payBadge = '<span class="badge-pay badge-split">Campuran</span>';
      }

      return `
        <div class="history-item">
          <div class="history-left">
            <div class="history-class">${this.escapeHtml(t.className)} <span class="text-muted" style="font-size: 0.7rem; font-weight: normal;">• ${t.timeStr}</span></div>
            <div class="history-prod">${this.escapeHtml(t.name)} × ${t.qty} pcs</div>
          </div>
          <div class="history-right">
            <div>
              <div class="history-amount">${formatRupiah(t.totalAmount)}</div>
              ${payBadge}
            </div>
            <button type="button" class="btn-del-tx" title="Hapus transaksi" onclick="App.deleteTransaction(${idx})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  },

  deleteTransaction(index) {
    const txs = this.getTransactions();
    const item = txs[index];
    if (!item) return;

    if (confirm(`Hapus transaksi dari ${item.className} (${item.name} × ${item.qty})?`)) {
      txs.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      this.showToast('Transaksi dihapus.');
      this.renderHistoryList();
      this.renderRecap();
    }
  },

  // 8. Render Rekapitulasi Sederhana
  renderRecap() {
    const txs = this.getTransactions();

    let totalPenjualan = 0;
    let totalModal = 0;
    let totalTerjual = 0;
    let totalCash = 0;
    let totalQris = 0;

    const classRecapMap = {};
    const deptRecapMap = {};

    txs.forEach(t => {
      totalPenjualan += t.totalAmount;
      totalModal += t.totalCost;
      totalTerjual += t.qty;
      totalCash += t.cashAmount;
      totalQris += t.qrisAmount;

      // Rekap per Kelas
      if (!classRecapMap[t.className]) {
        classRecapMap[t.className] = { amount: 0, qty: 0 };
      }
      classRecapMap[t.className].amount += t.totalAmount;
      classRecapMap[t.className].qty += t.qty;

      // Rekap per Jurusan
      const deptName = JURUSAN_LABELS[t.dept] || t.dept;
      if (!deptRecapMap[deptName]) {
        deptRecapMap[deptName] = { amount: 0, qty: 0 };
      }
      deptRecapMap[deptName].amount += t.totalAmount;
      deptRecapMap[deptName].qty += t.qty;
    });

    const totalKeuntungan = totalPenjualan - totalModal;

    // Update Elemen Metrik
    document.getElementById('recapTotalPenjualan').textContent = formatRupiah(totalPenjualan);
    document.getElementById('recapTotalModal').textContent = formatRupiah(totalModal);
    document.getElementById('recapTotalKeuntungan').textContent = formatRupiah(totalKeuntungan);
    document.getElementById('recapTotalTerjual').textContent = `${totalTerjual} pcs`;
    document.getElementById('recapTotalCash').textContent = formatRupiah(totalCash);
    document.getElementById('recapTotalQris').textContent = formatRupiah(totalQris);

    // Render Rekap Per Kelas
    const classContainer = document.getElementById('recapClassList');
    const classEntries = Object.entries(classRecapMap);
    if (classEntries.length === 0) {
      classContainer.innerHTML = '<span class="text-muted text-sm">Belum ada data penjualan kelas.</span>';
    } else {
      // Urutkan dari penjualan terbanyak
      classEntries.sort((a, b) => b[1].amount - a[1].amount);
      classContainer.innerHTML = classEntries.map(([cls, data]) => `
        <div class="breakdown-row">
          <span class="breakdown-name">${this.escapeHtml(cls)} (${data.qty} pcs)</span>
          <span class="breakdown-val">${formatRupiah(data.amount)}</span>
        </div>
      `).join('');
    }

    // Render Rekap Per Jurusan
    const deptContainer = document.getElementById('recapDeptList');
    const deptEntries = Object.entries(deptRecapMap);
    if (deptEntries.length === 0) {
      deptContainer.innerHTML = '<span class="text-muted text-sm">Belum ada data penjualan jurusan.</span>';
    } else {
      deptEntries.sort((a, b) => b[1].amount - a[1].amount);
      deptContainer.innerHTML = deptEntries.map(([dept, data]) => `
        <div class="breakdown-row">
          <span class="breakdown-name">${this.escapeHtml(dept)} (${data.qty} pcs)</span>
          <span class="breakdown-val">${formatRupiah(data.amount)}</span>
        </div>
      `).join('');
    }

    // Update Direct WA Link
    const btnDirectWa = document.getElementById('btnDirectWa');
    if (txs.length > 0) {
      btnDirectWa.style.display = 'inline-flex';
      const text = this.generateWhatsAppReportText();
      btnDirectWa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    } else {
      btnDirectWa.style.display = 'none';
    }
  },

  // 9. Laporan WhatsApp
  generateWhatsAppReportText() {
    const txs = this.getTransactions();
    if (txs.length === 0) {
      return 'LAPORAN PENJUALAN\n\nBelum ada transaksi penjualan tercatat.';
    }

    // Agregasi penjualan per nama produk
    const productMap = {};
    let overallCost = 0;
    let overallRevenue = 0;
    let overallCash = 0;
    let overallQris = 0;

    txs.forEach(t => {
      overallRevenue += t.totalAmount;
      overallCost += t.totalCost;
      overallCash += t.cashAmount;
      overallQris += t.qrisAmount;

      const pKey = t.name.trim().toLowerCase();
      if (!productMap[pKey]) {
        productMap[pKey] = {
          name: t.name.trim().toUpperCase(),
          costPrice: t.costPrice,
          sellingPrice: t.sellingPrice,
          qty: 0,
          totalCost: 0,
          totalRevenue: 0,
          profit: 0
        };
      }
      productMap[pKey].qty += t.qty;
      productMap[pKey].totalCost += t.totalCost;
      productMap[pKey].totalRevenue += t.totalAmount;
      productMap[pKey].profit += t.profit;
    });

    const products = Object.values(productMap);
    const overallProfit = overallRevenue - overallCost;

    // Jika hanya 1 macam produk (seperti contoh pada prompt user):
    if (products.length === 1) {
      const p = products[0];
      return `LAPORAN PENJUALAN ${p.name}\n\n` +
        `1. Modal: ${formatRupiah(p.totalCost)}\n` +
        `2. Harga jual: ${formatRupiah(p.sellingPrice)}/pcs\n` +
        `3. Kuantitas: ${p.qty} pcs\n` +
        `4. Pemasukan: ${formatRupiah(p.totalRevenue)}\n` +
        `5. Keuntungan: ${formatRupiah(p.profit)}\n\n` +
        `Notes:\n` +
        `1. Cash: ${formatRupiah(overallCash)}\n` +
        `2. QRIS: ${formatRupiah(overallQris)}`;
    }

    // Jika menjual beberapa produk berbeda:
    let text = `LAPORAN PENJUALAN PIK-R\n\n`;
    products.forEach((p, idx) => {
      text += `${idx + 1}. ${p.name}\n\n`;
      text += `1. Modal: ${formatRupiah(p.totalCost)}\n`;
      text += `2. Harga jual: ${formatRupiah(p.sellingPrice)}/pcs\n`;
      text += `3. Kuantitas: ${p.qty} pcs\n`;
      text += `4. Pemasukan: ${formatRupiah(p.totalRevenue)}\n`;
      text += `5. Keuntungan: ${formatRupiah(p.totalRevenue)} - ${formatRupiah(p.totalCost)} = ${formatRupiah(p.profit)}\n\n`;
    });

    text += `TOTAL\n`;
    text += `1. Total Modal: ${formatRupiah(overallCost)}\n`;
    text += `2. Total Pemasukan: ${formatRupiah(overallRevenue)}\n`;
    text += `3. Total Keuntungan: ${formatRupiah(overallProfit)}\n\n`;
    text += `Notes:\n`;
    text += `1. Cash: ${formatRupiah(overallCash)}\n`;
    text += `2. QRIS: ${formatRupiah(overallQris)}`;

    return text;
  },

  bindWhatsAppCopy() {
    const btn = document.getElementById('btnCopyWa');
    btn.addEventListener('click', () => {
      const text = this.generateWhatsAppReportText();

      const done = () => {
        if ('vibrate' in navigator) {
          try { navigator.vibrate([60, 40, 60]); } catch (e) {}
        }
        this.showToast('📋 Laporan berhasil disalin! Tinggal tempel di WhatsApp.');
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => {
          this.fallbackCopy(text, done);
        });
      } else {
        this.fallbackCopy(text, done);
      }
    });
  },

  fallbackCopy(text, callback) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      alert('Gagal menyalin otomatis. Silakan salin teks ini:\n\n' + text);
    }
    document.body.removeChild(tempInput);
  },

  // 10. Reset Data
  bindResetData() {
    const btn = document.getElementById('btnResetData');
    btn.addEventListener('click', () => {
      const confirm1 = confirm('⚠️ Yakin ingin menghapus seluruh data transaksi hari ini?');
      if (confirm1) {
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        this.showToast('Seluruh data penjualan telah direset.');
        this.renderHistoryList();
        this.renderRecap();
      }
    });
  },

  // Toast
  showToast(msg, type = 'normal') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    if (type === 'danger') {
      toast.style.background = '#dc2626';
    } else {
      toast.style.background = '#0f172a';
    }

    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  },

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Start on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
