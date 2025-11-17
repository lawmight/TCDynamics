-- Supabase Feedback Table Setup
-- Run this SQL in your Supabase SQL editor to create the feedback table

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL CHECK (form_type IN ('demo', 'contact')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  user_email TEXT,
  user_company TEXT,
  allow_followup BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on form_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_feedback_form_type ON feedback(form_type);

-- Create index on created_at for date range queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Create index on rating for analytics
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- Enable Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from your backend (authenticated)
CREATE POLICY "Enable insert for authenticated users" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow reads for authenticated users only
CREATE POLICY "Enable read for authenticated users" ON feedback
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional: Grant permissions to service role (if using service key)
GRANT ALL ON feedback TO service_role;
