'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon,
  ShareIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface OrganizerProfileProps {
  organizerId: string;
  className?: string;
}

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  maxAttendees: number;
  rating?: number;
  totalReviews: number;
  category: string;
  price: number;
}

interface OrganizerInfo {
  name: string;
  description: string;
  location: string;
  website?: string;
  email?: string;
  phone?: string;
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  categories: string[];
  memberSince: string;
}

export default function OrganizerProfile({ organizerId, className = "" }: OrganizerProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'reviews' | 'contact'>('overview');
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([]);
  const [organizerInfo, setOrganizerInfo] = useState<OrganizerInfo>({
    name: '',
    description: '',
    location: '',
    totalEvents: 0,
    totalAttendees: 0,
    averageRating: 0,
    categories: [],
    memberSince: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock organizer data - in production this would come from an API
  useEffect(() => {
    const mockEvents: OrganizerEvent[] = [
      {
        id: '1',
        title: 'Summer Music Festival 2024',
        date: '2024-07-15',
        location: 'Central Park, NY',
        status: 'upcoming',
        attendees: 450,
        maxAttendees: 500,
        rating: 4.8,
        totalReviews: 127,
        category: 'Music',
        price: 25
      },
      {
        id: '2',
        title: 'Food & Wine Expo',
        date: '2024-06-20',
        location: 'Convention Center',
        status: 'completed',
        attendees: 800,
        maxAttendees: 800,
        rating: 4.6,
        totalReviews: 89,
        category: 'Food & Drink',
        price: 45
      },
      {
        id: '3',
        title: 'Tech Innovation Summit',
        date: '2024-09-10',
        location: 'Tech Hub Downtown',
        status: 'upcoming',
        attendees: 120,
        maxAttendees: 200,
        category: 'Technology',
        price: 75
      },
      {
        id: '4',
        title: 'Art & Culture Night',
        date: '2024-05-15',
        location: 'Modern Art Museum',
        status: 'completed',
        attendees: 300,
        maxAttendees: 300,
        rating: 4.9,
        totalReviews: 156,
        category: 'Art & Culture',
        price: 15
      }
    ];

    const mockInfo: OrganizerInfo = {
      name: 'Event Masters Inc.',
      description: 'We specialize in creating unforgettable experiences through innovative event planning and execution. From intimate gatherings to large-scale festivals, we bring your vision to life.',
      location: 'New York, NY',
      website: 'https://eventmasters.com',
      email: 'hello@eventmasters.com',
      phone: '+1 (555) 123-4567',
      totalEvents: mockEvents.length,
      totalAttendees: mockEvents.reduce((sum, e) => sum + e.attendees, 0),
      averageRating: mockEvents.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / mockEvents.filter(e => e.rating).length,
      categories: ['Music', 'Food & Drink', 'Technology', 'Art & Culture'],
      memberSince: '2020'
    };

    setOrganizerEvents(mockEvents);
    setOrganizerInfo(mockInfo);
    setIsLoading(false);
  }, [organizerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <CalendarIcon className="w-4 h-4" />;
      case 'ongoing': return <CalendarIcon className="w-4 h-4" />;
      case 'completed': return <CalendarIcon className="w-4 h-4" />;
      case 'cancelled': return <CalendarIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
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
      {/* Organizer Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">{organizerInfo.name}</h2>
              <p className="text-[rgb(var(--muted))] mb-3 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                {organizerInfo.location}
              </p>
              <p className="text-[rgb(var(--text))] mb-3">{organizerInfo.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[rgb(var(--muted))]">Member since {organizerInfo.memberSince}</span>
                {organizerInfo.website && (
                  <a 
                    href={organizerInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[rgb(var(--brand))] hover:underline flex items-center gap-1"
                  >
                    <GlobeAltIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">
              {organizerInfo.totalEvents}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {organizerInfo.totalAttendees.toLocaleString()}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Total Attendees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {organizerInfo.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {organizerInfo.categories.length}
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">Categories</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
          {[
            { id: 'overview', label: 'Overview', icon: UserGroupIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon },
            { id: 'reviews', label: 'Reviews', icon: StarIcon },
            { id: 'contact', label: 'Contact', icon: EnvelopeIcon }
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
            {/* Categories */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Event Categories</h3>
              <div className="flex flex-wrap gap-2">
                {organizerInfo.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-[rgb(var(--brand))] text-white rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Recent Events</h3>
              <div className="space-y-3">
                {organizerEvents.slice(0, 3).map((event) => (
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
                    <div className="flex items-center gap-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(event.status))}>
                        {event.status}
                      </span>
                      <span className="text-sm text-[rgb(var(--muted))]">
                        {event.attendees}/{event.maxAttendees}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">All Events</h3>
              <div className="space-y-4">
                {organizerEvents.map((event) => (
                  <div key={event.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--text))] mb-2">{event.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
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
                          <div className="flex items-center gap-2">
                            <span className="text-[rgb(var(--muted))]">Price:</span>
                            <span className="font-medium text-[rgb(var(--text))]">{formatPrice(event.price)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[rgb(var(--muted))]">
                              {event.attendees}/{event.maxAttendees} attendees
                            </span>
                            <span className="text-[rgb(var(--muted))]">
                              {event.category}
                            </span>
                          </div>
                          {event.rating && (
                            <div className="flex items-center gap-2">
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
                                {event.rating} ({event.totalReviews} reviews)
                              </span>
                            </div>
                          )}
                        </div>
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
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Event Reviews</h3>
              <div className="text-center py-8 text-[rgb(var(--muted))]">
                <StarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Reviews integration coming soon!</p>
                <p className="text-sm">View detailed reviews and ratings for all events.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Contact Information</h3>
              <div className="space-y-4">
                {organizerInfo.email && (
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                    <div>
                      <div className="text-sm text-[rgb(var(--muted))]">Email</div>
                      <a 
                        href={`mailto:${organizerInfo.email}`}
                        className="text-[rgb(var(--text))] hover:text-[rgb(var(--brand))] transition-colors"
                      >
                        {organizerInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                {organizerInfo.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                    <div>
                      <div className="text-sm text-[rgb(var(--muted))]">Phone</div>
                      <a 
                        href={`tel:${organizerInfo.phone}`}
                        className="text-[rgb(var(--text))] hover:text-[rgb(var(--brand))] transition-colors"
                      >
                        {organizerInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                  <div>
                    <div className="text-sm text-[rgb(var(--muted))]">Location</div>
                    <div className="text-[rgb(var(--text))]">{organizerInfo.location}</div>
                  </div>
                </div>
                {organizerInfo.website && (
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                    <div>
                      <div className="text-sm text-[rgb(var(--muted))]">Website</div>
                      <a 
                        href={organizerInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgb(var(--brand))] hover:underline"
                      >
                        {organizerInfo.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
