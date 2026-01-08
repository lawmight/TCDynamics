-- ================================================
-- TC Dynamics Supabase Database Schema
-- ================================================
-- Run this SQL in your Supabase SQL Editor
-- Project: https://anrouunclxibnyyisztz.supabase.co
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: contacts
-- Purpose: Store contact form submissions
-- ================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'website', -- Track where the contact came from
    status TEXT DEFAULT 'new', -- new, contacted, qualified, closed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for public form submissions)
CREATE POLICY "Allow anonymous inserts on contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Create policy to allow service role to read all contacts
CREATE POLICY "Allow service role to read contacts"
ON contacts FOR SELECT
USING (true);

-- ================================================
-- Table: demo_requests
-- Purpose: Store demo request form submissions
-- ================================================
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    job_title TEXT,
    company_size TEXT, -- e.g., '1-10', '11-50', '51-200', '201-1000', '1000+'
    industry TEXT,
    use_case TEXT, -- What they want to use the product for
    timeline TEXT, -- When they want to start: 'immediate', '1-3 months', '3-6 months', '6+ months'
    message TEXT,
    preferred_date TEXT, -- Preferred demo date/time
    status TEXT DEFAULT 'pending', -- pending, scheduled, completed, cancelled
    demo_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_company ON demo_requests(company);

-- Enable Row Level Security (RLS)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on demo_requests"
ON demo_requests FOR INSERT
WITH CHECK (true);

-- Create policy to allow service role to read all demo requests
CREATE POLICY "Allow service role to read demo_requests"
ON demo_requests FOR SELECT
USING (true);

-- ================================================
-- Table: chat_conversations
-- Purpose: Store chat conversation logs
-- ================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL, -- Client-generated session ID
    user_id UUID, -- Optional: if users are authenticated
    user_email TEXT, -- Optional: capture email if provided
    messages JSONB NOT NULL, -- Array of message objects [{role: 'user'|'assistant', content: '...', timestamp: '...'}]
    metadata JSONB, -- Additional metadata (user agent, IP, referrer, etc.)
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    conversation_status TEXT DEFAULT 'active', -- active, ended, abandoned
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_email ON chat_conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_at ON chat_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(conversation_status);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on chat_conversations"
ON chat_conversations FOR INSERT
WITH CHECK (true);

-- Create policy to allow session-based reads
CREATE POLICY "Allow users to read their own conversations"
ON chat_conversations FOR SELECT
USING (true); -- In production, you might want to restrict this

-- Create policy to allow session-based updates
CREATE POLICY "Allow users to update their own conversations"
ON chat_conversations FOR UPDATE
USING (true);

-- ================================================
-- Function: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_requests_updated_at
    BEFORE UPDATE ON demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Test Queries (Optional - uncomment to run)
-- ================================================
-- SELECT * FROM contacts LIMIT 10;
-- SELECT * FROM demo_requests LIMIT 10;
-- SELECT * FROM chat_conversations LIMIT 10;

-- ================================================
-- Cleanup (Optional - uncomment to drop tables)
-- ================================================
-- DROP TABLE IF EXISTS contacts CASCADE;
-- DROP TABLE IF EXISTS demo_requests CASCADE;
-- DROP TABLE IF EXISTS chat_conversations CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ================================================
-- Schema Setup Complete
-- ================================================
-- Next Steps:
-- 1. Copy this SQL and run it in Supabase SQL Editor
-- 2. Verify tables were created successfully
-- 3. Configure environment variables in Vercel:
--    - SUPABASE_URL=https://anrouunclxibnyyisztz.supabase.co
--    - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
--    - SUPABASE_SERVICE_KEY=(get from Supabase Settings > API)
-- ================================================
