-- Initial schema for SchoolAttend (single-school deployment).
-- Run this file in Supabase SQL Editor before connecting the application.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'teacher' check (role in ('admin', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.school_classes (
  id text primary key,
  name text not null,
  formation text not null,
  address text not null default '',
  city text not null default '',
  room text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id text primary key,
  name text not null,
  email text not null,
  class_id text references public.school_classes(id) on delete set null,
  class_name text not null default '',
  status text not null default 'Actif' check (status in ('Actif', 'Inactif')),
  signature text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id text primary key,
  name text not null,
  email text not null unique,
  phone text not null default '',
  subject text not null,
  status text not null default 'Actif' check (status in ('Actif', 'Inactif')),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(id) on delete restrict,
  student_name text not null,
  class_name text not null default '',
  signature text not null,
  attendance_date date not null default current_date,
  attendance_time time not null default localtime,
  status text not null check (status in ('Présent', 'Retard', 'Absent')),
  session_label text not null default 'journée',
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint attendance_one_status_per_session unique (student_id, attendance_date, session_label)
);

create table if not exists public.school_documents (
  id text primary key,
  title text not null,
  type text not null,
  student_id text not null references public.students(id) on delete restrict,
  student_name text not null,
  created_at date not null default current_date,
  reference text not null unique,
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists students_class_id_idx on public.students(class_id);
create index if not exists students_name_idx on public.students(name);
create index if not exists attendance_date_idx on public.attendance_records(attendance_date desc);
create index if not exists attendance_student_date_idx on public.attendance_records(student_id, attendance_date desc);
create index if not exists documents_student_idx on public.school_documents(student_id);

-- The helper is SECURITY DEFINER so RLS policies can read the current role
-- without recursively invoking the profiles table's own policies.
create or replace function public.current_school_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'teacher'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_school_profile on auth.users;
create trigger on_auth_user_created_school_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.school_classes enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.school_documents enable row level security;

drop policy if exists "profile_read_own_or_admin" on public.profiles;
create policy "profile_read_own_or_admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.current_school_role() = 'admin');

drop policy if exists "admin_manage_profiles" on public.profiles;
create policy "admin_manage_profiles" on public.profiles
  for all to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');

drop policy if exists "authenticated_read_classes" on public.school_classes;
create policy "authenticated_read_classes" on public.school_classes
  for select to authenticated using (true);
drop policy if exists "admin_manage_classes" on public.school_classes;
create policy "admin_manage_classes" on public.school_classes
  for all to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');

drop policy if exists "authenticated_read_students" on public.students;
create policy "authenticated_read_students" on public.students
  for select to authenticated using (true);
drop policy if exists "admin_manage_students" on public.students;
create policy "admin_manage_students" on public.students
  for all to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');

drop policy if exists "authenticated_read_teachers" on public.teachers;
create policy "authenticated_read_teachers" on public.teachers
  for select to authenticated using (true);
drop policy if exists "admin_manage_teachers" on public.teachers;
create policy "admin_manage_teachers" on public.teachers
  for all to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');

drop policy if exists "authenticated_read_attendance" on public.attendance_records;
create policy "authenticated_read_attendance" on public.attendance_records
  for select to authenticated using (true);
drop policy if exists "staff_insert_attendance" on public.attendance_records;
create policy "staff_insert_attendance" on public.attendance_records
  for insert to authenticated
  with check (
    public.current_school_role() = 'admin'
    or (
      public.current_school_role() = 'teacher'
      and (recorded_by is null or recorded_by = (select auth.uid()))
    )
  );
drop policy if exists "admin_update_attendance" on public.attendance_records;
create policy "admin_update_attendance" on public.attendance_records
  for update to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');
drop policy if exists "admin_delete_attendance" on public.attendance_records;
create policy "admin_delete_attendance" on public.attendance_records
  for delete to authenticated
  using (public.current_school_role() = 'admin');

drop policy if exists "admin_manage_documents" on public.school_documents;
create policy "admin_manage_documents" on public.school_documents
  for all to authenticated
  using (public.current_school_role() = 'admin')
  with check (public.current_school_role() = 'admin');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.school_classes to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.teachers to authenticated;
grant select, insert, update, delete on public.attendance_records to authenticated;
grant select, insert, update, delete on public.school_documents to authenticated;
