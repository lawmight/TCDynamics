-- =====================================================
-- Stripe to Polar Migration Script
-- =====================================================
-- This script adds Polar columns to orgs table and creates polar_events table
-- Run this BEFORE deploying Polar endpoints to ensure database is ready
-- =====================================================

-- Step 1: Add Polar columns to orgs table (keep Stripe for rollback)
ALTER TABLE orgs
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT UNIQUE;

-- Step 2: Create indexes for Polar columns
CREATE INDEX IF NOT EXISTS idx_orgs_polar_customer_id ON orgs(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_orgs_polar_subscription_id ON orgs(polar_subscription_id);

-- Step 3: Create polar_events table for webhook event tracking
CREATE TABLE IF NOT EXISTS polar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for polar_events
CREATE INDEX IF NOT EXISTS idx_polar_events_event_id ON polar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_polar_events_type ON polar_events(type);
CREATE INDEX IF NOT EXISTS idx_polar_events_created_at ON polar_events(created_at DESC);

-- Step 5: Enable RLS on polar_events
ALTER TABLE polar_events ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policy for polar_events (service role only)
CREATE POLICY "Service role can manage polar_events"
ON polar_events FOR ALL
USING (auth.role() = 'service_role');

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Deploy Polar API endpoints
-- 2. Test webhook delivery
-- 3. Monitor both Stripe and Polar during parallel operation
-- 4. After successful migration, run cleanup script to drop Stripe columns
-- =====================================================
