-- SDN Karang Tengah 1 - seed awal
-- Jalankan setelah sql/schema.sql, sql/v4_patch.sql, dan sql/v4_3_patch.sql.
insert into public.school_profile (
  id,name,npsn,status,level,accreditation,students,staff,address,city,email,maps_url,
  profile_title,description,hero_subtitle,logo_url,hero_image_url,spmb_title,spmb_description,spmb_url
) values (
  1,
  'SDN Karang Tengah 1',
  '20607151',
  'Negeri',
  'Sekolah Dasar',
  'A',
  345,
  20,
  'Jalan Raden Saleh No. 118, Kelurahan Karang Tengah, Kecamatan Karang Tengah, Kota Tangerang, Banten 15157',
  'Kota Tangerang',
  'sdnkarteng1@gmail.com',
  'https://www.google.com/maps/search/?api=1&query=SDN+Karang+Tengah+1+Kota+Tangerang',
  'Sekolah Dasar Negeri di Karang Tengah, Kota Tangerang',
  'Portal informasi digital SDN Karang Tengah 1 untuk profil, kegiatan, berita, prestasi, dokumen, dan layanan informasi sekolah.',
  'Ruang belajar yang aman, aktif, dan mendukung tumbuh kembang peserta didik.',
  'assets/brand-kt1.svg',
  'https://file.data.kemendikdasmen.go.id/sekolahkita/20/2060/20607151-13.jpg',
  'Informasi SPMB',
  'Jadwal, jalur, persyaratan, daya tampung, dan tautan pendaftaran dapat diperbarui melalui Admin.',
  'https://spmb.tangerangkota.go.id/'
)
on conflict (id) do update set
  name=excluded.name,npsn=excluded.npsn,status=excluded.status,level=excluded.level,
  accreditation=excluded.accreditation,students=excluded.students,staff=excluded.staff,
  address=excluded.address,city=excluded.city,email=excluded.email,maps_url=excluded.maps_url,
  profile_title=excluded.profile_title,description=excluded.description,hero_subtitle=excluded.hero_subtitle,
  spmb_title=excluded.spmb_title,spmb_description=excluded.spmb_description,spmb_url=excluded.spmb_url;

insert into public.class_groups (name,grade,academic_year,semester,student_count,published)
values
('1 A','Kelas 1','2025/2026','Genap',23,true),
('1 B','Kelas 1','2025/2026','Genap',21,true),
('2 A','Kelas 2','2025/2026','Genap',25,true),
('2 B','Kelas 2','2025/2026','Genap',25,true),
('3 A','Kelas 3','2025/2026','Genap',29,true),
('3 B','Kelas 3','2025/2026','Genap',28,true),
('4 A','Kelas 4','2025/2026','Genap',35,true),
('4 B','Kelas 4','2025/2026','Genap',35,true),
('5 A','Kelas 5','2025/2026','Genap',34,true),
('5 B','Kelas 5','2025/2026','Genap',32,true),
('6 A','Kelas 6','2025/2026','Genap',30,true),
('6 B','Kelas 6','2025/2026','Genap',29,true);
