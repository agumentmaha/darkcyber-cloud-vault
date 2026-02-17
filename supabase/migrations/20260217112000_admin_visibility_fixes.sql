-- Migration: Admin Visibility Fixes
-- Description: Adds a foreign key relationship between files and profiles for easier joins,
-- and adds explicit RLS policies for administrator access to all files.

-- 1. Add foreign key relationship if it doesn't exist
-- Note: id in profiles already references auth.users(id)
-- user_id in files already references auth.users(id)
-- This allows Supabase to automatically resolve the relation in .select('*, profiles(*)')
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'files_user_id_fkey_profiles') THEN
        ALTER TABLE public.files
        ADD CONSTRAINT files_user_id_fkey_profiles
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Refine RLS policies for administrators
-- Administrators should be able to view, update, and delete any file regardless of ownership.

-- View Policy
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;
CREATE POLICY "Admins can view all files" ON public.files
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Update Policy
DROP POLICY IF EXISTS "Admins can update any file" ON public.files;
CREATE POLICY "Admins can update any file" ON public.files
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Delete Policy
DROP POLICY IF EXISTS "Admins can delete any file" ON public.files;
CREATE POLICY "Admins can delete any file" ON public.files
  FOR DELETE USING (public.is_admin(auth.uid()));
