-- Jalankan di Supabase > SQL Editor
create table if not exists items (id text primary key, data jsonb not null);
create table if not exists tx    (id text primary key, data jsonb not null);
create table if not exists exp   (id text primary key, data jsonb not null);
create table if not exists rs    (id text primary key, data jsonb not null);

-- Hanya user yang sudah login yang boleh baca/tulis
alter table items enable row level security;
alter table tx    enable row level security;
alter table exp   enable row level security;
alter table rs    enable row level security;

create policy "login only" on items for all to authenticated using (true) with check (true);
create policy "login only" on tx    for all to authenticated using (true) with check (true);
create policy "login only" on exp   for all to authenticated using (true) with check (true);
create policy "login only" on rs    for all to authenticated using (true) with check (true);

-- Aktifkan realtime (data sinkron antar perangkat)
alter publication supabase_realtime add table items, tx, exp, rs;
