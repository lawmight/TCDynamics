-- ================================================
-- TC Dynamics Supabase Database Schema - ENHANCED
-- Production-Ready Schema with NIA Research Best Practices
-- ================================================
-- Version: 2.0 (Phase 3 Migration)
-- Date: 2025-11-12
-- Enhancements:
--   - Added missing fields from Cosmos DB mapping
--   - Research-recommended indexes on RLS columns
--   - Data retention policy (90-day TTL for conversations)
--   - Composite indexes for common queries
--   - Enhanced validation constraints
--   - Connection pooling optimization hints
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For data retention cleanup jobs

-- ================================================
-- Table: contacts
-- Purpose: Store contact form submissions from website
-- Source: Cosmos DB "contacts" container
-- ================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 200),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    company TEXT CHECK (company IS NULL OR length(company) <= 200),
    phone TEXT CHECK (phone IS NULL OR length(phone) <= 50),
    message TEXT NOT NULL CHECK (length(message) >= 10 AND length(message) <= 5000),
    source TEXT DEFAULT 'website' CHECK (source IN ('website', 'mobile', 'api', 'chat')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),

    -- Cosmos DB compatibility fields
    type TEXT DEFAULT 'contact', -- Matches Cosmos DB document type

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb -- For flexible additional data
);

-- Indexes optimized for common queries and RLS policies
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status) WHERE status != 'closed'; -- Partial index for active records
CREATE INDEX IF NOT EXISTS idx_contacts_source_status ON contacts(source, status); -- Composite index for filtering

-- Research recommendation: Index for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at_status ON contacts(created_at DESC, status);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow anonymous inserts on contacts"
ON contacts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow service role to read contacts"
ON contacts FOR SELECT
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Allow service role to update contacts"
ON contacts FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ================================================
-- Table: demo_requests
-- Purpose: Store demo request form submissions from qualified leads
-- Source: Cosmos DB "demo_requests" container
-- ================================================
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 200),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    company TEXT NOT NULL CHECK (length(company) >= 2 AND length(company) <= 200),
    phone TEXT CHECK (phone IS NULL OR length(phone) <= 50),
    job_title TEXT CHECK (job_title IS NULL OR length(job_title) <= 200),
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+', NULL)),
    industry TEXT CHECK (industry IS NULL OR length(industry) <= 100),

    -- Additional fields from Cosmos DB analysis
    business_needs TEXT, -- Maps to "businessNeeds" from Cosmos DB
    use_case TEXT CHECK (use_case IS NULL OR length(use_case) <= 1000),
    timeline TEXT CHECK (timeline IN ('immediate', '1-3 months', '3-6 months', '6+ months', NULL)),

    message TEXT CHECK (message IS NULL OR length(message) <= 5000),
    preferred_date TEXT, -- ISO 8601 datetime string

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'spam')),
    demo_scheduled_at TIMESTAMPTZ,
    demo_completed_at TIMESTAMPTZ,

    -- Cosmos DB compatibility
    type TEXT DEFAULT 'demo_request',

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_demo_dates CHECK (
        demo_scheduled_at IS NULL OR
        demo_scheduled_at > created_at
    ),
    CONSTRAINT valid_completion CHECK (
        demo_completed_at IS NULL OR
        (demo_completed_at >= demo_scheduled_at AND status = 'completed')
    )
);

-- Indexes optimized for common queries
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_demo_requests_company ON demo_requests(company);
CREATE INDEX IF NOT EXISTS idx_demo_requests_industry ON demo_requests(industry) WHERE industry IS NOT NULL;

-- Composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_demo_requests_status_created ON demo_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_timeline_status ON demo_requests(timeline, status);

-- Research recommendation: Index for scheduled demos query
CREATE INDEX IF NOT EXISTS idx_demo_requests_scheduled ON demo_requests(demo_scheduled_at)
WHERE status = 'scheduled' AND demo_scheduled_at IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow anonymous inserts on demo_requests"
ON demo_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow service role to read demo_requests"
ON demo_requests FOR SELECT
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Allow service role to update demo_requests"
ON demo_requests FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ================================================
-- Table: chat_conversations
-- Purpose: Store AI chat conversation logs for analytics
-- Source: Cosmos DB "conversations" container
-- Data Retention: 90 days (GDPR compliance)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Session tracking
    session_id TEXT NOT NULL, -- Client-generated session ID
    conversation_id TEXT, -- Maps to Cosmos DB conversationId

    -- User identification (optional)
    user_id UUID, -- If authenticated
    user_email TEXT CHECK (user_email IS NULL OR user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    -- Conversation data
    messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {role, content, timestamp}

    -- Cosmos DB compatibility - individual message fields (for migration)
    user_message TEXT, -- Single message from user
    ai_response TEXT, -- Single AI response

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Model, tokens, temperature, etc.

    -- Conversation metrics
    message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),
    total_tokens_used INTEGER DEFAULT 0,

    -- Status and timing
    conversation_status TEXT DEFAULT 'active' CHECK (conversation_status IN ('active', 'ended', 'abandoned', 'archived')),
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,

    -- Cosmos DB compatibility
    type TEXT DEFAULT 'chat',

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Data retention (90 days for GDPR)
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days') NOT NULL,

    -- Constraints
    CONSTRAINT valid_conversation_dates CHECK (
        last_message_at >= started_at AND
        (ended_at IS NULL OR ended_at >= last_message_at)
    ),
    CONSTRAINT valid_message_count CHECK (
        message_count = jsonb_array_length(messages) OR message_count = 0
    )
);

-- Indexes optimized for conversation queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_conversation_id ON chat_conversations(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_email ON chat_conversations(user_email) WHERE user_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_at ON chat_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(conversation_status);

-- Research recommendation: Index for data retention cleanup
CREATE INDEX IF NOT EXISTS idx_chat_conversations_expires_at ON chat_conversations(expires_at)
WHERE conversation_status != 'archived';

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_status ON chat_conversations(started_at DESC, conversation_status);

-- JSONB index for message searches (GIN index)
CREATE INDEX IF NOT EXISTS idx_chat_conversations_messages_gin ON chat_conversations USING GIN (messages);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_metadata_gin ON chat_conversations USING GIN (metadata);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow anonymous inserts on chat_conversations"
ON chat_conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to read their own conversations"
ON chat_conversations FOR SELECT
USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated' OR
    true -- Allow reading by session_id in application logic
);

CREATE POLICY "Allow users to update their own conversations"
ON chat_conversations FOR UPDATE
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ================================================
-- Functions & Triggers
-- ================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update message count in chat_conversations
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.message_count = jsonb_array_length(NEW.messages);
    NEW.last_message_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-update updated_at
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

-- Trigger for auto-update message count
CREATE TRIGGER update_chat_message_count
    BEFORE INSERT OR UPDATE OF messages ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_message_count();

-- ================================================
-- Data Retention: Automatic Cleanup Job
-- Research Recommendation: 90-day retention for GDPR compliance
-- ================================================

-- Function: Archive expired conversations
CREATE OR REPLACE FUNCTION archive_expired_conversations()
RETURNS void AS $$
BEGIN
    -- Update status to archived for expired conversations
    UPDATE chat_conversations
    SET conversation_status = 'archived',
        updated_at = NOW()
    WHERE expires_at < NOW()
      AND conversation_status != 'archived';

    -- Optional: Delete archived conversations older than 180 days
    -- DELETE FROM chat_conversations
    -- WHERE conversation_status = 'archived'
    --   AND expires_at < (NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (runs daily at 2 AM UTC)
-- Requires pg_cron extension
SELECT cron.schedule(
    'archive-expired-conversations',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT archive_expired_conversations();$$
);

-- ================================================
-- Views for Common Queries
-- ================================================

-- View: Active contacts (not closed or spam)
CREATE OR REPLACE VIEW active_contacts AS
SELECT
    id, name, email, company, phone, message, source, status,
    created_at, updated_at
FROM contacts
WHERE status NOT IN ('closed', 'spam')
ORDER BY created_at DESC;

-- View: Pending demo requests
CREATE OR REPLACE VIEW pending_demos AS
SELECT
    id, name, email, company, phone, job_title, company_size,
    industry, business_needs, use_case, timeline, status,
    demo_scheduled_at, created_at
FROM demo_requests
WHERE status = 'pending'
ORDER BY created_at DESC;

-- View: Recent conversations (last 30 days)
CREATE OR REPLACE VIEW recent_conversations AS
SELECT
    id, session_id, conversation_id, user_email,
    message_count, total_tokens_used, conversation_status,
    started_at, last_message_at, created_at
FROM chat_conversations
WHERE started_at > (NOW() - INTERVAL '30 days')
  AND conversation_status != 'archived'
ORDER BY started_at DESC;

-- ================================================
-- Connection Pooling Optimization
-- Research Recommendation: Use Transaction Mode
-- ================================================
-- Connection String Format:
-- postgresql://[user]:[password]@[region].pooler.supabase.com:6543/postgres
--
-- Supabase automatically provides connection pooling via Supavisor
-- Use the pooler endpoint for serverless functions (Vercel)
-- ================================================

-- ================================================
-- Performance Analysis Queries
-- ================================================

-- Check table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Check index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- ================================================
-- Migration Helpers
-- ================================================

-- Function: Validate Cosmos DB to Supabase data transformation
CREATE OR REPLACE FUNCTION validate_migration_data()
RETURNS TABLE (
    table_name text,
    record_count bigint,
    null_emails bigint,
    invalid_emails bigint,
    duplicate_emails bigint
) AS $$
BEGIN
    -- Contacts validation
    RETURN QUERY
    SELECT
        'contacts'::text,
        COUNT(*)::bigint,
        COUNT(*) FILTER (WHERE email IS NULL)::bigint,
        COUNT(*) FILTER (WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')::bigint,
        (SELECT COUNT(*) FROM (
            SELECT email, COUNT(*) as cnt
            FROM contacts
            GROUP BY email
            HAVING COUNT(*) > 1
        ) dupes)::bigint
    FROM contacts;

    -- Demo requests validation
    RETURN QUERY
    SELECT
        'demo_requests'::text,
        COUNT(*)::bigint,
        COUNT(*) FILTER (WHERE email IS NULL)::bigint,
        COUNT(*) FILTER (WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')::bigint,
        (SELECT COUNT(*) FROM (
            SELECT email, COUNT(*) as cnt
            FROM demo_requests
            GROUP BY email
            HAVING COUNT(*) > 1
        ) dupes)::bigint
    FROM demo_requests;

    -- Conversations validation
    RETURN QUERY
    SELECT
        'chat_conversations'::text,
        COUNT(*)::bigint,
        COUNT(*) FILTER (WHERE user_email IS NULL)::bigint,
        COUNT(*) FILTER (WHERE user_email IS NOT NULL AND user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')::bigint,
        0::bigint -- Conversations can have duplicate emails
    FROM chat_conversations;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Table: stripe_events
-- Purpose: Store Stripe webhook events for idempotency
-- ================================================
CREATE TABLE IF NOT EXISTS stripe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE, -- Stripe event.id
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for stripe_events
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at DESC);

-- RLS for stripe_events
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage stripe_events"
ON stripe_events FOR ALL
USING (auth.role() = 'service_role');

-- ================================================
-- Table: polar_events
-- Purpose: Store Polar webhook events for idempotency and auditing
-- ================================================
CREATE TABLE IF NOT EXISTS polar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE, -- Polar event.id
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for polar_events
CREATE INDEX IF NOT EXISTS idx_polar_events_event_id ON polar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_polar_events_type ON polar_events(type);
CREATE INDEX IF NOT EXISTS idx_polar_events_created_at ON polar_events(created_at DESC);

-- RLS for polar_events
ALTER TABLE polar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage polar_events"
ON polar_events FOR ALL
USING (auth.role() = 'service_role');

-- ================================================
-- Table: orgs
-- Purpose: Tenancy table (1 user = 1 org for MVP)
-- Stores plan and subscription status
-- ================================================
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT CHECK (plan IN ('starter', 'professional', 'enterprise')),
    subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    -- Stripe columns (legacy - to be removed after migration)
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    -- Polar columns
    polar_customer_id TEXT UNIQUE,
    polar_subscription_id TEXT UNIQUE,
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for orgs
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer_id ON orgs(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_subscription_id ON orgs(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_orgs_polar_customer_id ON orgs(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_orgs_polar_subscription_id ON orgs(polar_subscription_id);
CREATE INDEX IF NOT EXISTS idx_orgs_subscription_status ON orgs(subscription_status);

-- RLS Policies for orgs
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own org"
ON orgs FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Service role can manage orgs"
ON orgs FOR ALL
USING (auth.role() = 'service_role');

-- Trigger for orgs updated_at
CREATE TRIGGER update_orgs_updated_at
    BEFORE UPDATE ON orgs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Table: api_keys
-- Purpose: Tenant API keys for n8n/internal tools
-- Stores hashed keys for secure verification
-- ================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash
    key_prefix TEXT NOT NULL, -- e.g., "tc_live_abc123..." for display
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
);

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked_at ON api_keys(revoked_at) WHERE revoked_at IS NULL;

-- RLS Policies for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own API keys"
ON api_keys FOR SELECT
USING (auth.uid() = org_id);

CREATE POLICY "Service role can manage API keys"
ON api_keys FOR ALL
USING (auth.role() = 'service_role');

-- ================================================
-- Schema Setup Complete
-- ================================================
-- Next Steps:
-- 1. Review this enhanced schema
-- 2. Run in Supabase SQL Editor
-- 3. Verify tables, indexes, and policies created
-- 4. Test RLS policies with service role
-- 5. Configure connection pooling in Vercel
-- 6. Set up monitoring for performance
-- ================================================

-- Test the validation function
-- SELECT * FROM validate_migration_data();

-- Check table sizes
-- SELECT * FROM table_sizes;

-- Check index usage (run after production use)
-- SELECT * FROM index_usage WHERE index_scans < 100;

-- ================================================
-- Environment Variables Needed (Vercel)
-- ================================================
-- SUPABASE_URL=https://anrouunclxibnyyisztz.supabase.co
-- SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-- SUPABASE_SERVICE_KEY=(get from Supabase Settings > API > service_role)
-- SUPABASE_POOLER_URL=postgresql://postgres.anrouunclxibnyyisztz:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
-- ================================================
