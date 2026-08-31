-- Campus Companion Supabase schema
-- ---------------------------------
-- Run this file once in the Supabase SQL Editor.
-- Every table is owned by the signed-in user through auth.uid().

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  due_date date not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'urgent')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) <= 280),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null,
  grade numeric not null check (grade between 0 and 4),
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_time time not null,
  class_name text not null,
  room text not null,
  duration integer not null check (duration in (60, 90, 120)),
  created_at timestamptz not null default now()
);

-- RLS means a browser client can only read and change its own rows.
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.courses enable row level security;
alter table public.timetable enable row level security;

create policy "Users can manage their own assignments"
  on public.assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own notes"
  on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own courses"
  on public.courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own timetable"
  on public.timetable for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
