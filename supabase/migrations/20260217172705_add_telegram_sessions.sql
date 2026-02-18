-- Create telegram_sessions table
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_token text UNIQUE NOT NULL,
    session_string text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can do everything" ON public.telegram_sessions
USING (true)
WITH CHECK (true);
