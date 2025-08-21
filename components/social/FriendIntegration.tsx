'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  CalendarIcon, 
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FriendIntegrationProps {
  className?: string;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: 'friend' | 'pending' | 'suggested';
  mutualFriends: number;
  attendingEvents: string[];
  lastActive: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  friendsAttending: string[];
}

export default function FriendIntegration({ className = "" }: FriendIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'suggestions' | 'events'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in production this would come from an API
  useEffect(() => {
    const mockFriends: Friend[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        status: 'friend',
        mutualFriends: 12,
        attendingEvents: ['event1', 'event3'],
        lastActive: '2 hours ago'
      },
      {
        id: '2',
        name: 'Mike Chen',
        status: 'friend',
        mutualFriends: 8,
        attendingEvents: ['event2'],
        lastActive: '1 day ago'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        status: 'pending',
        mutualFriends: 15,
        attendingEvents: ['event1'],
        lastActive: '3 hours ago'
      },
      {
        id: '4',
        name: 'David Kim',
        status: 'suggested',
        mutualFriends: 6,
        attendingEvents: [],
        lastActive: '1 week ago'
      }
    ];

    const mockEvents: Event[] = [
      {
        id: 'event1',
        title: 'Summer Music Festival',
        date: '2024-07-15',
        location: 'Central Park, NY',
        friendsAttending: ['Sarah Johnson', 'Emily Rodriguez']
      },
      {
        id: 'event2',
        title: 'Food Truck Rally',
        date: '2024-08-20',
        location: 'Downtown Plaza',
        friendsAttending: ['Mike Chen']
      },
      {
        id: 'event3',
        title: 'Art Gallery Opening',
        date: '2024-06-10',
        location: 'Modern Art Museum',
        friendsAttending: ['Sarah Johnson']
      }
    ];

    setFriends(mockFriends);
    setEvents(mockEvents);
    setIsLoading(false);
  }, []);

  const handleFriendRequest = (friendId: string, action: 'accept' | 'reject' | 'add') => {
    setFriends(prev => 
      prev.map(friend => {
        if (friend.id === friendId) {
          switch (action) {
            case 'accept':
              return { ...friend, status: 'friend' as const };
            case 'reject':
              return { ...friend, status: 'suggested' as const };
            case 'add':
              return { ...friend, status: 'pending' as const };
            default:
              return friend;
          }
        }
        return friend;
      })
    );
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.friendsAttending.some(friend => 
      friend.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text))] flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
              Friends & Social
            </h2>
            <p className="text-[rgb(var(--muted))] mt-1">
              Connect with friends and see what events they're attending
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-[rgb(var(--border-color))]/20">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
          <input
            type="text"
            placeholder="Search friends or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
          {[
            { id: 'friends', label: 'Friends', icon: UserGroupIcon },
            { id: 'suggestions', label: 'Suggestions', icon: UserPlusIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon }
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
        {activeTab === 'friends' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Your Friends</h3>
              <div className="space-y-4">
                {filteredFriends.filter(f => f.status === 'friend').map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-[rgb(var(--text))]" />
                      </div>
                      <div>
                        <div className="font-medium text-[rgb(var(--text))]">{friend.name}</div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          {friend.mutualFriends} mutual friends • {friend.lastActive}
                        </div>
                        {friend.attendingEvents.length > 0 && (
                          <div className="text-sm text-[rgb(var(--brand))] mt-1">
                            Attending {friend.attendingEvents.length} event(s)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
                        <HeartIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Requests */}
            {filteredFriends.filter(f => f.status === 'pending').length > 0 && (
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Pending Requests</h3>
                <div className="space-y-3">
                  {filteredFriends.filter(f => f.status === 'pending').map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-[rgb(var(--text))]" />
                        </div>
                        <div>
                          <div className="font-medium text-[rgb(var(--text))]">{friend.name}</div>
                          <div className="text-sm text-[rgb(var(--muted))]">
                            {friend.mutualFriends} mutual friends
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFriendRequest(friend.id, 'accept')}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFriendRequest(friend.id, 'reject')}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">People You May Know</h3>
              <div className="space-y-4">
                {filteredFriends.filter(f => f.status === 'suggested').map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-[rgb(var(--text))]" />
                      </div>
                      <div>
                        <div className="font-medium text-[rgb(var(--text))]">{friend.name}</div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          {friend.mutualFriends} mutual friends • {friend.lastActive}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFriendRequest(friend.id, 'add')}
                      className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Events with Friends</h3>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--text))] mb-2">{event.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                            <span className="text-[rgb(var(--muted))]">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                            <span className="text-[rgb(var(--muted))]">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {event.friendsAttending.length > 0 && (
                      <div className="border-t border-[rgb(var(--border-color))]/20 pt-3">
                        <div className="text-sm text-[rgb(var(--muted))] mb-2">Friends attending:</div>
                        <div className="flex flex-wrap gap-2">
                          {event.friendsAttending.map((friendName) => (
                            <span
                              key={friendName}
                              className="px-2 py-1 bg-[rgb(var(--brand))] text-white rounded-full text-xs"
                            >
                              {friendName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
