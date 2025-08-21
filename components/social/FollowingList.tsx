'use client';

import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  UserMinusIcon,
  BellIcon,
  BellSlashIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FollowingListProps {
  className?: string;
}

interface FollowingOrganizer {
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

export default function FollowingList({ className = "" }: FollowingListProps) {
  const [following, setFollowing] = useState<FollowingOrganizer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'events' | 'rating'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Mock following data - in production this would come from an API
  useEffect(() => {
    const mockFollowing: FollowingOrganizer[] = [
      {
        id: '1',
        name: 'Event Masters Inc.',
        description: 'Professional event planning and management services',
        location: 'New York, NY',
        eventCount: 24,
        averageRating: 4.8,
        followDate: '2024-01-15',
        lastEventDate: '2024-07-20',
        notificationPreferences: {
          newEvents: true,
          eventUpdates: true,
          specialOffers: false
        }
      },
      {
        id: '2',
        name: 'Music Festival Co.',
        description: 'Annual music festivals and live entertainment events',
        location: 'Los Angeles, CA',
        eventCount: 12,
        averageRating: 4.9,
        followDate: '2024-03-10',
        lastEventDate: '2024-08-15',
        notificationPreferences: {
          newEvents: true,
          eventUpdates: false,
          specialOffers: true
        }
      },
      {
        id: '3',
        name: 'Art & Culture Society',
        description: 'Promoting arts, culture, and community events',
        location: 'Chicago, IL',
        eventCount: 18,
        averageRating: 4.6,
        followDate: '2024-02-28',
        lastEventDate: '2024-07-10',
        notificationPreferences: {
          newEvents: true,
          eventUpdates: true,
          specialOffers: true
        }
      },
      {
        id: '4',
        name: 'Tech Innovation Hub',
        description: 'Technology conferences and innovation workshops',
        location: 'San Francisco, CA',
        eventCount: 31,
        averageRating: 4.7,
        followDate: '2024-04-05',
        lastEventDate: '2024-09-01',
        notificationPreferences: {
          newEvents: true,
          eventUpdates: true,
          specialOffers: false
        }
      }
    ];

    setFollowing(mockFollowing);
    setIsLoading(false);
  }, []);

  const handleUnfollow = async (organizerId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFollowing(prev => prev.filter(org => org.id !== organizerId));
    } catch (err) {
      console.error('Failed to unfollow organizer:', err);
    }
  };

  const handleNotificationToggle = async (organizerId: string, preference: keyof FollowingOrganizer['notificationPreferences']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFollowing(prev => prev.map(org => 
        org.id === organizerId 
          ? {
              ...org,
              notificationPreferences: {
                ...org.notificationPreferences,
                [preference]: !org.notificationPreferences[preference]
              }
            }
          : org
      ));
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
    }
  };

  const filteredAndSortedFollowing = following
    .filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.followDate).getTime() - new Date(a.followDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'events':
          return b.eventCount - a.eventCount;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--muted))] rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[rgb(var(--muted))] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--text))]">Following</h2>
              <p className="text-[rgb(var(--muted))]">
                {following.length} organizer{following.length !== 1 ? 's' : ''} you're following
              </p>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name</option>
            <option value="events">Most Events</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Following List */}
      <div className="p-6">
        {filteredAndSortedFollowing.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4 opacity-50" />
            <p className="text-lg text-[rgb(var(--text))] mb-2">
              {searchQuery ? 'No organizers found' : 'Not following any organizers yet'}
            </p>
            <p className="text-[rgb(var(--muted))]">
              {searchQuery ? 'Try adjusting your search terms' : 'Start following organizers to get notified of their events'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedFollowing.map((organizer) => (
              <div key={organizer.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
                      {organizer.avatar ? (
                        <img 
                          src={organizer.avatar} 
                          alt={organizer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <UserGroupIcon className="w-8 h-8 text-[rgb(var(--text))]" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">{organizer.name}</h3>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-[rgb(var(--muted))]">{organizer.averageRating}</span>
                        </div>
                      </div>
                      
                      <p className="text-[rgb(var(--muted))] mb-3">{organizer.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))]">{organizer.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))]">{organizer.eventCount} events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[rgb(var(--muted))]">
                            Following since {formatDate(organizer.followDate)}
                          </span>
                        </div>
                      </div>
                      
                      {organizer.lastEventDate && (
                        <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                          Last event: {formatDate(organizer.lastEventDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Notification Preferences */}
                    <div className="flex flex-col gap-1">
                      {Object.entries(organizer.notificationPreferences).map(([key, enabled]) => (
                        <button
                          key={key}
                          onClick={() => handleNotificationToggle(organizer.id, key as keyof FollowingOrganizer['notificationPreferences'])}
                          className={cn(
                            "p-1 rounded transition-colors",
                            enabled
                              ? "text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80"
                              : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                          )}
                          title={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} notifications ${enabled ? 'enabled' : 'disabled'}`}
                        >
                          {enabled ? (
                            <BellIcon className="w-4 h-4" />
                          ) : (
                            <BellSlashIcon className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Unfollow Button */}
                    <button
                      onClick={() => handleUnfollow(organizer.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Unfollow organizer"
                    >
                      <UserMinusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
