'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, CalendarIcon, MapPinIcon, CogIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
};

type UserEvent = {
  id: string;
  title: string;
  start_at: string;
  status: string;
  image_url: string | null;
  venue_name: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'settings'>('profile');

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        // Redirect to auth if not logged in
        window.location.href = '/auth';
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        
        // Load user's events
        const { data: events } = await supabase
          .from('events')
          .select('id, title, start_at, status, image_url, venue_name')
          .eq('organizer_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setUserEvents(events || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--muted))]">Loading account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
            Please sign in to access your account
          </h1>
          <Link
            href="/auth"
            className="inline-flex items-center px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-[rgb(var(--muted))]">Your events, your settings, your crew.</p>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[rgb(var(--text))]">
                {user.name || 'Anonymous User'}
              </h2>
              <p className="text-[rgb(var(--muted))]">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-[rgb(var(--brand))] text-white text-xs rounded-full">
                  {user.role}
                </span>
                <span className="text-xs text-[rgb(var(--muted))]">
                  Member since {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[rgb(var(--border-color))]/20 mb-8">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'events', label: 'My Events', icon: CalendarIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[rgb(var(--brand))] text-[rgb(var(--brand))]'
                  : 'border-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                  Personal Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--muted))] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name || ''}
                      className="w-full px-3 py-2 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--muted))] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--muted))] token-border cursor-not-allowed"
                    />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors">
                  Update Profile
                </button>
              </div>

              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                  Account Statistics
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                    <div className="text-2xl font-bold text-[rgb(var(--brand))]">
                      {userEvents.length}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Events Created</div>
                  </div>
                  <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                    <div className="text-2xl font-bold text-[rgb(var(--brand))]">
                      {userEvents.filter(e => e.status === 'approved').length}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Approved Events</div>
                  </div>
                  <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                    <div className="text-2xl font-bold text-[rgb(var(--brand))]">
                      {userEvents.filter(e => e.status === 'pending').length}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Pending Review</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))]">
                  My Events
                </h3>
                <Link
                  href="/events/new"
                  className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                >
                  Create New Event
                </Link>
              </div>

              {userEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-10 h-10 mx-auto text-[rgb(var(--muted))] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No events yet.</h3>
                  <p className="text-[rgb(var(--muted))] mb-6">Post your first one and start building your reach.</p>
                  <Link
                    href="/events/new"
                    className="inline-flex items-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
                  >
                    Create an Event
                  </Link>
                </div>
              )}
              {userEvents.length > 0 && (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event.id} className="bg-[rgb(var(--panel))] token-border rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[rgb(var(--bg))] rounded-lg overflow-hidden">
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
                          <h4 className="font-semibold text-[rgb(var(--text))] mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
                            <span>{formatDate(event.start_at)}</span>
                            {event.venue_name && (
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                {event.venue_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          <Link
                            href={`/e/${event.id}`}
                            className="px-3 py-1 text-sm text-[rgb(var(--brand))] hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                  Account Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--bg))] rounded-lg">
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="font-medium text-[rgb(var(--text))]">Email Notifications</div>
                        <div className="text-sm text-[rgb(var(--muted))]">Get notified about event updates</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[rgb(var(--muted))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--brand))]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--bg))] rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="font-medium text-[rgb(var(--text))]">Two-Factor Authentication</div>
                        <div className="text-sm text-[rgb(var(--muted))]">Add an extra layer of security</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm text-[rgb(var(--brand))] hover:underline">
                      Enable
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-600/80 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="text-center mt-12">
          <button
            onClick={signOut}
            className="px-6 py-3 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
