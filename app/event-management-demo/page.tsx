'use client';

import React, { useState } from 'react';
import {
  CalendarIcon,
  BellIcon,
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import CalendarIntegration from '@/components/event-management/CalendarIntegration';
import EventReminders from '@/components/event-management/EventReminders';

export default function EventManagementDemo() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');

  const tabs = [
    { id: 'calendar', label: 'Calendar Integration', icon: CalendarIcon, description: 'Add events to personal calendars' },
    { id: 'reminders', label: 'Event Reminders', icon: BellIcon, description: 'Set up customizable notifications' }
  ];

  const mockEvent = {
    id: 'demo-event-123',
    title: 'Summer Music Festival 2024',
    description: 'Join us for an amazing day of live music, food, and fun in the heart of the city! Experience performances from top artists, delicious food from local vendors, and a vibrant atmosphere that will make this summer unforgettable.',
    startDate: '2024-07-15T18:00:00',
    endDate: '2024-07-15T23:00:00',
    location: 'Central Park, New York, NY',
    organizer: 'Event Masters Inc.',
    imageUrl: '/placeholder-event-1.svg'
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
              <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Event Management Demo</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Preview */}
        <div className="mb-8 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-12 h-12 text-[rgb(var(--text))]" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-3">{mockEvent.title}</h2>
              <p className="text-[rgb(var(--muted))] text-lg mb-4">{mockEvent.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                  <span className="text-[rgb(var(--text))]">{formatEventDate(mockEvent.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                  <span className="text-[rgb(var(--text))]">
                    {formatEventTime(mockEvent.startDate)} - {formatEventTime(mockEvent.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                  <span className="text-[rgb(var(--text))]">{mockEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                  <span className="text-[rgb(var(--text))]">{mockEvent.organizer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
          {activeTab === 'calendar' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Calendar Integration</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Add events to your preferred calendar service with customizable options
                </p>
              </div>
              <CalendarIntegration event={mockEvent} />
            </div>
          )}

          {activeTab === 'reminders' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Event Reminders</h2>
                <p className="text-[rgb(var(--muted))] text-lg">
                  Set up customizable notifications to never miss an event
                </p>
              </div>
              <EventReminders event={mockEvent} />
            </div>
          )}
        </div>

        {/* Feature Overview */}
        <div className="mt-16 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-6">Event Management Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[rgb(var(--bg))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--text))]">Calendar Integration</h3>
              </div>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                <li>• Add events to Google Calendar, Apple Calendar, Outlook, and Yahoo</li>
                <li>• Automatic event details population</li>
                <li>• Customizable reminder settings</li>
                <li>• One-click calendar addition</li>
                <li>• Support for .ics file downloads</li>
              </ul>
            </div>
            
            <div className="bg-[rgb(var(--bg))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--text))]">Event Reminders</h3>
              </div>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                <li>• Quick reminder templates (5 min, 15 min, 1 hour, 1 day, 1 week)</li>
                <li>• Custom reminder creation</li>
                <li>• Multiple notification types (in-app, email, SMS, push)</li>
                <li>• Flexible timing options</li>
                <li>• Enable/disable individual reminders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Getting Started</h3>
          <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
            <p>• <strong>Calendar Integration:</strong> Choose your preferred calendar service and add events with one click</p>
            <p>• <strong>Event Reminders:</strong> Use quick templates or create custom reminders with flexible timing</p>
            <p>• <strong>Multiple Services:</strong> Support for Google, Apple, Outlook, and Yahoo calendars</p>
            <p>• <strong>Customization:</strong> Set reminder types, timing, and notification preferences</p>
            <p>• <strong>Easy Management:</strong> Enable/disable reminders and track active notifications</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Calendar Integration</h4>
              <ul className="space-y-1">
                <li>• Google Calendar opens in a new tab for easy addition</li>
                <li>• Apple Calendar downloads an .ics file to import</li>
                <li>• Outlook opens the compose event page</li>
                <li>• Yahoo opens the add event form</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Event Reminders</h4>
              <ul className="space-y-1">
                <li>• Use quick templates for common reminder times</li>
                <li>• Create custom reminders for specific needs</li>
                <li>• Combine multiple reminder types for better coverage</li>
                <li>• Test reminder settings before the event</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
