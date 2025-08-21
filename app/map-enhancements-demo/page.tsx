'use client';

import React, { useState } from 'react';
import EnhancedMap from '@/components/map/EnhancedMap';
import EventDetailsModal from '@/components/map/EventDetailsModal';

// Sample event data for demo with various locations
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    start_at: '2024-07-15T18:00:00Z',
    venue_name: 'Central Park Amphitheater',
    lat: 40.7829,
    lng: -73.9654,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 4500,
    event_type: 'Music',
    age_restriction: 'All Ages'
  },
  {
    id: '2',
    title: 'Tech Startup Networking',
    start_at: '2024-06-20T19:00:00Z',
    venue_name: 'Innovation Hub Downtown',
    lat: 40.7589,
    lng: -73.9851,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Business',
    age_restriction: '18+'
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    start_at: '2024-06-25T17:00:00Z',
    venue_name: 'Modern Art Museum',
    lat: 40.7614,
    lng: -73.9776,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 2500,
    event_type: 'Art',
    age_restriction: 'All Ages'
  },
  {
    id: '4',
    title: 'Food Truck Festival',
    start_at: '2024-07-10T12:00:00Z',
    venue_name: 'Riverside Park',
    lat: 40.7829,
    lng: -73.9654,
    image_url: null,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Food',
    age_restriction: 'All Ages'
  },
  {
    id: '5',
    title: 'Yoga in the Park',
    start_at: '2024-06-30T08:00:00Z',
    venue_name: 'Bryant Park',
    lat: 40.7536,
    lng: -73.9832,
    image_url: null,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Wellness',
    age_restriction: 'All Ages'
  },
  {
    id: '6',
    title: 'Comedy Night',
    start_at: '2024-06-22T20:00:00Z',
    venue_name: 'Laugh Factory',
    lat: 40.7505,
    lng: -73.9934,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 3000,
    event_type: 'Entertainment',
    age_restriction: '21+'
  },
  // Add more events in similar areas to demonstrate clustering
  {
    id: '7',
    title: 'Jazz Concert',
    start_at: '2024-07-05T19:00:00Z',
    venue_name: 'Central Park Bandshell',
    lat: 40.7830,
    lng: -73.9655,
    image_url: null,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Music',
    age_restriction: 'All Ages'
  },
  {
    id: '8',
    title: 'Poetry Reading',
    start_at: '2024-06-28T18:00:00Z',
    venue_name: 'Central Park Literary Corner',
    lat: 40.7828,
    lng: -73.9653,
    image_url: null,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Literature',
    age_restriction: 'All Ages'
  },
  {
    id: '9',
    title: 'Photography Workshop',
    start_at: '2024-07-12T14:00:00Z',
    venue_name: 'Central Park Photography Studio',
    lat: 40.7827,
    lng: -73.9656,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 3500,
    event_type: 'Education',
    age_restriction: '16+'
  },
  {
    id: '10',
    title: 'Fitness Bootcamp',
    start_at: '2024-06-25T07:00:00Z',
    venue_name: 'Bryant Park Fitness Zone',
    lat: 40.7537,
    lng: -73.9833,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 2000,
    event_type: 'Fitness',
    age_restriction: '18+'
  },
  {
    id: '11',
    title: 'Book Club Meeting',
    start_at: '2024-06-29T15:00:00Z',
    venue_name: 'Bryant Park Reading Room',
    lat: 40.7535,
    lng: -73.9831,
    image_url: null,
    status: 'approved',
    is_free: true,
    price_cents: null,
    event_type: 'Literature',
    age_restriction: 'All Ages'
  },
  {
    id: '12',
    title: 'Craft Beer Tasting',
    start_at: '2024-07-08T17:00:00Z',
    venue_name: 'Downtown Brewery',
    lat: 40.7590,
    lng: -73.9852,
    image_url: null,
    status: 'approved',
    is_free: false,
    price_cents: 4000,
    event_type: 'Food & Drink',
    age_restriction: '21+'
  }
];

export default function MapEnhancementsDemoPage() {
  const [selectedEvent, setSelectedEvent] = useState<typeof sampleEvents[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (eventId: string) => {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Map Enhancements Demo
          </h1>
          <p className="text-[rgb(var(--muted))]">
            Showcasing cluster markers, event preview cards, and route planning features
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Feature Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Map Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Cluster Markers</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Nearby events are automatically grouped into clusters. Click clusters to zoom in and see individual events.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">👁️</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Event Preview Cards</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Hover over markers to see quick event information. Click to view full details.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">🗺️</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Route Planning</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Get directions to events with multiple transportation modes and detailed route information.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Interactive Map
          </h2>
          <div className="relative">
            <EnhancedMap
              events={sampleEvents}
              onEventClick={handleEventClick}
              className="w-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[rgb(var(--panel))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">
            How to Use
          </h3>
          <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">1.</span>
              <span>Zoom in/out to see how events cluster together. At high zoom levels, you'll see individual events.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">2.</span>
              <span>Click on cluster markers to zoom to that area or expand the cluster view.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">3.</span>
              <span>Hover over markers to see event previews with basic information.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">4.</span>
              <span>Click on individual events to view full details and access route planning.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">5.</span>
              <span>Use the route planner to get directions with multiple transportation options.</span>
            </div>
          </div>
        </div>

        {/* Sample Data Info */}
        <div className="mt-8 bg-[rgb(var(--panel))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">
            Sample Data
          </h3>
          <p className="text-sm text-[rgb(var(--muted))] mb-3">
            This demo uses {sampleEvents.length} sample events located in New York City to demonstrate clustering behavior:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-2">Central Park Area</h4>
              <ul className="space-y-1 text-[rgb(var(--muted))]">
                <li>• Summer Music Festival</li>
                <li>• Jazz Concert</li>
                <li>• Poetry Reading</li>
                <li>• Photography Workshop</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-2">Bryant Park Area</h4>
              <ul className="space-y-1 text-[rgb(var(--muted))]">
                <li>• Yoga in the Park</li>
                <li>• Fitness Bootcamp</li>
                <li>• Book Club Meeting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
