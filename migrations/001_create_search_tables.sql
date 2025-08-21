-- Migration: Create search and discovery tables
-- This migration adds tables for saved searches, recent searches, and user event interactions

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recent_searches table
CREATE TABLE IF NOT EXISTS recent_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_term TEXT NOT NULL,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_event_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_event_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id, interaction_type)
);

-- Add view_count column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at);

CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_created_at ON recent_searches(created_at);

CREATE INDEX IF NOT EXISTS idx_user_event_interactions_user_id ON user_event_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_interactions_event_id ON user_event_interactions(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_interactions_type ON user_event_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_events_view_count ON events(view_count);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can insert their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can update their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can delete their own saved searches" ON saved_searches;

DROP POLICY IF EXISTS "Users can view their own recent searches" ON recent_searches;
DROP POLICY IF EXISTS "Users can insert their own recent searches" ON recent_searches;
DROP POLICY IF EXISTS "Users can update their own recent searches" ON recent_searches;
DROP POLICY IF EXISTS "Users can delete their own recent searches" ON recent_searches;

DROP POLICY IF EXISTS "Users can view their own event interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can insert their own event interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can update their own event interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can delete their own event interactions" ON user_event_interactions;

-- Create RLS policies
CREATE POLICY "Users can view their own saved searches" ON saved_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved searches" ON saved_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON saved_searches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON saved_searches
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recent searches" ON recent_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent searches" ON recent_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recent searches" ON recent_searches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches" ON recent_searches
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own event interactions" ON user_event_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own event interactions" ON user_event_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event interactions" ON user_event_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event interactions" ON user_event_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update view count
CREATE OR REPLACE FUNCTION increment_event_view_count(event_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE events 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to track event view
CREATE OR REPLACE FUNCTION track_event_view(event_uuid UUID, user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Increment view count
    PERFORM increment_event_view_count(event_uuid);
    
    -- Record user interaction
    INSERT INTO user_event_interactions (user_id, event_id, interaction_type)
    VALUES (user_uuid, event_uuid, 'view')
    ON CONFLICT (user_id, event_id, interaction_type) 
    DO UPDATE SET created_at = NOW();
END;
$$ LANGUAGE plpgsql;
