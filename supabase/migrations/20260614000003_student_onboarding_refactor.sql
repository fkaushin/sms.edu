-- ==========================================
-- STUDENT ONBOARDING REFACTOR MIGRATION
-- ==========================================

-- 1. Alter Students table
alter table public.students
    add column personal_email text not null,
    add column university_email text unique not null,
    add column credentials_sent boolean default false not null,
    add column credentials_sent_at timestamp with time zone,
    add column first_login_completed boolean default false not null,
    add column account_status text default 'PENDING' not null check (account_status in ('PENDING', 'ACTIVE', 'SUSPENDED'));

-- 2. Create index on emails for fast lookup
create index idx_students_personal_email on public.students(personal_email);
create index idx_students_university_email on public.students(university_email);

-- 3. Create Enrollment Generator Function
create or replace function public.generate_next_enrollment_no(dept_id uuid)
returns text as $$
declare
    dept_prefix text;
    year_str text;
    last_seq int;
    next_seq_str text;
begin
    -- Get department prefix (CS, IT, EC, CM, or first two letters fallback)
    select upper(coalesce(
        case 
            when name = 'Computer Science' then 'CS'
            when name = 'Information Technology' then 'IT'
            when name = 'Electronics' then 'EC'
            when name = 'Commerce' then 'CM'
            else substring(name from 1 for 2)
        end, 'ST'
    )) into dept_prefix from public.departments where id = dept_id;

    -- Get current academic year
    year_str := to_char(now(), 'YYYY');

    -- Find the maximum sequence for the prefix and year
    select coalesce(
        max(cast(substring(enrollment_no from length(dept_prefix || year_str) + 1) as integer)),
        0
    ) into last_seq
    from public.students
    where enrollment_no like dept_prefix || year_str || '%';

    last_seq := last_seq + 1;
    next_seq_str := lpad(last_seq::text, 3, '0');

    return dept_prefix || year_str || next_seq_str;
end;
$$ language plpgsql;
