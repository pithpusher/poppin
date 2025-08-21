// Follow service for managing organizer follows and notifications

import { supabase } from './supabaseClient';

export interface FollowStatus {
  isFollowing: boolean;
  notificationPreferences: {
    newEvents: boolean;
    eventUpdates: boolean;
    specialOffers: boolean;
  };
  followDate?: string;
}

export interface FollowingOrganizer {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  location: string;
  eventCount: number;
  averageRating: number;
  followDate: string;
  lastEventDate?: string;
  notificationPreferences: {
    newEvents: boolean;
    eventUpdates: boolean;
    specialOffers: boolean;
  };
}

export interface NotificationPreferences {
  newEvents: boolean;
  eventUpdates: boolean;
  specialOffers: boolean;
}

class FollowService {
  /**
   * Follow an organizer
   */
  async followOrganizer(organizerId: string, notificationPreferences?: NotificationPreferences): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const defaultPreferences: NotificationPreferences = {
        newEvents: true,
        eventUpdates: true,
        specialOffers: false
      };

      const { error } = await supabase
        .from('user_follows')
        .insert({
          user_id: user.id,
          organizer_id: organizerId,
          notification_preferences: notificationPreferences || defaultPreferences
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following organizer:', error);
      return false;
    }
  }

  /**
   * Unfollow an organizer
   */
  async unfollowOrganizer(organizerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('organizer_id', organizerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing organizer:', error);
      return false;
    }
  }

  /**
   * Check if user is following an organizer
   */
  async checkFollowStatus(organizerId: string): Promise<FollowStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          isFollowing: false,
          notificationPreferences: {
            newEvents: true,
            eventUpdates: true,
            specialOffers: false
          }
        };
      }

      const { data, error } = await supabase
        .from('user_follows')
        .select('follow_date, notification_preferences')
        .eq('user_id', user.id)
        .eq('organizer_id', organizerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (data) {
        return {
          isFollowing: true,
          notificationPreferences: data.notification_preferences,
          followDate: data.follow_date
        };
      }

      return {
        isFollowing: false,
        notificationPreferences: {
          newEvents: true,
          eventUpdates: true,
          specialOffers: false
        }
      };
    } catch (error) {
      console.error('Error checking follow status:', error);
      return {
        isFollowing: false,
        notificationPreferences: {
          newEvents: true,
          eventUpdates: true,
          specialOffers: false
        }
      };
    }
  }

  /**
   * Update notification preferences for a followed organizer
   */
  async updateNotificationPreferences(
    organizerId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .update({ notification_preferences: preferences })
        .eq('user_id', user.id)
        .eq('organizer_id', organizerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Get list of organizers the user is following
   */
  async getFollowingList(): Promise<FollowingOrganizer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get following list with organizer details
      const { data, error } = await supabase
        .from('user_follows_view')
        .select('*')
        .eq('user_id', user.id)
        .order('follow_date', { ascending: false });

      if (error) throw error;

      // Transform data to match interface
      return (data || []).map(item => ({
        id: item.organizer_id,
        name: item.organizer_name,
        avatar: item.organizer_avatar,
        description: item.organizer_description,
        location: item.organizer_location,
        eventCount: 0, // Would need to be fetched separately
        averageRating: 0, // Would need to be fetched separately
        followDate: item.follow_date,
        notificationPreferences: item.notification_preferences
      }));
    } catch (error) {
      console.error('Error getting following list:', error);
      return [];
    }
  }

  /**
   * Get followers count for an organizer
   */
  async getFollowersCount(organizerId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_organizer_followers_count', { org_id: organizerId });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  }

  /**
   * Send notification to followers when a new event is created
   */
  async notifyFollowersOfNewEvent(
    organizerId: string, 
    eventId: string, 
    eventTitle: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all followers who want new event notifications
      const { data: followers, error: followersError } = await supabase
        .from('user_follows')
        .select('user_id')
        .eq('organizer_id', organizerId)
        .eq('notification_preferences->>newEvents', 'true');

      if (followersError) throw followersError;

      if (!followers || followers.length === 0) return true;

      // Create notification logs for each follower
      const notifications = followers.map(follower => ({
        user_id: follower.user_id,
        organizer_id: organizerId,
        event_id: eventId,
        notification_type: 'newEvent',
        title: 'New Event from Organizer',
        message: `${eventTitle} has been created by an organizer you follow!`,
        delivery_status: 'pending'
      }));

      const { error: notificationsError } = await supabase
        .from('notification_logs')
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      return true;
    } catch (error) {
      console.error('Error notifying followers:', error);
      return false;
    }
  }

  /**
   * Send notification to followers when an event is updated
   */
  async notifyFollowersOfEventUpdate(
    organizerId: string, 
    eventId: string, 
    eventTitle: string,
    updateType: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all followers who want event update notifications
      const { data: followers, error: followersError } = await supabase
        .from('user_follows')
        .select('user_id')
        .eq('organizer_id', organizerId)
        .eq('notification_preferences->>eventUpdates', 'true');

      if (followersError) throw followersError;

      if (!followers || followers.length === 0) return true;

      // Create notification logs for each follower
      const notifications = followers.map(follower => ({
        user_id: follower.user_id,
        organizer_id: organizerId,
        event_id: eventId,
        notification_type: 'eventUpdate',
        title: 'Event Update',
        message: `${eventTitle} has been updated: ${updateType}`,
        delivery_status: 'pending'
      }));

      const { error: notificationsError } = await supabase
        .from('notification_logs')
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      return true;
    } catch (error) {
      console.error('Error notifying followers of event update:', error);
      return false;
    }
  }

  /**
   * Send special offer notification to followers
   */
  async notifyFollowersOfSpecialOffer(
    organizerId: string, 
    offerTitle: string, 
    offerDescription: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all followers who want special offer notifications
      const { data: followers, error: followersError } = await supabase
        .from('user_follows')
        .select('user_id')
        .eq('organizer_id', organizerId)
        .eq('notification_preferences->>specialOffers', 'true');

      if (followersError) throw followersError;

      if (!followers || followers.length === 0) return true;

      // Create notification logs for each follower
      const notifications = followers.map(follower => ({
        user_id: follower.user_id,
        organizer_id: organizerId,
        notification_type: 'specialOffer',
        title: 'Special Offer',
        message: `${offerTitle}: ${offerDescription}`,
        delivery_status: 'pending'
      }));

      const { error: notificationsError } = await supabase
        .from('notification_logs')
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      return true;
    } catch (error) {
      console.error('Error notifying followers of special offer:', error);
      return false;
    }
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          organizers(name, avatar_url),
          events(title, image_url)
        `)
        .eq('user_id', user.id)
        .is('read_at', null)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

// Create singleton instance
export const followService = new FollowService();

// Export for use in components
export default followService;
