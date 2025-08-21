'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  HeartIcon, 
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShareIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  userId: string;
  className?: string;
}

interface UserEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image?: string;
  status: 'attended' | 'upcoming' | 'cancelled';
  rating?: number;
  review?: string;
}

interface UserStats {
  totalEvents: number;
  attendedEvents: number;
  upcomingEvents: number;
  averageRating: number;
  totalReviews: number;
  favoriteCategories: string[];
}

export default function UserProfile({ userId, className = "" }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'reviews' | 'friends'>('overview');
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalEvents: 0,
    attendedEvents: 0,
    upcomingEvents: 0,
    averageRating: 0,
    totalReviews: 0,
    favoriteCategories: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - in production this would come from an API
  useEffect(() => {
    const mockEvents: UserEvent[] = [
      {
        id: '1',
        title: 'Summer Music Festival',
        date: '2024-07-15',
        location: 'Central Park, NY',
        status: 'attended',
        rating: 5,
        review: 'Amazing experience! Great music and atmosphere.'
      },
      {
        id: '2',
        title: 'Food Truck Rally',
        date: '2024-08-20',
        location: 'Downtown Plaza',
        status: 'upcoming'
      },
      {
        id: '3',
        title: 'Art Gallery Opening',
        date: '2024-06-10',
        location: 'Modern Art Museum',
        status: 'attended',
        rating: 4,
        review: 'Beautiful artwork and great networking.'
      }
    ];

    const mockStats: UserStats = {
      totalEvents: mockEvents.length,
      attendedEvents: mockEvents.filter(e => e.status === 'attended').length,
      upcomingEvents: mockEvents.filter(e => e.status === 'upcoming').length,
      averageRating: mockEvents.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / mockEvents.filter(e => e.rating).length,
      totalReviews: mockEvents.filter(e => e.review).length,
      favoriteCategories: ['Music', 'Food', 'Art']
    };

    setUserEvents(mockEvents);
    setUserStats(mockStats);
    setIsLoading(false);
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended': return <CalendarIcon className="w-4 h-4" />;
      case 'upcoming': return <ClockIcon className="w-4 h-4" />;
      case 'cancelled': return <HeartIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--muted))] rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      {/* Profile Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--text))]">John Doe</h2>
              <p className="text-[rgb(var(--muted))] flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                New York, NY
              </p>
              <p className="text-sm text-[rgb(var(--muted))]">Member since 2023</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">
              {userStats.totalEvents}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {userStats.attendedEvents}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userStats.upcomingEvents}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {userStats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
          {[
            { id: 'overview', label: 'Overview', icon: UserIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon },
            { id: 'reviews', label: 'Reviews', icon: StarIcon },
            { id: 'friends', label: 'Friends', icon: HeartIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                activeTab === tab.id
                  ? "text-[rgb(var(--brand))] border-b-2 border-[rgb(var(--brand))]"
                  : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Favorite Categories */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Favorite Categories</h3>
              <div className="flex flex-wrap gap-2">
                {userStats.favoriteCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-[rgb(var(--brand))] text-white rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {userEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-[rgb(var(--text))]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[rgb(var(--text))]">{event.title}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">{formatDate(event.date)}</div>
                      </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(event.status))}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">My Events</h3>
              <div className="space-y-4">
                {userEvents.map((event) => (
                  <div key={event.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--text))] mb-2">{event.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                            <span className="text-[rgb(var(--muted))]">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                            <span className="text-[rgb(var(--muted))]">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <span className={cn("font-medium", getStatusColor(event.status))}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                        {event.rating && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < event.rating! ? "text-yellow-500 fill-current" : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-[rgb(var(--muted))]">
                              {event.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">My Reviews</h3>
              <div className="space-y-4">
                {userEvents.filter(e => e.review).map((event) => (
                  <div key={event.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-[rgb(var(--text))]">{event.title}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < event.rating! ? "text-yellow-500 fill-current" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[rgb(var(--text))] mb-3">{event.review}</p>
                    <div className="flex items-center justify-between text-sm text-[rgb(var(--muted))]">
                      <span>{formatDate(event.date)}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Friends</h3>
              <div className="text-center py-8 text-[rgb(var(--muted))]">
                <HeartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Friend integration coming soon!</p>
                <p className="text-sm">Connect with friends to see what events they're attending.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
