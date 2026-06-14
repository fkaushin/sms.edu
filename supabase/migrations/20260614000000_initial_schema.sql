-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Departments Table
create table public.departments (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Subjects Table
create table public.subjects (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    department_id uuid references public.departments(id) on delete cascade not null,
    credits integer not null default 3
);

-- 3. Create Profiles Table (extends auth.users)
create type public.user_role as enum ('ADMIN', 'STUDENT');

create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    role user_role default 'STUDENT'::user_role not null,
    email varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Students Table
create table public.students (
    id uuid references public.profiles(id) on delete cascade primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    enrollment_no varchar(50) unique not null,
    date_of_birth date,
    gender varchar(20),
    phone varchar(50),
    address text,
    department_id uuid references public.departments(id) on delete set null,
    year integer not null default 1,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Attendance Table
create table public.attendance (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    subject_id uuid references public.subjects(id) on delete cascade not null,
    date date not null,
    status varchar(20) not null check (status in ('PRESENT', 'ABSENT', 'LATE')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(student_id, subject_id, date)
);

-- 6. Create Marks Table
create table public.marks (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    subject_id uuid references public.subjects(id) on delete cascade not null,
    score numeric(5,2) not null,
    max_score numeric(5,2) not null,
    grade varchar(5),
    exam_type varchar(50) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Reports Table
create table public.reports (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    type varchar(50) not null,
    file_url varchar(1024) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Activities Table
create table public.activities (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title varchar(255) not null,
    description text,
    type varchar(50) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- INDEXES
-- ==========================================
create index idx_students_department on public.students(department_id);
create index idx_attendance_student on public.attendance(student_id);
create index idx_attendance_subject on public.attendance(subject_id);
create index idx_marks_student on public.marks(student_id);
create index idx_activities_user on public.activities(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.departments enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.marks enable row level security;
alter table public.reports enable row level security;
alter table public.activities enable row level security;

-- Departments Policies
create policy "Departments are viewable by all authenticated users."
on public.departments for select to authenticated using (true);

create policy "Departments are manageable by admins."
on public.departments for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Subjects Policies
create policy "Subjects are viewable by all authenticated users."
on public.subjects for select to authenticated using (true);

create policy "Subjects are manageable by admins."
on public.subjects for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Profiles Policies
create policy "Profiles are viewable by self."
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Profiles are viewable by admins."
on public.profiles for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
);

create policy "Profiles are updatable by self."
on public.profiles for update to authenticated
using (auth.uid() = id);

create policy "Profiles are manageable by admins."
on public.profiles for all to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
);

-- Students Policies
create policy "Students are viewable by self."
on public.students for select to authenticated
using (auth.uid() = id);

create policy "Students are viewable and manageable by admins."
on public.students for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Attendance Policies
create policy "Attendance is viewable by self."
on public.attendance for select to authenticated
using (auth.uid() = student_id);

create policy "Attendance is viewable and manageable by admins."
on public.attendance for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Marks Policies
create policy "Marks are viewable by self."
on public.marks for select to authenticated
using (auth.uid() = student_id);

create policy "Marks are viewable and manageable by admins."
on public.marks for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Reports Policies
create policy "Reports are viewable by all authenticated users."
on public.reports for select to authenticated using (true);

create policy "Reports are manageable by admins."
on public.reports for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Activities Policies
create policy "Activities are viewable by self."
on public.activities for select to authenticated
using (auth.uid() = user_id);

create policy "Activities are viewable by admins."
on public.activities for select to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

create policy "Activities can be inserted by authenticated users."
on public.activities for insert to authenticated
with check (auth.uid() = user_id);

create policy "Activities manageable by admins."
on public.activities for all to authenticated
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- ==========================================
-- TRIGGERS
-- ==========================================
-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
