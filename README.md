# 🍎 Cek Kematangan Apel - Apple Ripeness Detection System

Aplikasi web untuk mengecek tingkat kematangan apel menggunakan AI model dari Roboflow. Aplikasi ini menggunakan teknologi machine learning untuk menganalisis gambar apel dan menentukan tingkat kematangannya (belum matang, matang sempurna, atau terlalu matang).

## 🚀 Fitur

- 📸 **Upload Gambar** - Drag & drop atau pilih file gambar
- 📷 **Gunakan Kamera** - Ambil foto langsung dari perangkat
- 🤖 **AI Detection** - Menggunakan Roboflow AI untuk analisis
- 📊 **Hasil Real-time** - Tampilkan hasil dengan tingkat kepercayaan
- 🎯 **Akurat** - Model terlatih khusus untuk deteksi kematangan apel

## 📋 Requirements

- Python 3.8+
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🔧 Setup & Installation

### 1. Instalasi Dependencies Python

```bash
# Masuk ke folder project
cd "Web Cek Kematangan Apel"

# Install Flask dan dependencies
pip install flask pillow inference-sdk

# Atau gunakan requirements.txt (jika ada):
# pip install -r requirements.txt
```

### 2. Konfigurasi Roboflow API

API key dan workspace sudah dikonfigurasi di `server.py`:

- **API Key**: `atskCHUBF2ID0riGFZqk`
- **Workspace**: `liyang-s65dy`
- **Workflow**: `apelmatang`

Jika ingin mengganti dengan dataset sendiri, edit file `server.py` baris 16-17.

## 🏃 Menjalankan Aplikasi

### Method 1: Menjalankan dari Terminal

```bash
# Masuk ke folder project
cd "Web Cek Kematangan Apel"

# Jalankan server
python server.py
```

Server akan berjalan di: **http://localhost:5000**

Buka browser dan akses: `http://localhost:5000`

### Method 2: Menggunakan Command Prompt

```cmd
# Masuk ke folder
cd C:\Users\liyan\Downloads\Web Cek Kematangan Apel

# Jalankan dengan Python
python server.py
```

## 📝 Cara Menggunakan

1. **Buka Aplikasi**
   - Buka browser di `http://localhost:5000`

2. **Upload Gambar**
   - Drag & drop gambar apel ke area yang ditandai
   - Atau klik area untuk memilih file
   - Atau gunakan tombol 📷 untuk mengambil foto dengan kamera

3. **Analisis**
   - Klik tombol "🔍 Analisis Kematangan"
   - Tunggu proses analisis selesai

4. **Lihat Hasil**
   - Status kematangan apel akan ditampilkan
   - Tingkat kepercayaan (confidence) akan ditampilkan dalam persen
   - Jumlah apel yang terdeteksi

## 📊 Interpretasi Hasil

Aplikasi mendeteksi 2 kategori tingkat kematangan apel:

| Status               | Deskripsi                                    | Emoji  |
| -------------------- | -------------------------------------------- | ------ |
| 🟢 Apel Tidak Matang | Apel masih mentah, belum siap dikonsumsi     | Hijau  |
| 🔴 Apel Matang       | Apel dalam kondisi ideal untuk dikonsumsi    | Merah  |

## 📁 Struktur File

```
Web Cek Kematangan Apel/
├── server.py                  # Backend Flask server
├── package.json               # Node.js dependencies (webpack)
├── web/
│   ├── index.html            # Halaman utama
│   ├── style.css             # Styling
│   ├── script.js             # Frontend logic
│   └── apel-1100x1100.jpg    # Sample image
└── README.md                  # File ini
```

## 🔌 API Endpoints

### POST /api/detect

Melakukan analisis kematangan apel

**Request:**

```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "detections": [
    {
      "label": "Matang",
      "confidence": 0.95,
      "x": 100,
      "y": 150,
      "width": 80,
      "height": 90
    }
  ]
}
```

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'flask'"

```bash
pip install flask
```

### Error: "ModuleNotFoundError: No module named 'inference_sdk'"

```bash
pip install inference-sdk
```

### Port 5000 sudah digunakan

Edit `server.py` line 153:

```python
app.run(debug=True, host='localhost', port=8000)  # Ubah port ke 8000
```

### Gambar tidak terdeteksi

- Pastikan gambar berkualitas baik
- Apel dalam gambar terlihat jelas
- Resolusi minimal 200x200 pixels
- Format: JPG, PNG, WebP

## 📞 Support

Untuk masalah atau pertanyaan:

1. Pastikan Python dan semua dependencies terinstall
2. Periksa koneksi internet (untuk API Roboflow)
3. Restart server Flask
4. Clear cache browser (Ctrl+Shift+Delete)

## 📄 License

Proyek ini menggunakan Roboflow API untuk deteksi gambar.

---

**Built using Flask & Roboflow AI**

Version: 1.0  
Last Updated: 2026-04-23
