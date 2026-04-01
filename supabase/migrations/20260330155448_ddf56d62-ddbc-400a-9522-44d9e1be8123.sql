
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  telegram_message_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON public.verification_requests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.verification_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON public.verification_requests FOR UPDATE USING (true);
