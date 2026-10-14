-- Full Live Clipboard backend. Run once in the Supabase SQL Editor of a new project.

create table public.clipboard_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  title text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table public.clipboard_items (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.clipboard_rooms(room_code) on delete cascade,
  type text not null check (type in ('text','image','file')),
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clipboard_items_room_code_idx on public.clipboard_items(room_code, created_at desc);

alter table public.clipboard_rooms enable row level security;
alter table public.clipboard_items enable row level security;

create policy "public read rooms" on public.clipboard_rooms for select to anon, authenticated using (true);
create policy "public insert rooms" on public.clipboard_rooms for insert to anon, authenticated with check (true);
create policy "public update rooms" on public.clipboard_rooms for update to anon, authenticated using (true) with check (true);
create policy "public read items" on public.clipboard_items for select to anon, authenticated using (true);
create policy "public insert items" on public.clipboard_items for insert to anon, authenticated with check (true);

alter publication supabase_realtime add table public.clipboard_items;

insert into storage.buckets (id, name, public, file_size_limit)
values ('clipboard-files', 'clipboard-files', true, 52428800)
on conflict (id) do nothing;

create policy "public upload clipboard files" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'clipboard-files');
