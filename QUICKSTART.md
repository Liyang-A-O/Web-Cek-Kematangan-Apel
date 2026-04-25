# ⚡ QUICK START - Panduan Cepat

## 🎯 Mulai dalam 5 Menit!

### Step 1: Install Dependencies (2 menit)

Buka Command Prompt atau PowerShell di folder project:

```powershell
pip install -r requirements.txt
```

### Step 2: Jalankan Server (30 detik)

```powershell
python server.py
```

Anda akan melihat output seperti ini:

```
🍎 Starting Apple Ripeness Detection Server...
Server running at http://localhost:5000
```

### Step 3: Buka Aplikasi (30 detik)

Buka browser dan pergi ke:

```
http://localhost:5000
```

### Step 4: Gunakan Aplikasi! 🎉

1. Klik area upload atau drag & drop gambar apel
2. Klik tombol "🔍 Analisis Kematangan"
3. Lihat hasilnya!

---

## 📸 Tips Foto yang Bagus

✅ **Baik:**

- Apel terlihat jelas di tengah gambar
- Latar belakang sederhana (putih atau warna solid)
- Pencahayaan terang
- Tidak ada blur/sepia

❌ **Hindari:**

- Apel terlalu kecil
- Latar belakang kompleks
- Cahaya gelap
- Apel sebagian saja

---

## 🐛 Masalah Umum

| Problem                   | Solusi                                      |
| ------------------------- | ------------------------------------------- |
| Port 5000 sudah digunakan | Ubah port di server.py baris 153            |
| Import Error              | Jalankan: `pip install -r requirements.txt` |
| Aplikasi tidak buka       | Tunggu 5 detik, refresh browser             |
| Deteksi gagal             | Pastikan internet lancar, coba foto lain    |

---

## 📊 Memahami Hasil

```
🔴 Matang Sempurna (95%)
   ↓
   Apel siap dikonsumsi, kepercayaan 95%

🟢 Belum Matang (88%)
   ↓
   Tunggu beberapa hari lagi

🟤 Terlalu Matang (92%)
   ↓
   Konsumsi segera atau buang
```

---

## 💡 Tips Penggunaan

1. **Untuk Foto Berkamera**: Klik tombol 📷
2. **Untuk Drag & Drop**: Langsung seret file ke area
3. **Untuk Ulang**: Klik tombol "↻ Upload Ulang"
4. **Screenshot Hasil**: Print halaman atau screenshot

---

## 🔌 Server Berjalan?

Jika melihat pesan seperti ini, server siap:

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://localhost:5000
```

Tekan `Ctrl+C` untuk stop server.

---

**Selamat mencoba! 🍎✨**
