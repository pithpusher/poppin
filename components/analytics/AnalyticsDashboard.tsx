'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ArrowTrendingUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { analytics } from '@/lib/analytics';
import { abTesting } from '@/lib/abTesting';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
  className?: string;
  showRealTime?: boolean;
  refreshInterval?: number;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalInteractions: number;
  averageSessionDuration: number;
  conversionRate: number;
  topEvents: Array<{
    id: string;
    title: string;
    views: number;
    interactions: number;
  }>;
  topSearches: Array<{
    query: string;
    count: number;
    results: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  locationBreakdown: Array<{
    city: string;
    users: number;
    events: number;
  }>;
}

export default function AnalyticsDashboard({
  className = "",
  showRealTime = true,
  refreshInterval = 30000
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalInteractions: 0,
    averageSessionDuration: 0,
    conversionRate: 0,
    topEvents: [],
    topSearches: [],
    deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
    locationBreakdown: []
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'ab-tests'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [abTestResults, setAbTestResults] = useState<any[]>([]);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - in production these would be real API endpoints
      const mockData: DashboardMetrics = {
        totalUsers: 1247,
        activeUsers: 89,
        totalEvents: 156,
        totalInteractions: 3421,
        averageSessionDuration: 4.2,
        conversionRate: 12.5,
        topEvents: [
          { id: '1', title: 'Summer Music Festival', views: 234, interactions: 67 },
          { id: '2', title: 'Food Truck Rally', views: 189, interactions: 43 },
          { id: '3', title: 'Art Gallery Opening', views: 156, interactions: 38 },
          { id: '4', title: 'Tech Meetup', views: 134, interactions: 29 },
          { id: '5', title: 'Yoga in the Park', views: 98, interactions: 22 }
        ],
        topSearches: [
          { query: 'music', count: 45, results: 23 },
          { query: 'food', count: 38, results: 31 },
          { query: 'art', count: 29, results: 18 },
          { query: 'sports', count: 24, results: 15 },
          { query: 'technology', count: 21, results: 12 }
        ],
        deviceBreakdown: { mobile: 67, tablet: 18, desktop: 15 },
        locationBreakdown: [
          { city: 'New York', users: 234, events: 45 },
          { city: 'Los Angeles', users: 189, events: 38 },
          { city: 'Chicago', users: 156, events: 32 },
          { city: 'Miami', users: 134, events: 28 },
          { city: 'Seattle', users: 98, events: 21 }
        ]
      };

      setMetrics(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load A/B test results
  const loadABTestResults = useCallback(async () => {
    try {
      const activeTests = abTesting.getActiveTests();
      const results = activeTests.map(test => ({
        test,
        metrics: abTesting.getTestMetrics(test.id),
        statistics: abTesting.getTestStatistics(test.id)
      }));
      setAbTestResults(results);
    } catch (error) {
      console.error('Failed to load A/B test results:', error);
    }
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  // Format duration in minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes.toFixed(0)}m`;
  };

  // Get metric change indicator
  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return { type: 'increase', value: change, color: 'text-green-600' };
    } else if (change < 0) {
      return { type: 'decrease', value: Math.abs(change), color: 'text-red-600' };
    }
    return { type: 'no-change', value: 0, color: 'text-gray-600' };
  };

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadAnalyticsData();
    loadABTestResults();

    if (showRealTime && refreshInterval > 0) {
      const interval = setInterval(() => {
        loadAnalyticsData();
        loadABTestResults();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [loadAnalyticsData, loadABTestResults, showRealTime, refreshInterval]);

  // Refresh data manually
  const handleRefresh = () => {
    loadAnalyticsData();
    loadABTestResults();
  };

  if (isLoading) {
    return (
      <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--muted))] rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
              <ChartBarIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
              Analytics Dashboard
            </h2>
            <p className="text-[rgb(var(--muted))] mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {showRealTime && (
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon },
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'ab-tests', label: 'A/B Tests', icon: ArrowTrendingUpIcon }
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Total Users</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {formatNumber(metrics.totalUsers)}
                    </p>
                  </div>
                  <UsersIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Active Users</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {formatNumber(metrics.activeUsers)}
                    </p>
                  </div>
                  <EyeIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Total Events</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {formatNumber(metrics.totalEvents)}
                    </p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Interactions</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {formatNumber(metrics.totalInteractions)}
                    </p>
                  </div>
                  <CursorArrowRaysIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Avg. Session Duration</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {formatDuration(metrics.averageSessionDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Conversion Rate</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {formatPercentage(metrics.conversionRate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.deviceBreakdown).map(([device, percentage]) => (
                    <div key={device} className="flex justify-between items-center">
                      <span className="text-sm text-[rgb(var(--muted))] capitalize">{device}</span>
                      <span className="font-medium text-[rgb(var(--text))]">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Events */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Top Events</h3>
              <div className="space-y-3">
                {metrics.topEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[rgb(var(--muted))] w-6">#{index + 1}</span>
                      <span className="text-sm text-[rgb(var(--text))] truncate">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[rgb(var(--muted))]">{event.views} views</span>
                      <span className="text-[rgb(var(--brand))]">{event.interactions} interactions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Event Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Event Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Total Events</span>
                    <span className="font-medium text-[rgb(var(--text))]">{metrics.totalEvents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Active Events</span>
                    <span className="font-medium text-[rgb(var(--text))]">{metrics.topEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Avg. Views per Event</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {Math.round(metrics.topEvents.reduce((sum, e) => sum + e.views, 0) / metrics.topEvents.length)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Top Searches</h3>
                <div className="space-y-3">
                  {metrics.topSearches.map((search, index) => (
                    <div key={search.query} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[rgb(var(--muted))] w-6">#{index + 1}</span>
                        <span className="text-sm text-[rgb(var(--text))]">{search.query}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[rgb(var(--muted))]">{search.count} searches</span>
                        <span className="text-[rgb(var(--brand))]">{search.results} results</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event List */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Event Analytics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border-color))]/20">
                      <th className="text-left py-2 text-sm font-medium text-[rgb(var(--muted))]">Event</th>
                      <th className="text-left py-2 text-sm font-medium text-[rgb(var(--muted))]">Views</th>
                      <th className="text-left py-2 text-sm font-medium text-[rgb(var(--muted))]">Interactions</th>
                      <th className="text-left py-2 text-sm font-medium text-[rgb(var(--muted))]">Engagement Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topEvents.map((event) => (
                      <tr key={event.id} className="border-b border-[rgb(var(--border-color))]/10">
                        <td className="py-2 text-sm text-[rgb(var(--text))]">{event.title}</td>
                        <td className="py-2 text-sm text-[rgb(var(--text))]">{event.views}</td>
                        <td className="py-2 text-sm text-[rgb(var(--text))]">{event.interactions}</td>
                        <td className="py-2 text-sm text-[rgb(var(--brand))]">
                          {((event.interactions / event.views) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">User Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Total Users</span>
                    <span className="font-medium text-[rgb(var(--text))]">{formatNumber(metrics.totalUsers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Active Users</span>
                    <span className="font-medium text-[rgb(var(--text))]">{formatNumber(metrics.activeUsers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Avg. Session Duration</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {formatDuration(metrics.averageSessionDuration)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Device Usage</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.deviceBreakdown).map(([device, percentage]) => (
                    <div key={device} className="flex justify-between items-center">
                      <span className="text-sm text-[rgb(var(--muted))] capitalize">{device}</span>
                      <span className="font-medium text-[rgb(var(--text))]">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Breakdown */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Top Locations</h3>
              <div className="space-y-3">
                {metrics.locationBreakdown.map((location, index) => (
                  <div key={location.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[rgb(var(--muted))] w-6">#{index + 1}</span>
                      <span className="text-sm text-[rgb(var(--text))] flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        {location.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[rgb(var(--muted))]">{location.users} users</span>
                      <span className="text-[rgb(var(--brand))]">{location.events} events</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ab-tests' && (
          <div className="space-y-6">
            {/* A/B Test Overview */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Active A/B Tests</h3>
              <div className="space-y-4">
                {abTestResults.map((testData) => (
                  <div key={testData.test.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-[rgb(var(--text))]">{testData.test.name}</h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted))] mb-3">{testData.test.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {testData.metrics.map((metric) => (
                        <div key={metric.variantId} className="text-center">
                          <div className="text-lg font-bold text-[rgb(var(--text))]">
                            {metric.variantId}
                          </div>
                          <div className="text-sm text-[rgb(var(--muted))]">
                            {metric.impressions} impressions
                          </div>
                          <div className="text-sm text-[rgb(var(--brand))]">
                            {metric.conversionRate.toFixed(1)}% conversion
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Statistics */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Test Statistics</h3>
              <div className="space-y-4">
                {abTestResults.map((testData) => (
                  <div key={testData.test.id} className="border border-[rgb(var(--border-color))]/20 rounded-lg p-4">
                    <h4 className="font-medium text-[rgb(var(--text))] mb-3">{testData.test.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[rgb(var(--muted))]">Total Users:</span>
                        <div className="font-medium text-[rgb(var(--text))]">
                          {testData.statistics.totalUsers}
                        </div>
                      </div>
                      <div>
                        <span className="text-[rgb(var(--muted))]">Duration:</span>
                        <div className="font-medium text-[rgb(var(--text))]">
                          {Math.round(testData.statistics.duration / (1000 * 60 * 60 * 24))} days
                        </div>
                      </div>
                      <div>
                        <span className="text-[rgb(var(--muted))]">Start Date:</span>
                        <div className="font-medium text-[rgb(var(--text))]">
                          {new Date(testData.statistics.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-[rgb(var(--muted))]">Status:</span>
                        <div className="font-medium text-green-600">Running</div>
                      </div>
                    </div>
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
