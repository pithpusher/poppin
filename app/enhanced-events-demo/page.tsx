'use client';

import React, { useState } from 'react';
import EventListView from '@/components/map/EventListView';
import EventDetailsModal from '@/components/map/EventDetailsModal';

// Sample event data for demo
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
    image_url: null,
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
  }
];

export default function EnhancedEventsDemoPage() {
  const [selectedEvent, setSelectedEvent] = useState<typeof sampleEvents[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (eventId: string) => {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleDirectionsClick = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
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
            Enhanced Event Cards Demo
          </h1>
          <p className="text-[rgb(var(--muted))]">
            Showcasing the new enhanced event cards with quick actions, hover effects, image galleries, and interactive elements
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EventListView
          events={sampleEvents}
          onEventClick={handleEventClick}
          onDirectionsClick={handleDirectionsClick}
        />
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDirectionsClick={handleDirectionsClick}
      />
    </div>
  );
}
