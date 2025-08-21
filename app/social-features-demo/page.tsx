'use client';

import React, { useState } from 'react';
import {
  UserIcon,
  UserGroupIcon,
  ShareIcon,
  StarIcon,
  HeartIcon,
  ArrowLeftIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import UserProfile from '@/components/social/UserProfile';
import OrganizerProfile from '@/components/social/OrganizerProfile';
import EventSharing from '@/components/social/EventSharing';
import EventReviews from '@/components/social/EventReviews';
import FriendIntegration from '@/components/social/FriendIntegration';
import FollowOrganizer from '@/components/social/FollowOrganizer';
import FollowingList from '@/components/social/FollowingList';

export default function SocialFeaturesDemo() {
  const [activeTab, setActiveTab] = useState<'user-profile' | 'organizer-profile' | 'event-sharing' | 'reviews' | 'friends' | 'follow' | 'following'>('user-profile');

  const tabs = [
    { id: 'user-profile', label: 'User Profile', icon: UserIcon, description: 'Personal event history and profile' },
    { id: 'organizer-profile', label: 'Organizer Profile', icon: UserGroupIcon, description: 'View all events by an organizer' },
    { id: 'event-sharing', label: 'Event Sharing', icon: ShareIcon, description: 'Share events on social media' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: StarIcon, description: 'Rate events after attending' },
    { id: 'friends', label: 'Friend Integration', icon: HeartIcon, description: 'See what friends are attending' },
    { id: 'follow', label: 'Follow Organizer', icon: UserPlusIcon, description: 'Follow organizers for notifications' },
    { id: 'following', label: 'Following List', icon: UserGroupIcon, description: 'Manage your followed organizers' }
  ];

  const mockEvent = {
    id: 'demo-event-1',
    title: 'Summer Music Festival 2024',
    url: 'https://poppin.com/events/summer-music-festival-2024',
    description: 'Join us for an amazing day of live music, food, and fun in the heart of the city!'
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-[rgb(var(--border-color))]/20" />
              <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Social Features Demo</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 border-b border-[rgb(var(--border-color))]/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id
                    ? "text-[rgb(var(--brand))] border-b-2 border-[rgb(var(--brand))] bg-[rgb(var(--panel))]"
                    : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]/50"
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'user-profile' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">User Profile</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Personal event history, reviews, and profile information
                </p>
              </div>
              <UserProfile userId="demo-user-123" />
            </div>
          )}

          {activeTab === 'organizer-profile' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Organizer Profile</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  View all events by a specific organizer with detailed information
                </p>
              </div>
              <OrganizerProfile organizerId="demo-organizer-456" />
            </div>
          )}

          {activeTab === 'event-sharing' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Event Sharing</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Share events on social media platforms and messaging apps
                </p>
              </div>
              
              <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">Demo Event</h3>
                  <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                    <h4 className="font-medium text-[rgb(var(--text))] mb-2">{mockEvent.title}</h4>
                    <p className="text-[rgb(var(--muted))] text-sm mb-3">{mockEvent.description}</p>
                    <div className="text-xs text-[rgb(var(--muted))]">{mockEvent.url}</div>
                  </div>
                </div>
                
                <EventSharing
                  eventId={mockEvent.id}
                  eventTitle={mockEvent.title}
                  eventUrl={mockEvent.url}
                  eventDescription={mockEvent.description}
                />
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Reviews & Ratings</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Rate events after attending and read reviews from other users
                </p>
              </div>
              <EventReviews
                eventId="demo-event-1"
                eventTitle="Summer Music Festival 2024"
              />
            </div>
          )}

          {activeTab === 'friends' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Friend Integration</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Connect with friends and see what events they're attending
                </p>
              </div>
              <FriendIntegration />
            </div>
          )}

          {activeTab === 'follow' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Follow Organizer</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Follow organizers to get notified when they post new events
                </p>
              </div>
              <FollowOrganizer
                organizerId="demo-organizer-789"
                organizerName="Event Masters Inc."
                organizerAvatar="/placeholder-event-1.svg"
              />
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Following List</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Manage your followed organizers and notification preferences
                </p>
              </div>
              <FollowingList />
            </div>
          )}
        </div>

        {/* Feature Overview */}
        <div className="mt-16 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-6">Social Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabs.map((tab) => (
              <div key={tab.id} className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center">
                    <tab.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[rgb(var(--text))]">{tab.label}</h3>
                </div>
                <p className="text-sm text-[rgb(var(--muted))]">{tab.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Getting Started</h3>
          <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
            <p>• <strong>User Profile:</strong> View your personal event history, reviews, and profile information</p>
            <p>• <strong>Organizer Profile:</strong> Explore all events by a specific organizer</p>
            <p>• <strong>Event Sharing:</strong> Share events on social media platforms and messaging apps</p>
            <p>• <strong>Reviews & Ratings:</strong> Rate events after attending and read community reviews</p>
            <p>• <strong>Friend Integration:</strong> Connect with friends and see their event activities</p>
            <p>• <strong>Follow Organizer:</strong> Follow organizers to get notified of new events</p>
            <p>• <strong>Following List:</strong> Manage your followed organizers and notification preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}
