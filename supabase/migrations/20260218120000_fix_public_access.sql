-- Migration: Fix Public Access
-- Description: Ensures that public (anonymous) users can view non-blocked files.

BEGIN;

-- 1. Drop existing policy if it exists to avoid conflicts or staleness
DROP POLICY IF EXISTS "Public can view non-blocked files by slug" ON public.files;
DROP POLICY IF EXISTS "Public can view non-blocked files" ON public.files;

-- 2. Recreate the policy with explicit permissions for 'anon' and 'authenticated' roles
-- We use 'public' role to cover both, or we can just specify nothing for role to apply to all.
-- But to be safe and explicit, we'll apply to public.

CREATE POLICY "Public can view non-blocked files" 
ON public.files
FOR SELECT 
TO public
USING (is_blocked = false);

-- 3. Ensure RLS is enabled
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

COMMIT;
