'use client';

import EventCalendar from '@/components/map/EventCalendar';

const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    start_at: '2024-07-15T18:00:00Z',
    venue_name: 'Central Park',
    image_url: null,
    is_free: false,
    event_type: 'Music',
    age_restriction: 'All Ages'
  },
  {
    id: '2',
    title: 'Food Truck Rally',
    start_at: '2024-07-20T12:00:00Z',
    venue_name: 'Downtown Plaza',
    image_url: null,
    is_free: true,
    event_type: 'Food',
    age_restriction: 'All Ages'
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    start_at: '2024-07-25T19:00:00Z',
    venue_name: 'Modern Art Museum',
    image_url: null,
    is_free: false,
    event_type: 'Art',
    age_restriction: '18+'
  }
];

export default function CalendarTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar Test Page</h1>
        
        <EventCalendar
          events={sampleEvents}
          onEventClick={(eventId) => {
            console.log('Event clicked:', eventId);
            alert(`Event ${eventId} clicked!`);
          }}
          onDateSelect={(date) => {
            console.log('Date selected:', date);
            alert(`Date selected: ${date.toDateString()}`);
          }}
        />
      </div>
    </div>
  );
}
