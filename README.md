# Frontend MathDasar

Frontend web aplikasi matrikulasi matematika yang dibangun menggunakan React dan Vite. Frontend
dijalankan langsung menggunakan Node.js/npm, sedangkan backend dan database dijalankan melalui
Docker dari folder `backend`.

## Teknologi

- React 19
- Vite 7
- React Router
- Tailwind CSS 4
- Framer Motion
- Lucide React

## Prasyarat

Instal aplikasi berikut:

1. Node.js 20.19+ atau 22.12+.
2. npm, sudah tersedia bersama Node.js.
3. Backend MathDasar yang berjalan di `http://localhost:8000`.

Periksa versi:

```powershell
node --version
npm --version
```

Disarankan menggunakan Node.js versi LTS terbaru yang kompatibel dengan Vite 7.

## Struktur penting

```text
frontend/
├── public/                 # File statis
├── src/
│   ├── components/         # Komponen layout dan UI bersama
│   ├── pages/              # Halaman admin, dosen, dan mahasiswa
│   ├── api.js              # Client HTTP ke backend
│   ├── App.jsx             # Route aplikasi
│   ├── index.css           # Tema dan style global
│   └── main.jsx            # Entry point React
├── index.html
├── package.json
└── vite.config.js
```

## Instalasi

Buka PowerShell di folder frontend:

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\frontend"
npm install
```

`npm install` cukup dijalankan saat pertama kali setup atau setelah dependency di `package.json`
berubah.

## Menjalankan frontend

Pastikan backend sudah aktif, lalu jalankan:

```powershell
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

Frontend otomatis memakai backend pada:

```text
http://<hostname-halaman>:8000
```

Jika frontend dibuka melalui `localhost`, request API menuju `http://localhost:8000`.

## Menjalankan backend yang dibutuhkan frontend

Buka terminal PowerShell terpisah:

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\backend"
docker compose --env-file .env.docker up -d
```

Backend tidak perlu dijalankan manual dengan `uvicorn` jika container Docker sudah aktif.

## Urutan menjalankan seluruh aplikasi

### Terminal 1 — backend dan database

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\backend"
docker compose --env-file .env.docker up -d --build
```

### Terminal 2 — frontend

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\frontend"
npm install
npm run dev
```

### Browser

Buka http://localhost:5173.

## Akun dummy development

Akun dummy dibuat dari backend:

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\backend"
docker compose --env-file .env.docker exec backend python scripts/seed_postgres_dummy.py
```

| Role | NIM/ID | Password |
|---|---|---|
| Admin | `ADM001` | `admin123` |
| Dosen | `DSN001` | `dosen123` |
| Mahasiswa | `MHS001` | `mahasiswa123` |

Login menggunakan NIM/ID, bukan email.

## Perintah npm

Menjalankan development server:

```powershell
npm run dev
```

Memeriksa lint:

```powershell
npm run lint
```

Membuat production build:

```powershell
npm run build
```

Preview hasil production build:

```powershell
npm run preview
```

Hasil build tersimpan di folder `dist`.

## Konfigurasi URL backend

Secara default `src/api.js` menggunakan host halaman frontend dan port `8000`. URL dapat diubah
melalui environment Vite.

Buat file `.env.local` di folder frontend jika diperlukan:

```dotenv
VITE_API_URL=http://localhost:8000
```

Setelah mengubah environment, restart Vite:

```powershell
# Tekan Ctrl+C pada terminal Vite, lalu:
npm run dev
```

Jangan menambahkan trailing slash pada `VITE_API_URL`.

## Role dan halaman utama

### Admin

- Melihat daftar akun.
- Membuat dan mengedit akun admin, dosen, dan mahasiswa.
- Mengaktifkan/nonaktifkan akun.
- Mereset password pengguna melalui form Edit.
- Mengatur enrollment mahasiswa ke modul.

### Dosen

- Mengelola materi PDF dan YouTube.
- Mengelola soal.
- Melihat mahasiswa yang terdaftar.
- Melihat antrean jawaban dan memberikan nilai.

### Mahasiswa

- Melihat modul yang sudah di-enroll admin.
- Mengerjakan pretest, soal Bab, dan posttest.
- Melihat hasil dan rekomendasi materi.

## Troubleshooting

### Pesan “Backend tidak dapat dihubungi”

Periksa backend:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Jika gagal:

```powershell
cd "D:\KULIAH\TUGAS AKHIR\web\web matrikulasi\backend"
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail 100 backend
```

### Port 5173 sudah digunakan

Vite biasanya menawarkan port berikutnya. Untuk menentukan port lain secara manual:

```powershell
npm run dev -- --port 5174
```

### Perubahan frontend belum muncul

1. Refresh browser.
2. Periksa terminal Vite untuk error.
3. Hentikan Vite dengan `Ctrl+C` lalu jalankan `npm run dev` kembali.
4. Jika dependency berubah, jalankan `npm install` kembali.

### Dependency bermasalah

Jalankan instalasi ulang normal terlebih dahulu:

```powershell
npm install
```

Hindari menghapus `package-lock.json` kecuali memang sedang memperbaiki resolusi dependency dan
memahami dampak perubahan versi package.

## Catatan keamanan

- Jangan menyimpan token atau kredensial produksi di source code frontend.
- `VITE_*` selalu dapat terlihat oleh browser; jangan menaruh secret/API key di sana.
- Token login disimpan dalam `sessionStorage` dan hilang ketika sesi browser ditutup.
