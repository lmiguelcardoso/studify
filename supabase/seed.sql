-- ============================================================
-- Studify — Storage Buckets
-- Run this in the Supabase SQL editor after applying migrations.
-- ============================================================

-- Bucket for PDFs and video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  false,
  52428800, -- 50 MB limit per file
  ARRAY[
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: user can only access their own files
-- Files must be stored under a path prefixed with the user's UUID: {user_id}/{filename}

CREATE POLICY "materials: user can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "materials: user can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "materials: user can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
