-- SDN Karang Tengah 1 V3 - Production schema
create extension if not exists pgcrypto;

create table if not exists public.school_profile (
 id integer primary key default 1 check (id=1),
 name text not null default 'SDN Karang Tengah 1', npsn text, status text, level text default 'Sekolah Dasar',
 accreditation text, principal text, students integer, staff integer, address text, city text, phone text, email text,
 maps_url text, profile_title text, description text, vision text, mission jsonb not null default '[]'::jsonb,
 hero_subtitle text, spmb_title text, spmb_description text, spmb_url text, updated_at timestamptz not null default now()
);

create table if not exists public.class_groups (
 id uuid primary key default gen_random_uuid(), name text not null, grade integer, academic_year text, semester text,
 student_count integer, male_count integer, female_count integer, homeroom_teacher text, room text, source_note text,
 published boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.extracurriculars (
 id uuid primary key default gen_random_uuid(), name text not null, day text, start_time time, end_time time, location text,
 coach text, trainer text, participant_grades text, capacity integer, description text, image_url text,
 active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.extracurricular_activities (
 id uuid primary key default gen_random_uuid(), extracurricular_id uuid not null references public.extracurriculars(id) on delete cascade,
 title text not null, activity_date date not null, description text, image_url text, published boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.programs (
 id uuid primary key default gen_random_uuid(), title text not null, description text, sort_order integer not null default 0,
 published boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.news (
 id uuid primary key default gen_random_uuid(), title text not null, excerpt text, content text, image_url text,
 published boolean not null default true, published_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.announcements (
 id uuid primary key default gen_random_uuid(), title text not null, body text, published boolean not null default true,
 published_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.achievements (
 id uuid primary key default gen_random_uuid(), title text not null, category text, level text, year integer, description text,
 published boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.gallery (
 id uuid primary key default gen_random_uuid(), title text not null, image_url text not null, published boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(), title text not null, category text, description text, file_url text not null,
 published boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.school_schedules (
 id uuid primary key default gen_random_uuid(), day text, title text not null, time_text text, class_name text, description text,
 sort_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.sync_runs (
 id uuid primary key default gen_random_uuid(), source_url text, status text not null, note text, created_at timestamptz not null default now()
);

create table if not exists public.sync_staging (
 id uuid primary key default gen_random_uuid(), source_url text, payload jsonb not null, status text not null default 'pending',
 reviewed_at timestamptz, created_at timestamptz not null default now()
);

do $$ declare t text; begin
 foreach t in array ARRAY['school_profile','class_groups','extracurriculars','extracurricular_activities','programs','news','announcements','achievements','gallery','documents','school_schedules','sync_runs','sync_staging']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

-- Public read policies
create policy "public profile read" on public.school_profile for select using (true);
create policy "public class groups read" on public.class_groups for select using (published=true or auth.role()='authenticated');
create policy "public extracurriculars read" on public.extracurriculars for select using (active=true or auth.role()='authenticated');
create policy "public activities read" on public.extracurricular_activities for select using (published=true or auth.role()='authenticated');
create policy "public programs read" on public.programs for select using (published=true or auth.role()='authenticated');
create policy "public news read" on public.news for select using (published=true or auth.role()='authenticated');
create policy "public announcements read" on public.announcements for select using (published=true or auth.role()='authenticated');
create policy "public achievements read" on public.achievements for select using (published=true or auth.role()='authenticated');
create policy "public gallery read" on public.gallery for select using (published=true or auth.role()='authenticated');
create policy "public documents read" on public.documents for select using (published=true or auth.role()='authenticated');
create policy "public schedules read" on public.school_schedules for select using (published=true or auth.role()='authenticated');

-- Authenticated admin CRUD
create policy "admin profile" on public.school_profile for all to authenticated using (true) with check (true);
create policy "admin class groups" on public.class_groups for all to authenticated using (true) with check (true);
create policy "admin extracurriculars" on public.extracurriculars for all to authenticated using (true) with check (true);
create policy "admin activities" on public.extracurricular_activities for all to authenticated using (true) with check (true);
create policy "admin programs" on public.programs for all to authenticated using (true) with check (true);
create policy "admin news" on public.news for all to authenticated using (true) with check (true);
create policy "admin announcements" on public.announcements for all to authenticated using (true) with check (true);
create policy "admin achievements" on public.achievements for all to authenticated using (true) with check (true);
create policy "admin gallery" on public.gallery for all to authenticated using (true) with check (true);
create policy "admin documents" on public.documents for all to authenticated using (true) with check (true);
create policy "admin schedules" on public.school_schedules for all to authenticated using (true) with check (true);
create policy "admin sync runs" on public.sync_runs for all to authenticated using (true) with check (true);
create policy "admin sync staging" on public.sync_staging for all to authenticated using (true) with check (true);

insert into public.school_profile(id,name,npsn,status,level,accreditation,students,staff,address,city,email,maps_url,profile_title,description,vision,mission,hero_subtitle,spmb_title,spmb_description,spmb_url)
values(1,'SDN Karang Tengah 1','20607151','Negeri','Sekolah Dasar','A',345,20,'Jalan Raden Saleh No. 118, Kelurahan Karang Tengah, Kecamatan Karang Tengah, Kota Tangerang, Banten 15157','Kota Tangerang','sdnkarteng1@gmail.com','https://www.google.com/maps/search/?api=1&query=SDN+Karang+Tengah+1+Kota+Tangerang','Sekolah Dasar Negeri di Karang Tengah, Kota Tangerang','Website ini menjadi pusat informasi digital SDN Karang Tengah 1 untuk peserta didik, orang tua/wali, guru, tenaga kependidikan, dan masyarakat.','','[]'::jsonb,'Ruang belajar yang aman, aktif, dan mendukung tumbuh kembang peserta didik.','Informasi SPMB','Jadwal, persyaratan, jalur, daya tampung dan tautan pendaftaran dapat diperbarui oleh admin.','https://spmb.tangerangkota.go.id/')
on conflict(id) do nothing;

insert into storage.buckets(id,name,public) values('school-media','school-media',true)
on conflict(id) do update set public=true;

create policy "public school media" on storage.objects for select using (bucket_id='school-media');
create policy "admin upload school media" on storage.objects for insert to authenticated with check (bucket_id='school-media');
create policy "admin update school media" on storage.objects for update to authenticated using (bucket_id='school-media') with check (bucket_id='school-media');
create policy "admin delete school media" on storage.objects for delete to authenticated using (bucket_id='school-media');

-- ===== V4 additions =====
alter table public.school_profile add column if not exists logo_url text;
alter table public.sync_staging add column if not exists source_name text;
alter table public.sync_staging add column if not exists field_name text;
alter table public.sync_staging add column if not exists current_value jsonb;
alter table public.sync_staging add column if not exists candidate_value jsonb;
alter table public.sync_staging add column if not exists confidence numeric(5,2);
alter table public.sync_staging add column if not exists fetched_at timestamptz default now();
create table if not exists public.sync_sources (
 id uuid primary key default gen_random_uuid(), name text not null, source_url text not null,
 source_type text not null default 'html' check(source_type in ('html','json')), enabled boolean not null default true,
 priority integer not null default 100,
 allowed_fields jsonb not null default '["name","npsn","status","level","accreditation","principal","students","staff","address","city"]'::jsonb,
 parser_config jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.sync_sources enable row level security;
create policy "admin sync sources" on public.sync_sources for all to authenticated using (true) with check (true);

-- V4.3 profile social media and media url fields
alter table public.school_profile add column if not exists instagram_url text;
alter table public.school_profile add column if not exists facebook_url text;
alter table public.school_profile add column if not exists youtube_url text;
alter table public.school_profile add column if not exists tiktok_url text;
alter table public.school_profile add column if not exists whatsapp_url text;
alter table public.school_profile add column if not exists profile_image_url text;
alter table public.school_profile add column if not exists hero_image_url text;

-- V4.4 media candidates table for review workflow
create table if not exists public.media_candidates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  image_url text not null,
  storage_url text,
  title text,
  description text,
  media_type text not null check (media_type in ('hero','profile','gallery','news','extracurricular','achievement')),
  confidence numeric(5,2) default 85.00,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.media_candidates enable row level security;
create policy "admin media candidates" on public.media_candidates for all to authenticated using (true) with check (true);

-- V4.5 content candidates table (Source B: Internet Content Sync)
-- DO NOT mix with sync_staging (sync_staging is exclusively for school profile fields).
-- Public frontend MUST NOT access content_candidates.
create table if not exists public.content_candidates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  original_title text not null,
  original_content text,
  original_excerpt text,
  original_image_url text,
  published_date timestamptz,
  detected_at timestamptz not null default now(),
  confidence numeric(5,2) not null default 85.00,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  ai_draft_title text,
  ai_draft_content text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.content_candidates enable row level security;
create policy "admin content candidates" on public.content_candidates for all to authenticated using (true) with check (true);


