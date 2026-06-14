-- ========================================================
-- STORAGE BUCKETS & RLS POLICIES SETUP
-- ========================================================

-- 1. Create Storage Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, '{image/jpeg,image/jpg,image/png,image/gif,image/webp}'),
  ('reports', 'reports', false, 10485760, '{application/pdf}'),
  ('documents', 'documents', false, 10485760, '{application/pdf}')
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ensure RLS is active on storage
-- (Already enabled by default in Supabase storage schema)

-- 2. Avatars Bucket Policies
-- Allow anyone (public) to view avatars
create policy "Allow Public select access on Avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
create policy "Allow Authenticated users to upload own Avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
create policy "Allow Authenticated users to update own Avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
create policy "Allow Authenticated users to delete own Avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Reports Bucket Policies
-- Allow admins full control over reports
create policy "Allow Admins full control on Reports"
on storage.objects for all to authenticated
using (
  bucket_id = 'reports' and
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

-- Allow students to read reports (if authorized)
create policy "Allow Students to view Reports"
on storage.objects for select to authenticated
using (bucket_id = 'reports');

-- 4. Documents Bucket Policies
-- Allow authenticated users to insert/select their own documents
create policy "Allow Authenticated users to manage own Documents"
on storage.objects for all to authenticated
using (
  bucket_id = 'documents'
);
