-- Migration: Create follow tables for organizer following functionality
-- This migration adds support for users to follow organizers and manage notification preferences

-- Create organizers table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_follows table to track which users follow which organizers
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    follow_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_preferences JSONB DEFAULT '{"newEvents": true, "eventUpdates": true, "specialOffers": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only follow an organizer once
    UNIQUE(user_id, organizer_id)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_organizer_id ON user_follows(organizer_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follow_date ON user_follows(follow_date);

-- Create notification_logs table to track sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('newEvent', 'eventUpdate', 'specialOffer')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed'))
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_organizer_id ON notification_logs(organizer_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivery_status ON notification_logs(delivery_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_follows_updated_at 
    BEFORE UPDATE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on user_follows table
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can insert their own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can update their own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON user_follows;

-- Users can only see their own follows
CREATE POLICY "Users can view their own follows" ON user_follows
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own follows
CREATE POLICY "Users can insert their own follows" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own follows
CREATE POLICY "Users can update their own follows" ON user_follows
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows" ON user_follows
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on notification_logs table
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own notifications" ON notification_logs;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notification_logs;
DROP POLICY IF EXISTS "Organizers can insert notifications for followers" ON notification_logs;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" ON notification_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Organizers can insert notifications for their followers
CREATE POLICY "Organizers can insert notifications for followers" ON notification_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_follows 
            WHERE user_follows.organizer_id = notification_logs.organizer_id 
            AND user_follows.user_id = notification_logs.user_id
        )
    );

-- Create functions after tables are fully created
CREATE OR REPLACE FUNCTION get_organizer_followers_count(org_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM user_follows 
        WHERE organizer_id = org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a user is following an organizer
CREATE OR REPLACE FUNCTION is_user_following_organizer(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_follows 
        WHERE user_id = user_uuid AND organizer_id = org_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's following list
CREATE OR REPLACE FUNCTION get_user_following_list(user_uuid UUID)
RETURNS TABLE (
    organizer_id UUID,
    organizer_name VARCHAR,
    organizer_description TEXT,
    organizer_location VARCHAR,
    organizer_avatar TEXT,
    follow_date TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.description,
        o.location,
        o.avatar_url,
        uf.follow_date,
        uf.notification_preferences
    FROM user_follows uf
    JOIN organizers o ON uf.organizer_id = o.id
    WHERE uf.user_id = user_uuid
    ORDER BY uf.follow_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy querying of follow relationships (after all tables and functions are created)
-- Ensure tables are committed before creating view
COMMIT;

-- Create a simple view first to avoid column reference issues
CREATE OR REPLACE VIEW user_follows_view AS
SELECT 
    uf.id,
    uf.user_id,
    uf.organizer_id,
    uf.follow_date,
    uf.notification_preferences,
    uf.created_at,
    uf.updated_at
FROM user_follows uf;

-- We can enhance this view later with JOINs once we confirm the basic structure works

-- Grant all permissions after everything is created
GRANT SELECT, INSERT, UPDATE, DELETE ON user_follows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_logs TO authenticated;
GRANT SELECT ON user_follows_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_organizer_followers_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_following_organizer(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_following_list(UUID) TO authenticated;
