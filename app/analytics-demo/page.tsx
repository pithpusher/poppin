'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserIcon, 
  ArrowTrendingUpIcon, 
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import UserBehaviorTracker from '@/components/analytics/UserBehaviorTracker';
import { abTesting } from '@/lib/abTesting';
import { analytics } from '@/lib/analytics';

export default function AnalyticsDemo() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'behavior' | 'ab-tests'>('dashboard');
  const [isTracking, setIsTracking] = useState(true);
  const [sessionId] = useState(`demo_session_${Date.now()}`);
  const [abTestResults, setAbTestResults] = useState<any[]>([]);
  const [testStats, setTestStats] = useState<any>({});

  // Load A/B test data
  useEffect(() => {
    const loadABTestData = () => {
      const activeTests = abTesting.getActiveTests();
      const results = activeTests.map(test => ({
        test,
        metrics: abTesting.getTestMetrics(test.id),
        statistics: abTesting.getTestStatistics(test.id)
      }));
      setAbTestResults(results);

      // Get overall test statistics
      const stats = activeTests.reduce((acc, test) => {
        const testStats = abTesting.getTestStatistics(test.id);
        acc.totalTests = (acc.totalTests || 0) + 1;
        acc.totalUsers = (acc.totalUsers || 0) + testStats.totalUsers;
        acc.activeTests = (acc.activeTests || 0) + (test.active ? 1 : 0);
        return acc;
      }, {} as any);
      setTestStats(stats);
    };

    loadABTestData();
    const interval = setInterval(loadABTestData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Toggle tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (isTracking) {
      // Stop tracking
      console.log('Analytics tracking stopped');
    } else {
      // Start tracking
      console.log('Analytics tracking started');
      analytics.trackPageView(window.location.pathname);
    }
  };

  // Create demo A/B test
  const createDemoTest = () => {
    const testId = abTesting.createTest({
      name: 'Demo Button Test',
      description: 'Testing different button styles for demo purposes',
      variants: [
        { id: 'control', name: 'Control (Red)', weight: 50, properties: { color: 'red', style: 'default' } },
        { id: 'blue', name: 'Blue Button', weight: 25, properties: { color: 'blue', style: 'rounded' } },
        { id: 'green', name: 'Green Button', weight: 25, properties: { color: 'green', style: 'outlined' } }
      ],
      startDate: Date.now(),
      active: true,
      metrics: ['click_rate', 'conversion_rate', 'engagement_time']
    });

    console.log('Created demo A/B test:', testId);
    
    // Refresh data
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Record demo test result
  const recordDemoResult = (testId: string, variantId: string) => {
    abTesting.recordResult({
      testId,
      variantId,
      sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    });

    console.log('Recorded demo result:', { testId, variantId });
  };

  // Reset all tests
  const resetAllTests = () => {
    abTesting.getActiveTests().forEach(test => {
      abTesting.resetTestAssignments(test.id);
    });
    console.log('Reset all A/B test assignments');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      {/* Header */}
      <header className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Analytics & User Behavior Demo
          </h1>
          <p className="text-[rgb(var(--muted))] text-lg">
            Comprehensive analytics dashboard, user behavior tracking, and A/B testing capabilities
          </p>

          {/* Control Panel */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={toggleTracking}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${isTracking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90'
                }
              `}
            >
              {isTracking ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Start Tracking
                </>
              )}
            </button>

            <button
              onClick={createDemoTest}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                                  <ArrowTrendingUpIcon className="w-4 h-4" />
              Create Demo Test
            </button>

            <button
              onClick={resetAllTests}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset Tests
            </button>

            <div className="flex items-center gap-2 text-sm">
              <div className={`
                w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}
              `}></div>
              <span className={isTracking ? 'text-green-600' : 'text-red-600'}>
                {isTracking ? 'Tracking Active' : 'Tracking Stopped'}
              </span>
            </div>

            <div className="text-sm text-[rgb(var(--muted))]">
              Session: {sessionId.slice(-8)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 border-b border-[rgb(var(--border-color))]/20">
            {[
              { id: 'dashboard', label: 'Analytics Dashboard', icon: ChartBarIcon },
              { id: 'behavior', label: 'User Behavior', icon: UserIcon },
              { id: 'ab-tests', label: 'A/B Testing', icon: ArrowTrendingUpIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id
                    ? "text-[rgb(var(--brand))] border-b-2 border-[rgb(var(--brand))]"
                    : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
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
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">
                  Analytics Dashboard
                </h2>
                <p className="text-[rgb(var(--muted))]">
                  Comprehensive overview of app performance, user metrics, and event analytics
                </p>
              </div>

              <AnalyticsDashboard
                showRealTime={isTracking}
                refreshInterval={isTracking ? 30000 : 0}
                className="mb-8"
              />

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Tracking Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Analytics Service</span>
                      <span className={`text-sm ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                        {isTracking ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Real-time Updates</span>
                      <span className={`text-sm ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                        {isTracking ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Data Collection</span>
                      <span className={`text-sm ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                        {isTracking ? 'Collecting' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Session Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Session ID</span>
                      <span className="text-sm font-mono text-[rgb(var(--text))]">
                        {sessionId.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Start Time</span>
                      <span className="text-sm text-[rgb(var(--text))]">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Duration</span>
                      <span className="text-sm text-[rgb(var(--text))]">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[rgb(var(--text))]">Real-time Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[rgb(var(--text))]">User Behavior Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[rgb(var(--text))]">A/B Testing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[rgb(var(--text))]">Performance Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">
                  User Behavior Tracker
                </h2>
                <p className="text-[rgb(var(--muted))]">
                  Monitor user interactions, search patterns, and engagement metrics in real-time
                </p>
              </div>

              <UserBehaviorTracker
                sessionId={sessionId}
                showRealTime={isTracking}
                refreshInterval={isTracking ? 10000 : 0}
                className="mb-8"
              />

              {/* Behavior Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Tracking Features</h3>
                  <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                    <li>• Click tracking with coordinates</li>
                    <li>• Scroll depth monitoring</li>
                    <li>• Input field interactions</li>
                    <li>• Page navigation tracking</li>
                    <li>• Search query analysis</li>
                    <li>• Event interaction monitoring</li>
                  </ul>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Data Privacy</h3>
                  <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                    <li>• Anonymous session tracking</li>
                    <li>• No personal data collection</li>
                    <li>• Configurable tracking levels</li>
                    <li>• Easy opt-out mechanism</li>
                    <li>• GDPR compliant</li>
                    <li>• Data retention controls</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ab-tests' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">
                  A/B Testing Dashboard
                </h2>
                <p className="text-[rgb(var(--muted))]">
                  Create, manage, and monitor A/B tests to optimize user experience and conversion rates
                </p>
              </div>

              {/* A/B Test Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6 text-center">
                  <div className="text-3xl font-bold text-[rgb(var(--brand))] mb-2">
                    {testStats.totalTests || 0}
                  </div>
                  <div className="text-sm text-[rgb(var(--muted))]">Total Tests</div>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {testStats.activeTests || 0}
                  </div>
                  <div className="text-sm text-[rgb(var(--muted))]">Active Tests</div>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6 text-center">
                  <div className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
                    {testStats.totalUsers || 0}
                  </div>
                  <div className="text-sm text-[rgb(var(--muted))]">Total Users</div>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {abTestResults.length}
                  </div>
                  <div className="text-sm text-[rgb(var(--muted))]">Test Results</div>
                </div>
              </div>

              {/* Active Tests */}
              <div className="space-y-6">
                {abTestResults.map((testData) => (
                  <div key={testData.test.id} className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[rgb(var(--text))]">
                          {testData.test.name}
                        </h3>
                        <p className="text-[rgb(var(--muted))] mt-1">
                          {testData.test.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>

                    {/* Test Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {testData.metrics.map((metric) => (
                        <div key={metric.variantId} className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
                          <div className="text-center mb-3">
                            <div className="text-lg font-bold text-[rgb(var(--text))] capitalize">
                              {metric.variantId}
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {testData.test.variants.find(v => v.id === metric.variantId)?.name}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--muted))]">Impressions:</span>
                              <span className="text-[rgb(var(--text))]">{metric.impressions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--muted))]">Conversions:</span>
                              <span className="text-[rgb(var(--text))]">{metric.conversions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--muted))]">Rate:</span>
                              <span className="text-[rgb(var(--brand))] font-medium">
                                {metric.conversionRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Test Button */}
                          <button
                            onClick={() => recordDemoResult(testData.test.id, metric.variantId)}
                            className="w-full mt-3 px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm"
                          >
                            Test Variant
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Test Statistics */}
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

                {abTestResults.length === 0 && (
                  <div className="text-center py-12">
                    <ArrowTrendingUpIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
                      No Active A/B Tests
                    </h3>
                    <p className="text-[rgb(var(--muted))] mb-4">
                      Create a demo test to see A/B testing in action
                    </p>
                    <button
                      onClick={createDemoTest}
                      className="px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                    >
                      Create Demo Test
                    </button>
                  </div>
                )}
              </div>

              {/* A/B Testing Features */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Test Capabilities</h3>
                  <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                    <li>• Multiple variant testing</li>
                    <li>• Weighted traffic distribution</li>
                    <li>• Real-time metrics tracking</li>
                    <li>• Statistical significance analysis</li>
                    <li>• Automatic variant assignment</li>
                    <li>• Performance comparison</li>
                  </ul>
                </div>

                <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Metrics Tracked</h3>
                  <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                    <li>• Conversion rates</li>
                    <li>• Click-through rates</li>
                    <li>• Session duration</li>
                    <li>• Bounce rates</li>
                    <li>• User engagement</li>
                    <li>• Custom metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
