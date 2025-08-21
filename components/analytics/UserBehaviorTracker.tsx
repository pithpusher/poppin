'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserIcon, 
  ClockIcon, 
  MapPinIcon, 
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface UserBehaviorTrackerProps {
  className?: string;
  userId?: string;
  sessionId?: string;
  showRealTime?: boolean;
  refreshInterval?: number;
}

interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  duration: number;
  pageViews: string[];
  events: number;
  interactions: number;
  device: string;
  location?: string;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'input' | 'navigation' | 'search';
  element: string;
  page: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface SearchPattern {
  query: string;
  count: number;
  results: number;
  filters: Record<string, any>;
  timestamp: number;
}

interface EngagementMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  searchQueries: number;
  eventViews: number;
  eventInteractions: number;
}

export default function UserBehaviorTracker({
  className = "",
  userId,
  sessionId,
  showRealTime = true,
  refreshInterval = 10000
}: UserBehaviorTrackerProps) {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [recentInteractions, setRecentInteractions] = useState<UserInteraction[]>([]);
  const [searchPatterns, setSearchPatterns] = useState<SearchPattern[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    searchQueries: 0,
    eventViews: 0,
    eventInteractions: 0
  });
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'search' | 'engagement'>('overview');
  
  const sessionStartTime = useRef<number>(Date.now());
  const pageViewCount = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const searchCount = useRef<number>(0);

  // Initialize tracking
  const initializeTracking = useCallback(() => {
    if (isTracking) return;

    sessionStartTime.current = Date.now();
    pageViewCount.current = 0;
    interactionCount.current = 0;
    searchCount.current = 0;

    // Track page view
    analytics.trackPageView(window.location.pathname);
    pageViewCount.current++;

    // Set up event listeners
    setupEventListeners();
    
    setIsTracking(true);
  }, [isTracking]);

  // Set up event listeners for user interactions
  const setupEventListeners = useCallback(() => {
    // Click tracking
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        const element = getElementIdentifier(target);
        const interaction: UserInteraction = {
          type: 'click',
          element,
          page: window.location.pathname,
          timestamp: Date.now(),
          properties: {
            tagName: target.tagName,
            className: target.className,
            textContent: target.textContent?.substring(0, 100),
            x: e.clientX,
            y: e.clientY
          }
        };

        analytics.trackInteraction('click', element, interaction.properties);
        setRecentInteractions(prev => [interaction, ...prev.slice(0, 9)]);
        interactionCount.current++;
      }
    };

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        const interaction: UserInteraction = {
          type: 'scroll',
          element: 'page',
          page: window.location.pathname,
          timestamp: Date.now(),
          properties: { scrollDepth }
        };

        analytics.trackInteraction('scroll', 'page', interaction.properties);
        setRecentInteractions(prev => [interaction, ...prev.slice(0, 9)]);
        interactionCount.current++;
      }, 100);
    };

    // Input tracking
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && (target.type === 'text' || target.type === 'search')) {
        const interaction: UserInteraction = {
          type: 'input',
          element: getElementIdentifier(target),
          page: window.location.pathname,
          timestamp: Date.now(),
          properties: {
            fieldType: target.type,
            fieldName: target.name || target.id,
            valueLength: target.value.length
          }
        };

        analytics.trackInteraction('input', interaction.element, interaction.properties);
        setRecentInteractions(prev => [interaction, ...prev.slice(0, 9)]);
        interactionCount.current++;
      }
    };

    // Navigation tracking
    const handleNavigation = () => {
      analytics.trackPageView(window.location.pathname);
      pageViewCount.current++;
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('input', handleInput);
    window.addEventListener('popstate', handleNavigation);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('input', handleInput);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Get element identifier for tracking
  const getElementIdentifier = (element: HTMLElement): string => {
    if (element.id) return element.id;
    if (element.className) return element.className.split(' ')[0];
    if (element.tagName) return element.tagName.toLowerCase();
    return 'unknown';
  };

  // Track search query
  const trackSearch = useCallback((query: string, results: number, filters?: Record<string, any>) => {
    const searchPattern: SearchPattern = {
      query,
      count: 1,
      results,
      filters: filters || {},
      timestamp: Date.now()
    };

    setSearchPatterns(prev => {
      const existing = prev.find(p => p.query === query);
      if (existing) {
        existing.count++;
        existing.timestamp = Date.now();
        return [...prev];
      }
      return [searchPattern, ...prev.slice(0, 9)];
    });

    analytics.trackSearch(query, results, filters);
    searchCount.current++;
  }, []);

  // Track event interaction
  const trackEventInteraction = useCallback((eventId: string, action: 'view' | 'like' | 'share' | 'save') => {
    const interaction: UserInteraction = {
      type: 'click',
      element: `event-${action}`,
      page: window.location.pathname,
      timestamp: Date.now(),
      properties: { eventId, action }
    };

    analytics.trackEventInteraction(eventId, action);
    setRecentInteractions(prev => [interaction, ...prev.slice(0, 9)]);
    interactionCount.current++;
  }, []);

  // Update engagement metrics
  const updateEngagementMetrics = useCallback(() => {
    const currentTime = Date.now();
    const sessionDuration = (currentTime - sessionStartTime.current) / (1000 * 60); // in minutes

    setEngagementMetrics({
      sessionDuration,
      pageViews: pageViewCount.current,
      interactions: interactionCount.current,
      searchQueries: searchCount.current,
      eventViews: recentInteractions.filter(i => i.element.startsWith('event-view')).length,
      eventInteractions: recentInteractions.filter(i => i.element.startsWith('event-')).length
    });

    // Update current session
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        lastActivity: currentTime,
        duration: sessionDuration,
        pageViews: prev.pageViews,
        events: engagementMetrics.eventViews,
        interactions: interactionCount.current
      } : null);
    }
  }, [currentSession, engagementMetrics.eventViews, engagementMetrics.eventInteractions]);

  // Load user behavior data
  const loadUserBehaviorData = useCallback(async () => {
    try {
      // Simulate loading user behavior data
      const mockSession: UserSession = {
        id: sessionId || `session_${Date.now()}`,
        startTime: sessionStartTime.current,
        lastActivity: Date.now(),
        duration: (Date.now() - sessionStartTime.current) / (1000 * 60),
        pageViews: ['/map', '/events', '/profile'],
        events: 5,
        interactions: interactionCount.current,
        device: getDeviceType(),
        location: 'New York, NY'
      };

      setCurrentSession(mockSession);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load user behavior data:', error);
    }
  }, [sessionId]);

  // Get device type
  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) return 'Mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes.toFixed(0)}m`;
  };

  // Get interaction icon
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click': return <CursorArrowRaysIcon className="w-4 h-4" />;
      case 'scroll': return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'input': return <MagnifyingGlassIcon className="w-4 h-4" />;
      case 'navigation': return <EyeIcon className="w-4 h-4" />;
      case 'search': return <MagnifyingGlassIcon className="w-4 h-4" />;
      default: return <CursorArrowRaysIcon className="w-4 h-4" />;
    }
  };

  // Initialize tracking on mount
  useEffect(() => {
    initializeTracking();
    loadUserBehaviorData();

    if (showRealTime && refreshInterval > 0) {
      const interval = setInterval(() => {
        updateEngagementMetrics();
        loadUserBehaviorData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [initializeTracking, loadUserBehaviorData, updateEngagementMetrics, showRealTime, refreshInterval]);

  // Update metrics periodically
  useEffect(() => {
    const metricsInterval = setInterval(updateEngagementMetrics, 5000);
    return () => clearInterval(metricsInterval);
  }, [updateEngagementMetrics]);

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text))] flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
              User Behavior Tracker
            </h2>
            <p className="text-[rgb(var(--muted))] mt-1">
              {userId ? `Tracking user: ${userId}` : 'Anonymous session tracking'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isTracking && (
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Active
              </div>
            )}
            <div className="text-sm text-[rgb(var(--muted))]">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'interactions', label: 'Interactions', icon: CursorArrowRaysIcon },
            { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
            { id: 'engagement', label: 'Engagement', icon: ArrowTrendingUpIcon }
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
            {/* Session Information */}
            {currentSession && (
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Current Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--brand))]">
                      {formatDuration(currentSession.duration)}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--text))]">
                      {currentSession.pageViews.length}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Pages Viewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--text))]">
                      {currentSession.events}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Events Viewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--text))]">
                      {currentSession.interactions}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">Interactions</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                      <span className="text-[rgb(var(--muted))]">Device:</span>
                      <span className="text-[rgb(var(--text))]">{currentSession.device}</span>
                    </div>
                    {currentSession.location && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                        <span className="text-[rgb(var(--muted))]">Location:</span>
                        <span className="text-[rgb(var(--text))]">{currentSession.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                      <span className="text-[rgb(var(--muted))]">Started:</span>
                      <span className="text-[rgb(var(--text))]">
                        {new Date(currentSession.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Session Duration</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {formatDuration(engagementMetrics.sessionDuration)}
                    </p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Page Views</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {engagementMetrics.pageViews}
                    </p>
                  </div>
                  <EyeIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Interactions</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {engagementMetrics.interactions}
                    </p>
                  </div>
                  <CursorArrowRaysIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Search Queries</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {engagementMetrics.searchQueries}
                    </p>
                  </div>
                  <MagnifyingGlassIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Event Views</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {engagementMetrics.eventViews}
                    </p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">Event Actions</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text))]">
                      {engagementMetrics.eventInteractions}
                    </p>
                  </div>
                  <HeartIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="space-y-6">
            {/* Recent Interactions */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Recent Interactions</h3>
              <div className="space-y-3">
                {recentInteractions.length > 0 ? (
                  recentInteractions.map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-[rgb(var(--brand))]">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text))] capitalize">
                            {interaction.type}
                          </div>
                          <div className="text-xs text-[rgb(var(--muted))]">
                            {interaction.element} • {interaction.page}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[rgb(var(--muted))]">
                        {formatTimestamp(interaction.timestamp)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[rgb(var(--muted))]">
                    No interactions recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Types Breakdown */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Interaction Types</h3>
              <div className="space-y-3">
                {Object.entries(
                  recentInteractions.reduce((acc, interaction) => {
                    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[rgb(var(--brand))]">
                        {getInteractionIcon(type)}
                      </span>
                      <span className="text-sm text-[rgb(var(--text))] capitalize">{type}</span>
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text))]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Patterns */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Search Patterns</h3>
              <div className="space-y-3">
                {searchPatterns.length > 0 ? (
                  searchPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[rgb(var(--panel))] rounded-lg">
                      <div className="flex items-center gap-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text))]">
                            "{pattern.query}"
                          </div>
                          <div className="text-xs text-[rgb(var(--muted))]">
                            {pattern.results} results found
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[rgb(var(--text))]">
                          {pattern.count} searches
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          {formatTimestamp(pattern.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[rgb(var(--muted))]">
                    No search queries recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Search Demo */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Test Search Tracking</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter search query..."
                    className="flex-1 px-3 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query.trim()) {
                          trackSearch(query, Math.floor(Math.random() * 50) + 10);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter search query..."]') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        trackSearch(input.value, Math.floor(Math.random() * 50) + 10);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                  >
                    Search
                  </button>
                </div>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Type a search query and press Enter or click Search to test the tracking
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Session Engagement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Session Duration</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {formatDuration(engagementMetrics.sessionDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Pages per Session</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {engagementMetrics.pageViews}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Interactions per Session</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {engagementMetrics.interactions}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Event Engagement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Events Viewed</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {engagementMetrics.eventViews}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Event Actions</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {engagementMetrics.eventInteractions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--muted))]">Search Queries</span>
                    <span className="font-medium text-[rgb(var(--text))]">
                      {engagementMetrics.searchQueries}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Demo */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Test Event Interactions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => trackEventInteraction('demo-event-1', 'view')}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  View Event
                </button>
                <button
                  onClick={() => trackEventInteraction('demo-event-1', 'like')}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))]/20 rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <HeartIcon className="w-4 h-4" />
                  Like Event
                </button>
                <button
                  onClick={() => trackEventInteraction('demo-event-1', 'share')}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))]/20 rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share Event
                </button>
                <button
                  onClick={() => trackEventInteraction('demo-event-1', 'save')}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))]/20 rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <BookmarkIcon className="w-4 h-4" />
                  Save Event
                </button>
              </div>
              <p className="text-xs text-[rgb(var(--muted))] mt-3">
                Click these buttons to test event interaction tracking
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
