-- Add user_email column to profiles for easier lookups
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
