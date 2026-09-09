-- SDN Karang Tengah 1 - Media Candidates Schema Patch
-- Adds table for candidate media workflow: Source -> Candidate -> Admin Review -> Supabase Storage -> Public

create table if not exists public.media_candidates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  image_url text not null,
  title text,
  description text,
  media_type text not null check (media_type in ('hero','profile','gallery','news','extracurricular','achievement')),
  confidence numeric(5,2) default 85.00,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.media_candidates enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media_candidates' and policyname='admin media candidates') then
    create policy "admin media candidates" on public.media_candidates for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media_candidates' and policyname='public read approved media candidates') then
    create policy "public read approved media candidates" on public.media_candidates for select using (status = 'approved' or auth.role() = 'authenticated');
  end if;
end $$;

create index if not exists idx_media_candidates_status on public.media_candidates(status);
create index if not exists idx_media_candidates_type on public.media_candidates(media_type);

-- Seed verified initial candidate from Kemendikdasmen SekolahKita for Admin review
insert into public.media_candidates (source_name, source_url, image_url, title, description, media_type, confidence, status)
values (
  'Kemendikdasmen SekolahKita',
  'https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/f1350b91-2bf5-e011-97b7-af100d040a45',
  'https://file.data.kemendikdasmen.go.id/sekolahkita/20/2060/20607151-13.jpg',
  'Gedung & Lapangan SDN Karang Tengah 1',
  'Foto dokumentasi resmi gedung dan pekarangan sekolah pada pangkalan data Kemendikdasmen.',
  'hero',
  95.00,
  'pending'
)
on conflict do nothing;
