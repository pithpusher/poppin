// Analytics service for tracking user behavior and app performance

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  referrer?: string;
}

export interface UserBehavior {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: string[];
  events: AnalyticsEvent[];
  interactions: UserInteraction[];
  performance: PerformanceMetrics;
  device: DeviceInfo;
  location?: GeolocationData;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'input' | 'navigation' | 'search';
  element: string;
  page: string;
  timestamp: number;
  properties?: Record<string, any>;
}

export interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  loadTime: number | null;
  domSize: number | null;
  resourceCount: number | null;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenSize: string;
  viewportSize: string;
  pixelRatio: number;
  touchSupport: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  properties: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: number;
  endDate?: number;
  active: boolean;
  metrics: string[];
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private interactions: UserInteraction[] = [];
  private pageViews: string[] = [];
  private sessionStartTime: number;
  private lastActivity: number;
  private performanceObserver?: PerformanceObserver;
  private isTracking = false;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    this.initSession();
  }

  // Initialize analytics session
  private initSession(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    this.trackPageView(window.location.pathname);
    this.setupPerformanceMonitoring();
    this.setupEventListeners();
    this.startBatchFlushing();
    this.isTracking = true;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user ID for tracking
  public setUserId(userId: string): void {
    this.userId = userId;
    this.updateLastActivity();
  }

  // Track page view
  public trackPageView(page: string): void {
    this.pageViews.push(page);
    this.trackEvent('page_view', 'navigation', 'view', page);
    this.updateLastActivity();
  }

  // Track custom event
  public trackEvent(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };

    this.events.push(analyticsEvent);
    this.updateLastActivity();

    // Send to analytics service if batch is full
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Track user interaction
  public trackInteraction(
    type: UserInteraction['type'],
    element: string,
    properties?: Record<string, any>
  ): void {
    const interaction: UserInteraction = {
      type,
      element,
      page: window.location.pathname,
      timestamp: Date.now(),
      properties
    };

    this.interactions.push(interaction);
    this.updateLastActivity();
  }

  // Track search query
  public trackSearch(query: string, results: number, filters?: Record<string, any>): void {
    this.trackEvent('search', 'search', 'query', query, results, {
      query,
      results,
      filters,
      searchType: 'event_search'
    });
  }

  // Track event interaction
  public trackEventInteraction(
    eventId: string,
    action: 'view' | 'like' | 'share' | 'save' | 'bookmark',
    properties?: Record<string, any>
  ): void {
    this.trackEvent('event_interaction', 'event', action, eventId, undefined, {
      eventId,
      action,
      ...properties
    });
  }

  // Track filter usage
  public trackFilterUsage(
    filterType: string,
    filterValue: any,
    results: number
  ): void {
    this.trackEvent('filter_usage', 'filter', 'apply', filterType, results, {
      filterType,
      filterValue,
      results
    });
  }

  // Track map interaction
  public trackMapInteraction(
    action: 'zoom' | 'pan' | 'click' | 'cluster_expand',
    properties?: Record<string, any>
  ): void {
    this.trackEvent('map_interaction', 'map', action, undefined, undefined, {
      action,
      ...properties
    });
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          this.trackNavigationPerformance(entry as PerformanceNavigationTiming);
        } else if (entry.entryType === 'resource') {
          this.trackResourcePerformance(entry as PerformanceResourceTiming);
        }
      }
    });

    this.performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
  }

  // Track navigation performance
  private trackNavigationPerformance(navEntry: PerformanceNavigationTiming): void {
    const performanceData = {
      ttfb: navEntry.responseStart - navEntry.requestStart,
      loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
      domSize: document.querySelectorAll('*').length,
      resourceCount: navEntry.transferSize || 0
    };

    this.trackEvent('performance', 'performance', 'navigation', 'page_load', undefined, performanceData);
  }

  // Track resource performance
  private trackResourcePerformance(resourceEntry: PerformanceResourceTiming): void {
    if (resourceEntry.duration > 1000) { // Only track slow resources
      this.trackEvent('performance', 'performance', 'resource', resourceEntry.name, resourceEntry.duration, {
        resourceName: resourceEntry.name,
        duration: resourceEntry.duration,
        size: resourceEntry.transferSize,
        type: resourceEntry.initiatorType
      });
    }
  }

  // Setup event listeners for user interactions
  private setupEventListeners(): void {
    // Click tracking
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target) {
        const element = this.getElementIdentifier(target);
        this.trackInteraction('click', element, {
          tagName: target.tagName,
          className: target.className,
          textContent: target.textContent?.substring(0, 100)
        });
      }
    });

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        this.trackInteraction('scroll', 'page', { scrollDepth });
      }, 100);
    });

    // Input tracking
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target && (target.type === 'text' || target.type === 'search')) {
        this.trackInteraction('input', this.getElementIdentifier(target), {
          fieldType: target.type,
          fieldName: target.name || target.id
        });
      }
    });

    // Navigation tracking
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });
  }

  // Get element identifier for tracking
  private getElementIdentifier(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    if (element.dataset.testid) return `[data-testid="${element.dataset.testid}"]`;
    return element.tagName.toLowerCase();
  }

  // Update last activity timestamp
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  // Start batch flushing
  private startBatchFlushing(): void {
    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  // Flush events to analytics service
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await this.sendToAnalytics(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  // Send events to analytics service
  private async sendToAnalytics(events: AnalyticsEvent[]): Promise<void> {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
  }

  // Get current user behavior data
  public getUserBehavior(): UserBehavior {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.sessionStartTime,
      lastActivity: this.lastActivity,
      pageViews: [...this.pageViews],
      events: [...this.events],
      interactions: [...this.interactions],
      performance: this.getPerformanceMetrics(),
      device: this.getDeviceInfo(),
      location: this.getLocationData()
    };
  }

  // Get performance metrics
  private getPerformanceMetrics(): PerformanceMetrics {
    if (!('performance' in window)) {
      return {
        fcp: null, lcp: null, fid: null, cls: null, ttfb: null,
        loadTime: null, domSize: null, resourceCount: null
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');

    return {
      fcp: null, // Will be set by PerformanceObserver
      lcp: null, // Will be set by PerformanceObserver
      fid: null, // Will be set by PerformanceObserver
      cls: null, // Will be set by PerformanceObserver
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : null,
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
      domSize: document.querySelectorAll('*').length,
      resourceCount: resources.length
    };
  }

  // Get device information
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screen = window.screen;

    return {
      type: this.getDeviceType(),
      os: this.getOperatingSystem(userAgent),
      browser: this.getBrowser(userAgent),
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  }

  // Get device type
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile';
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Get operating system
  private getOperatingSystem(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Get browser
  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Get location data (if available)
  private getLocationData(): GeolocationData | undefined {
    // This would be populated by the location service
    return undefined;
  }

  // Stop tracking
  public stopTracking(): void {
    this.isTracking = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.flushEvents(); // Send remaining events
  }

  // Get analytics summary
  public getAnalyticsSummary(): Record<string, any> {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const uniquePages = new Set(this.pageViews).size;
    const eventCounts = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      sessionId: this.sessionId,
      sessionDuration,
      pageViews: this.pageViews.length,
      uniquePages,
      events: this.events.length,
      eventCounts,
      interactions: this.interactions.length,
      lastActivity: this.lastActivity
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Export for use in components
export default analytics;
