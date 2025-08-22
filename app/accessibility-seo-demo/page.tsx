'use client';

import React, { useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import AccessibleButton from '@/components/ui/AccessibleButton';
import AccessibleNavigation from '@/components/ui/AccessibleNavigation';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import { 
  HomeIcon, 
  MapIcon, 
  CalendarIcon, 
  UserIcon, 
  CogIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

export default function AccessibilitySEODemo() {
  const [activeTab, setActiveTab] = useState('accessibility');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);

  // Navigation items for demo
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: <HomeIcon className="w-4 h-4" />
    },
    {
      id: 'map',
      label: 'Map',
      href: '/map',
      icon: <MapIcon className="w-4 h-4" />
    },
    {
      id: 'events',
      label: 'Events',
      href: '/events',
      icon: <CalendarIcon className="w-4 h-4" />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" />,
      children: [
        { id: 'settings', label: 'Settings', icon: <CogIcon className="w-4 h-4" /> },
        { id: 'preferences', label: 'Preferences', icon: <CogIcon className="w-4 h-4" /> }
      ]
    }
  ];

  // Structured data for events
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Summer Music Festival 2024",
    "description": "Join us for an amazing summer music festival featuring top artists from around the world.",
    "startDate": "2024-07-15T18:00:00",
    "endDate": "2024-07-15T23:00:00",
    "location": {
      "@type": "Place",
      "name": "Central Park",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Central Park",
        "addressLocality": "New York",
        "addressRegion": "NY",
        "postalCode": "10024",
        "addressCountry": "US"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Poppin Events",
      "url": "https://poppin.app"
    },
    "offers": {
      "@type": "Offer",
      "price": "25.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Performance metrics callback
  const handleMetricsUpdate = (metrics: any) => {
    console.log('Performance metrics updated:', metrics);
  };

  return (
    <>
      {/* SEO Head Component */}
      <SEOHead
        title="Accessibility & SEO Demo"
        description="Explore comprehensive accessibility features, ARIA labels, keyboard navigation, and SEO optimization including structured data and Core Web Vitals monitoring."
        keywords={['accessibility', 'SEO', 'ARIA', 'keyboard navigation', 'Core Web Vitals', 'performance']}
        canonicalUrl="https://poppin.app/accessibility-seo-demo"
        ogType="website"
        structuredData={structuredData}
        preload={[
          { href: '/api/events', as: 'fetch', crossOrigin: true }
        ]}
      />

      <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
        {/* Header */}
        <header className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
              Accessibility & SEO Demo
            </h1>
            <p className="text-[rgb(var(--muted))] text-lg">
              Comprehensive accessibility features, ARIA labels, keyboard navigation, and SEO optimization
            </p>
            
            {/* Accessible Navigation Demo */}
            <div className="mt-6">
              <AccessibleNavigation
                items={navigationItems}
                variant="default"
                orientation="horizontal"
                ariaLabel="Main navigation"
                onItemClick={(item) => console.log('Navigation item clicked:', item)}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-6">
          {/* Tab Navigation */}
          <AccessibleNavigation
            items={[
              { id: 'accessibility', label: 'Accessibility Features' },
              { id: 'seo', label: 'SEO & Performance' },
              { id: 'examples', label: 'Interactive Examples' }
            ]}
            variant="tabs"
            activeItemId={activeTab}
            onItemClick={(item) => setActiveTab(item.id)}
            className="mb-8"
          />

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'accessibility' && (
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-6">
                  Accessibility Features
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* ARIA Labels & Screen Reader Support */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      ARIA Labels & Screen Reader Support
                    </h3>
                    
                    <div className="space-y-4">
                      <AccessibleButton
                        variant="primary"
                        ariaLabel="Search for events"
                        ariaDescribedBy="search-description"
                        leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                      >
                        Search Events
                      </AccessibleButton>
                      
                      <div id="search-description" className="text-sm text-[rgb(var(--muted))]">
                        Use this button to search for events in your area
                      </div>
                      
                      <AccessibleButton
                        variant="outline"
                        ariaLabel="Like this event"
                        ariaPressed={false}
                        leftIcon={<HeartIcon className="w-4 h-4" />}
                      >
                        Like Event
                      </AccessibleButton>
                      
                      <AccessibleButton
                        variant="ghost"
                        ariaLabel="Share this event"
                        ariaHaspopup="dialog"
                        leftIcon={<ShareIcon className="w-4 h-4" />}
                      >
                        Share Event
                      </AccessibleButton>
                    </div>
                  </div>

                  {/* Keyboard Navigation */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      Keyboard Navigation
                    </h3>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Use Tab, Arrow keys, Enter, and Space to navigate
                      </p>
                      
                      <div className="space-y-2">
                        <AccessibleButton variant="secondary" size="sm">
                          Tab 1
                        </AccessibleButton>
                        <AccessibleButton variant="secondary" size="sm">
                          Tab 2
                        </AccessibleButton>
                        <AccessibleButton variant="secondary" size="sm">
                          Tab 3
                        </AccessibleButton>
                      </div>
                      
                      <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
                        <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-2">
                          Keyboard Shortcuts
                        </h4>
                        <ul className="text-xs text-[rgb(var(--muted))] space-y-1">
                          <li>• Tab: Navigate between elements</li>
                          <li>• Shift+Tab: Navigate backwards</li>
                          <li>• Enter/Space: Activate buttons</li>
                          <li>• Arrow keys: Navigate within components</li>
                          <li>• Escape: Close modals/dropdowns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-6">
                  SEO & Performance
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* SEO Features */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      SEO Features
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          Meta Tags & Open Graph
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Dynamic title and description</li>
                          <li>• Open Graph for social sharing</li>
                          <li>• Twitter Card support</li>
                          <li>• Canonical URLs</li>
                          <li>• Structured data (JSON-LD)</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          Performance Optimization
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Resource preloading</li>
                          <li>• DNS prefetching</li>
                          <li>• Preconnect to external domains</li>
                          <li>• Optimized viewport settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Performance Monitoring */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      Performance Monitoring
                    </h3>
                    
                    <PerformanceMonitor
                      enabled={true}
                      showMetrics={showPerformanceMetrics}
                      onMetricsUpdate={handleMetricsUpdate}
                      className="mb-4"
                    />
                    
                    <AccessibleButton
                      variant="outline"
                      onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                      ariaLabel={showPerformanceMetrics ? 'Hide performance metrics' : 'Show performance metrics'}
                    >
                      {showPerformanceMetrics ? 'Hide Metrics' : 'Show Metrics'}
                    </AccessibleButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-6">
                  Interactive Examples
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Form Example */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      Accessible Form
                    </h3>
                    
                    <form className="space-y-4" role="form" aria-label="Event search form">
                      <div>
                        <label htmlFor="event-search" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                          Search Events
                        </label>
                        <input
                          type="text"
                          id="event-search"
                          name="event-search"
                          className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                          placeholder="Enter event name or location"
                          aria-describedby="search-help"
                        />
                        <div id="search-help" className="text-xs text-[rgb(var(--muted))] mt-1">
                          Type to search for events by name, location, or category
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="event-category" className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                          Category
                        </label>
                        <select
                          id="event-category"
                          name="event-category"
                          className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                          aria-describedby="category-help"
                        >
                          <option value="">Select a category</option>
                          <option value="music">Music</option>
                          <option value="sports">Sports</option>
                          <option value="food">Food & Drink</option>
                          <option value="art">Art & Culture</option>
                        </select>
                        <div id="category-help" className="text-xs text-[rgb(var(--muted))] mt-1">
                          Choose an event category to filter results
                        </div>
                      </div>
                      
                      <AccessibleButton
                        type="submit"
                        variant="primary"
                        ariaLabel="Submit event search"
                      >
                        Search Events
                      </AccessibleButton>
                    </form>
                  </div>

                  {/* Modal Example */}
                  <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
                    <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                      Modal & Dialog
                    </h3>
                    
                    <AccessibleButton
                      variant="outline"
                      ariaHaspopup="dialog"
                      ariaControls="event-modal"
                      ariaExpanded={false}
                      onClick={() => {
                        // This would open a modal in a real implementation
                        console.log('Open modal');
                      }}
                    >
                      Open Event Details
                    </AccessibleButton>
                    
                    <div className="mt-4 p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
                      <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-2">
                        ARIA Attributes Used
                      </h4>
                      <ul className="text-xs text-[rgb(var(--muted))] space-y-1">
                        <li>• aria-haspopup="dialog"</li>
                        <li>• aria-controls="event-modal"</li>
                        <li>• aria-expanded="false"</li>
                        <li>• role="button" (default)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accessibility Checklist */}
          <div className="mt-12 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
            <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
              Accessibility Checklist
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-[rgb(var(--text))] mb-3">ARIA & Semantics</h4>
                <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Proper ARIA labels and descriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Semantic HTML elements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    ARIA landmarks and regions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    State and property attributes
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-[rgb(var(--text))] mb-3">Keyboard & Navigation</h4>
                <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Full keyboard accessibility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Logical tab order
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Focus management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Keyboard shortcuts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </>
  );
}
