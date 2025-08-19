'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

type Event = {
  id: string;
  title: string;
  start_at: string;
  organizer_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  image_url: string | null;
};

type OrganizerApplication = {
  id: string;
  name: string;
  organization: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type Report = {
  id: string;
  type: 'event' | 'user' | 'organizer';
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
  reporter_email: string;
};

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'organizers' | 'reports'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerApplication[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load pending events
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, start_at, status, created_at, image_url, organizers(name)')
        .in('status', ['pending', 'approved', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsData) {
        const eventsWithOrganizer = eventsData.map(event => ({
          ...event,
          organizer_name: event.organizers?.name || 'Unknown'
        }));
        setEvents(eventsWithOrganizer);
      }

      // Load organizer applications
      const { data: organizersData } = await supabase
        .from('organizers')
        .select('id, name, organization, email, status, created_at')
        .in('status', ['pending', 'approved', 'rejected'])
        .order('created_at', { ascending: false })
      .limit(50);

      if (organizersData) {
        setOrganizers(organizersData);
      }

      // Load reports (mock data for now)
      setReports([
        {
          id: '1',
          type: 'event',
          reason: 'Inappropriate content',
          status: 'open',
          created_at: new Date().toISOString(),
          reporter_email: 'user@example.com'
        },
        {
          id: '2',
          type: 'user',
          reason: 'Spam behavior',
          status: 'resolved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reporter_email: 'mod@example.com'
        }
      ]);

    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateEventStatus(eventId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status } : event
      ));
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  }

  async function updateOrganizerStatus(organizerId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('organizers')
        .update({ status })
        .eq('id', organizerId);

      if (error) throw error;

      // Update local state
      setOrganizers(prev => prev.map(org => 
        org.id === organizerId ? { ...org, status } : org
      ));
    } catch (error) {
      console.error('Error updating organizer status:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'open': return 'bg-blue-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'dismissed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--muted))]">Loading moderation data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--brand))] rounded-2xl mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Moderation Dashboard</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted} max-w-3xl mx-auto`}>
            Manage events, organizer applications, and user reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-lg font-bold text-[rgb(var(--text))]">
              {events.filter(e => e.status === 'pending').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">Pending Events</div>
          </div>

          <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-[rgb(var(--text))]">
              {organizers.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">Pending Organizers</div>
          </div>

          <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FlagIcon className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-lg font-bold text-[rgb(var(--text))]">
              {reports.filter(r => r.status === 'open').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">Open Reports</div>
          </div>

          <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckIcon className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-lg font-bold text-[rgb(var(--text))]">
              {events.filter(e => e.status === 'approved').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">Approved Events</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[rgb(var(--border-color))]/20 mb-8">
          {[
            { id: 'events', label: 'Events', icon: CalendarIcon, count: events.filter(e => e.status === 'pending').length },
            { id: 'organizers', label: 'Organizers', icon: UserIcon, count: organizers.filter(o => o.status === 'pending').length },
            { id: 'reports', label: 'Reports', icon: ExclamationTriangleIcon, count: reports.filter(r => r.status === 'open').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-[rgb(var(--brand))] text-[rgb(var(--brand))]'
                  : 'border-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-1 bg-[rgb(var(--brand))] text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))]">Event Moderation</h2>
                <div className="text-xs text-[rgb(var(--muted))]">
                  {events.length} total events
                </div>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12 bg-[rgb(var(--panel))] token-border rounded-xl">
                  <CalendarIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                    No events to moderate
                  </h3>
                  <p className={`text-base sm:text-lg ${tokens.muted}`}>
                    All events have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-[rgb(var(--bg))] rounded-lg overflow-hidden flex-shrink-0">
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                              <CalendarIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-1">
                                {event.title}
                              </h3>
                              <p className={`text-xs ${tokens.muted}`}>
                                by {event.organizer_name} • {formatDate(event.start_at)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/e/${event.id}`}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors text-xs font-medium"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View Event
                            </Link>
                            
                            {event.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateEventStatus(event.id, 'approved')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs font-medium"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateEventStatus(event.id, 'rejected')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-xs font-medium"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Organizers Tab */}
          {activeTab === 'organizers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))]">Organizer Applications</h2>
                <div className="text-xs text-[rgb(var(--muted))]">
                  {organizers.length} total applications
                </div>
              </div>

              {organizers.length === 0 ? (
                <div className="text-center py-12 bg-[rgb(var(--panel))] token-border rounded-xl">
                  <UserIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                    No applications to review
                  </h3>
                  <p className={`text-base sm:text-lg ${tokens.muted}`}>
                    All organizer applications have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizers.map((organizer) => (
                    <div key={organizer.id} className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-1">
                            {organizer.name}
                          </h3>
                          <p className={`text-xs ${tokens.muted} mb-1`}>
                            {organizer.organization}
                          </p>
                          <p className={`text-xs ${tokens.muted}`}>
                            {organizer.email} • {formatDate(organizer.created_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(organizer.status)}`}>
                          {organizer.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/o/${organizer.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors text-xs font-medium"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Application
                        </Link>
                        
                        {organizer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrganizerStatus(organizer.id, 'approved')}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs font-medium"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateOrganizerStatus(organizer.id, 'rejected')}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-xs font-medium"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))]">User Reports</h2>
                <div className="text-xs text-[rgb(var(--muted))]">
                  {reports.length} total reports
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12 bg-[rgb(var(--panel))] token-border rounded-xl">
                  <ExclamationTriangleIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                    No reports to review
                  </h3>
                  <p className={`text-base sm:text-lg ${tokens.muted}`}>
                    All user reports have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">
                              {report.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-1">
                            {report.reason}
                          </h3>
                          <p className={`text-xs ${tokens.muted}`}>
                            Reported by {report.reporter_email} • {formatDate(report.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors text-xs font-medium">
                          <EyeIcon className="w-4 h-4" />
                          Investigate
                        </button>
                        
                        {report.status === 'open' && (
                          <>
                            <button className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs font-medium">
                              <CheckIcon className="w-4 h-4" />
                              Resolve
                            </button>
                            <button className="inline-flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-xs font-medium">
                              <XMarkIcon className="w-4 h-4" />
                              Dismiss
                            </button>
                          </>
                        )}
            </div>
          </div>
        ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Need Help with Moderation?
            </h3>
            <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>
              Review our moderation guidelines and best practices
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/moderation/guidelines"
                className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
              >
                View Guidelines
              </Link>
              <Link
                href="/moderation/settings"
                className="px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
              >
                Moderation Settings
              </Link>
            </div>
          </div>
      </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
