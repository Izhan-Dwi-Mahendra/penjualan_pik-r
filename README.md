# Penjualan PIK-R (Catatan Kasir Keliling Sederhana)

Website catatan kasir keliling sederhana untuk membantu proses penjualan **PIK-R** saat berkeliling ke kelas-kelas 10 dan 11.

---

## 🎯 Karakteristik & Konsep Utama

- **Single Page Sederhana**: Dibuat dalam satu halaman mengalir dari atas ke bawah:
  1. **Input Penjualan** (Nama produk bebas, modal per pcs, harga jual per pcs, jurusan & kelas, jumlah, metode pembayaran).
  2. **Riwayat Penjualan** (Menampilkan transaksi yang baru dicatat lengkap dengan waktu dan tombol hapus jika ada salah input).
  3. **Rekapitulasi Penjualan** (Total Penjualan, Total Modal, Total Keuntungan, Total Cash, Total QRIS, Total Terjual, Rekap per Kelas, Rekap per Jurusan).
  4. **Tombol COPY LAPORAN** (1-klik salin teks rapi siap kirim ke WhatsApp).
- **Tanpa Produk Bawaan**: Tidak ada produk yang dikunci atau disetel permanen. Pengguna bebas mengetik produk apa pun (Cheesecake, Risol, Donat, Es Teh, dll).
- **Memori Produk Otomatis**: Setiap kali Anda menginput suatu produk, nama beserta harga modal dan harga jualnya akan tersimpan di saran (*autocomplete*). Ketika Anda mengetik produk yang sama di kelas berikutnya, modal dan harga jualnya akan otomatis terisi.
- **Target Kelas 10 & 11 (5 Jurusan)**:
  - Perhotelan (PH): 10 PH, 11 PH 1, 11 PH 2
  - AKL: 10 AKL 1, 10 AKL 2, 11 AKL 1, 11 AKL 2
  - Teknik Otomotif: 10 Teknik Otomotif 1, 10 Teknik Otomotif 2, 11 Teknik Otomotif 1, 11 Teknik Otomotif 2
  - DKV: 10 DKV 1, 10 DKV 2, 11 DKV 1, 11 DKV 2
  - PPLG: 10 PPLG 1 *(hanya 1 kelas)*, 11 PPLG 1, 11 PPLG 2
- **Metode Pembayaran**: Cash, QRIS, serta opsi Campuran (Cash + QRIS).
- **Tanpa Database & Tanpa Backend**: Menggunakan `localStorage` browser. Data aman tersimpan saat browser ditutup atau di-refresh.
- **Sangat Ramah HP**: Tombol stepper `[−]` `[+]` besar, formulir responsif, dan mudah digunakan satu tangan saat berjalan.

---

## 🚀 Cara Menjalankan

### Cara 1: Langsung Buka di Browser Laptop / Komputer
Klik dua kali berkas `index.html`.

### Cara 2: Buka di HP (Jaringan WiFi / Hotspot yang Sama)
1. Buka PowerShell atau Command Prompt di folder ini:
   ```powershell
   python -m http.server 8080
   ```
2. Cek alamat IP laptop Anda (misal: `192.168.1.10`).
3. Buka browser di HP Anda dan ketik:
   ```
   http://192.168.1.10:8080
   ```
4. Website langsung siap dipakai di HP sambil berkeliling kelas!

---

## 📂 Struktur File

```
pik-r-sales/
├── index.html     # Halaman utama Single-Page
├── css/
│   └── style.css  # Tampilan kasir minimalis & ramah HP
├── js/
│   └── app.js     # Seluruh logika input, kalkulasi laba, rekap, dan laporan WA
└── README.md      # Panduan penggunaan
```
