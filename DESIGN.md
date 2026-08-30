# MathDasar UI Design System

Dokumen ini menjadi acuan visual frontend Matrikulasi. Sistem mengambil karakter dari referensi: teal akademik yang tenang, kanvas netral terang, tipografi tegas, dan komponen ringkas dengan batas halus.

## Prinsip

1. **Jelas sebelum dekoratif.** Informasi belajar, status, dan aksi utama harus terbaca dalam sekali pindai.
2. **Teal berarti aksi dan progres.** Gunakan warna primary untuk tombol utama, navigasi aktif, tautan, fokus input, dan indikator progres.
3. **Warna semantik tidak boleh tertukar.** Hijau hanya untuk berhasil, amber untuk peringatan/proses, merah untuk gagal atau aksi destruktif, dan biru terang untuk informasi.
4. **Permukaan ringan.** Halaman memakai kanvas abu hangat; kartu tetap putih dengan border lembut dan shadow tipis.

## Palet warna

### Primary

| Token | Hex | Penggunaan |
| --- | --- | --- |
| Primary 900 | `#134E4A` | Kontras/teks teal paling gelap |
| Primary 800 | `#115E59` | Hover kuat |
| Primary 700 | `#0F766E` | Hover tombol dan aksen gelap |
| Primary 600 | `#0D9488` | Tombol, navigasi aktif, progres |
| Primary 500 | `#14B8A6` | Aksen sekunder |
| Primary 300 | `#5EEAD4` | Aksen lembut |
| Primary 50 | `#E6F6F5` | Latar aktif dan info ringan |

### Neutral

| Token | Hex | Penggunaan |
| --- | --- | --- |
| Ink | `#111827` | Heading dan teks utama |
| Neutral 700 | `#374151` | Teks isi kuat |
| Neutral 500 | `#52606D` | Teks sekunder |
| Neutral 400 | `#6B7280` | Label dan placeholder |
| Border | `#E6E9EC` | Garis pemisah dan border kartu |
| Canvas | `#F6F7F8` | Latar aplikasi |
| Surface | `#FFFFFF` | Kartu, sidebar, modal |

### Semantic

| Makna | Warna utama | Latar lembut |
| --- | --- | --- |
| Sukses | `#10B981` | `#ECFDF5` |
| Peringatan | `#F59E0B` | `#FFFBEB` |
| Error | `#EF4444` | `#FEF2F2` |
| Informasi | `#3B82F6` | `#EFF6FF` |
| Pendukung | `#8B5CF6` | `#F5F3FF` |

## Tipografi

- **Heading:** Poppins 600–700. H1 halaman 24–32 px; H2 bagian 18–24 px; judul kartu 14–16 px.
- **Body dan UI:** Inter 400–700. Body 14–16 px; label 12–14 px; metadata minimal 11 px.
- Heading menggunakan tracking sedikit rapat. Huruf kapital penuh hanya untuk eyebrow atau label pendek.

Font dimuat melalui Google Fonts dan selalu memiliki fallback `system-ui` agar UI tetap stabil saat offline.

## Komponen

- **Button primary:** latar Primary 600, teks putih, hover Primary 700, radius 12–16 px.
- **Button outline:** latar putih, border Primary 600, teks Primary 700.
- **Card:** putih, border 1 px `#E6E9EC`, radius 16 px, shadow tipis. Elevasi bertambah hanya ketika hover atau modal.
- **Input:** latar putih atau neutral 50, border neutral 100/200. Fokus memakai Primary 600 dan ring teal transparan.
- **Badge:** radius 8 px, warna mengikuti status; jangan memakai primary untuk status sukses/gagal.
- **Progress:** track neutral 100, fill Primary 600.
- **Sidebar:** permukaan putih, item aktif Primary 50 dengan ikon dan teks Primary 700.

## Layout dan aksesibilitas

- Lebar konten maksimum `80rem` (`max-w-7xl`) dengan padding 16 px pada mobile dan 32 px pada desktop.
- Jarak dasar mengikuti kelipatan 4 px; jarak antarseksi utama 24–32 px.
- Target interaksi minimum 40 px. Semua kontrol keyboard wajib memiliki focus ring yang terlihat.
- Teks normal harus mempertahankan kontras minimum WCAG AA. Jangan menaruh teks abu muda di atas putih untuk informasi penting.

## Implementasi

Token didefinisikan pada `src/index.css` melalui `@theme`. Skala utility Tailwind `blue-*` sengaja dipetakan ke skala primary teal, sehingga komponen lama dan baru mengikuti brand yang sama. Untuk komponen baru, gunakan utility tersebut dan hindari hex lokal kecuali warna semantik yang belum memiliki token.
