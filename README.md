# Website Resmi SDN Karang Tengah 1 — Kota Tangerang

Website resmi sekolah dasar negeri modern, terpercaya, dan profesional dengan arsitektur terintegrasi:
- frontend publik responsif dan ramah orang tua murid,
- Supabase Auth + Postgres + Storage,
- Admin dashboard,
- upload foto/logo,
- berita, pengumuman, prestasi, galeri, rombel, ekstrakurikuler, dokumen, jadwal, SPMB,
- sosial media,
- Smart Sync + staging (tidak auto-overwrite data sekolah).

## Identitas awal yang sudah dimasukkan
- Nama: SD NEGERI KARANG TENGAH 1
- NPSN: 20607151
- Status: Negeri
- Alamat: Jalan Raden Saleh No. 118, Karang Tengah, Kecamatan Karang Tengah, Kota Tangerang
- Akreditasi: A
- 345 peserta didik
- 12 rombel
- 15 guru + 5 tenaga kependidikan/pegawai
- Email: sdnkarteng1@gmail.com
- Website lama: http://sdnkarteng1.blogspot.com
- Hero fallback memakai foto publik sekolah dari layanan Sekolah Kita/Kemendikdasmen.

## Catatan identitas visual
`assets/brand-kt1.svg` adalah **brand mark web**, bukan logo resmi sekolah.
Jika sekolah mempunyai logo resmi, upload melalui Admin dan sistem akan menggantinya.

## Setup Supabase
1. Buat project Supabase baru khusus SDN Karang Tengah 1.
2. Edit:
   - `js/config.js`
   - `admin/js/config.js`
3. Isi Project URL + Publishable Key.
4. SQL Editor jalankan berurutan:
   - `sql/schema.sql`
   - `sql/v4_patch.sql`
   - `sql/v4_3_patch.sql`
   - `sql/seed_karang_tengah_1.sql`
5. Buat admin user di Authentication.
6. Pastikan bucket `school-media` tersedia dan public sesuai schema/policy.
7. Deploy frontend ke GitHub Pages.

## Prinsip data
Data internet hanya kandidat/referensi. Data manual yang sudah diverifikasi admin adalah sumber utama.
