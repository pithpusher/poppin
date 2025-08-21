'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  UserMinusIcon,
  BellIcon,
  BellSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FollowOrganizerProps {
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  className?: string;
}

interface FollowStatus {
  isFollowing: boolean;
  notificationPreferences: {
    newEvents: boolean;
    eventUpdates: boolean;
    specialOffers: boolean;
  };
  followDate?: string;
}

export default function FollowOrganizer({ 
  organizerId, 
  organizerName, 
  organizerAvatar, 
  className = "" 
}: FollowOrganizerProps) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    notificationPreferences: {
      newEvents: true,
      eventUpdates: true,
      specialOffers: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock follow status - in production this would come from an API
  useEffect(() => {
    // Simulate checking if user is already following
    const mockFollowStatus: FollowStatus = {
      isFollowing: false,
      notificationPreferences: {
        newEvents: true,
        eventUpdates: true,
        specialOffers: false
      }
    };
    setFollowStatus(mockFollowStatus);
  }, [organizerId]);

  const handleFollow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFollowStatus(prev => ({
        ...prev,
        isFollowing: true,
        followDate: new Date().toISOString()
      }));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Failed to follow organizer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFollowStatus(prev => ({
        ...prev,
        isFollowing: false,
        followDate: undefined
      }));
    } catch (err) {
      setError('Failed to unfollow organizer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (preference: keyof FollowStatus['notificationPreferences']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFollowStatus(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [preference]: !prev.notificationPreferences[preference]
        }
      }));
    } catch (err) {
      setError('Failed to update notification preferences.');
    }
  };

  const getFollowButton = () => {
    if (followStatus.isFollowing) {
      return (
        <button
          onClick={handleUnfollow}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserMinusIcon className="w-4 h-4" />
          {isLoading ? 'Unfollowing...' : 'Unfollow'}
        </button>
      );
    }

    return (
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlusIcon className="w-4 h-4" />
        {isLoading ? 'Following...' : 'Follow'}
      </button>
    );
  };

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
              {organizerAvatar ? (
                <img 
                  src={organizerAvatar} 
                  alt={organizerName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserPlusIcon className="w-8 h-8 text-[rgb(var(--text))]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--text))]">{organizerName}</h2>
              <p className="text-[rgb(var(--muted))]">
                {followStatus.isFollowing ? 'You are following this organizer' : 'Follow to get notified of new events'}
              </p>
              {followStatus.followDate && (
                <p className="text-sm text-[rgb(var(--muted))]">
                  Following since {new Date(followStatus.followDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {followStatus.isFollowing && (
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                title="Notification preferences"
              >
                <BellIcon className="w-5 h-5" />
              </button>
            )}
            {getFollowButton()}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg mx-6 mb-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckIcon className="w-5 h-5" />
            <span>You are now following {organizerName}!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-lg mx-6 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {showPreferences && followStatus.isFollowing && (
        <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4 flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              {
                key: 'newEvents' as const,
                label: 'New Events',
                description: 'Get notified when this organizer creates new events'
              },
              {
                key: 'eventUpdates' as const,
                label: 'Event Updates',
                description: 'Get notified of changes to existing events'
              },
              {
                key: 'specialOffers' as const,
                label: 'Special Offers',
                description: 'Get notified of discounts and special promotions'
              }
            ].map((preference) => (
              <div key={preference.key} className="flex items-center justify-between p-3 bg-[rgb(var(--bg))] rounded-lg">
                <div>
                  <div className="font-medium text-[rgb(var(--text))]">{preference.label}</div>
                  <div className="text-sm text-[rgb(var(--muted))]">{preference.description}</div>
                </div>
                <button
                  onClick={() => handleNotificationToggle(preference.key)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    followStatus.notificationPreferences[preference.key]
                      ? "bg-[rgb(var(--brand))] text-white"
                      : "bg-[rgb(var(--muted))] text-[rgb(var(--text))] hover:bg-[rgb(var(--muted))]/80"
                  )}
                >
                  {followStatus.notificationPreferences[preference.key] ? (
                    <BellIcon className="w-4 h-4" />
                  ) : (
                    <BellSlashIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Following Benefits */}
      {followStatus.isFollowing && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Following Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-[rgb(var(--text))]">Early Access</div>
                  <div className="text-sm text-[rgb(var(--muted))]">Be first to know about new events</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-[rgb(var(--text))]">Exclusive Content</div>
                  <div className="text-sm text-[rgb(var(--muted))]">Get behind-the-scenes updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
