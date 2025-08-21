'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChartBarIcon, ClockIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  fmp: number | null; // First Meaningful Paint
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

export default function PerformanceMonitor({
  enabled = true,
  showMetrics = false,
  onMetricsUpdate,
  className = ""
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fmp: null
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  // Calculate performance score based on Core Web Vitals
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // FCP scoring (0-100)
    if (metrics.fcp) {
      if (metrics.fcp <= 1800) score -= 0;
      else if (metrics.fcp <= 3000) score -= 10;
      else score -= 20;
    }
    
    // LCP scoring (0-100)
    if (metrics.lcp) {
      if (metrics.lcp <= 2500) score -= 0;
      else if (metrics.lcp <= 4000) score -= 10;
      else score -= 20;
    }
    
    // FID scoring (0-100)
    if (metrics.fid) {
      if (metrics.fid <= 100) score -= 0;
      else if (metrics.fid <= 300) score -= 10;
      else score -= 20;
    }
    
    // CLS scoring (0-100)
    if (metrics.cls) {
      if (metrics.cls <= 0.1) score -= 0;
      else if (metrics.cls <= 0.25) score -= 10;
      else score -= 20;
    }
    
    return Math.max(0, score);
  }, []);

  // Monitor First Contentful Paint (FCP)
  const monitorFCP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        setMetrics(prev => ({
          ...prev,
          fcp: fcpEntry.startTime
        }));
        observer.disconnect();
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }, []);

  // Monitor Largest Contentful Paint (LCP)
  const monitorLCP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    let lcpValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        lcpValue = lastEntry.startTime;
        setMetrics(prev => ({
          ...prev,
          lcp: lcpValue
        }));
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Stop observing after 5 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  }, []);

  // Monitor First Input Delay (FID)
  const monitorFID = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'first-input') {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }));
          observer.disconnect();
          break;
        }
      }
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }, []);

  // Monitor Cumulative Layout Shift (CLS)
  const monitorCLS = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          clsValue += (entry as any).value;
          setMetrics(prev => ({
            ...prev,
            cls: clsValue
          }));
        }
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    // Stop observing after 5 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  }, []);

  // Monitor Time to First Byte (TTFB)
  const monitorTTFB = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            ttfb: navEntry.responseStart - navEntry.requestStart
          }));
          observer.disconnect();
          break;
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }, []);

  // Monitor First Meaningful Paint (FMP) - approximation
  const monitorFMP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'paint' && entry.name === 'first-paint') {
          setMetrics(prev => ({
            ...prev,
            fmp: entry.startTime
          }));
          observer.disconnect();
          break;
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!enabled || isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Start monitoring various metrics
    monitorFCP();
    monitorLCP();
    monitorFID();
    monitorCLS();
    monitorTTFB();
    monitorFMP();
    
    // Monitor resource loading performance
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Log slow resources
            if (resourceEntry.duration > 1000) {
              console.warn('Slow resource loaded:', {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize
              });
            }
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }, [enabled, isMonitoring, monitorFCP, monitorLCP, monitorFID, monitorCLS, monitorTTFB, monitorFMP]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Format metric value
  const formatMetric = (value: number | null, unit: string = 'ms'): string => {
    if (value === null) return 'N/A';
    return `${value.toFixed(0)}${unit}`;
  };

  // Get metric status (good, needs improvement, poor)
  const getMetricStatus = (metric: keyof PerformanceMetrics): 'good' | 'needs-improvement' | 'poor' => {
    const value = metrics[metric];
    if (value === null) return 'needs-improvement';
    
    switch (metric) {
      case 'fcp':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'needs-improvement';
    }
  };

  // Get status color
  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Start monitoring on mount
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    }
    
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [enabled, startMonitoring, stopMonitoring, isMonitoring]);

  // Update performance score when metrics change
  useEffect(() => {
    const score = calculatePerformanceScore(metrics);
    setPerformanceScore(score);
    onMetricsUpdate?.(metrics);
  }, [metrics, calculatePerformanceScore, onMetricsUpdate]);

  if (!enabled) return null;

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
          Performance Monitor
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Performance Score */}
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--brand))]">
              {performanceScore}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">Score</div>
          </div>
          
          {/* Monitoring Status */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium border
            ${isMonitoring 
              ? 'text-green-700 bg-green-100 border-green-200' 
              : 'text-gray-700 bg-gray-100 border-gray-200'
            }
          `}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      {showMetrics && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[rgb(var(--text))]">Core Web Vitals</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* FCP */}
            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text))]">FCP</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(getMetricStatus('fcp'))}
                `}>
                  {getMetricStatus('fcp').replace('-', ' ')}
                </span>
              </div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.fcp)}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">First Contentful Paint</div>
            </div>

            {/* LCP */}
            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text))]">LCP</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(getMetricStatus('lcp'))}
                `}>
                  {getMetricStatus('lcp').replace('-', ' ')}
                </span>
              </div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.lcp)}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">Largest Contentful Paint</div>
            </div>

            {/* FID */}
            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text))]">FID</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(getMetricStatus('fid'))}
                `}>
                  {getMetricStatus('fid').replace('-', ' ')}
                </span>
              </div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.fid)}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">First Input Delay</div>
            </div>

            {/* CLS */}
            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text))]">CLS</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(getMetricStatus('cls'))}
                `}>
                  {getMetricStatus('cls').replace('-', ' ')}
                </span>
              </div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.cls, '')}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">Cumulative Layout Shift</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="text-sm font-medium text-[rgb(var(--text))] mb-1">TTFB</div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.ttfb)}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">Time to First Byte</div>
            </div>

            <div className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
              <div className="text-sm font-medium text-[rgb(var(--text))] mb-1">FMP</div>
              <div className="text-lg font-bold text-[rgb(var(--text))]">
                {formatMetric(metrics.fmp)}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">First Meaningful Paint</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[rgb(var(--border-color))]/20">
        <button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${isMonitoring
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90'
            }
          `}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg font-medium hover:bg-[rgb(var(--bg))]/80 transition-colors"
        >
          Refresh Metrics
        </button>
      </div>

      {/* Performance Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <BoltIcon className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Performance Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Optimize images and use WebP format</li>
              <li>• Minimize JavaScript bundle size</li>
              <li>• Use lazy loading for non-critical resources</li>
              <li>• Implement proper caching strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
