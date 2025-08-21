'use client';

import React, { useState, useEffect } from 'react';
import { MapPinIcon, CameraIcon, BellIcon, WifiIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline';
import AdvancedLocationService from '@/components/mobile/AdvancedLocationService';
import CameraIntegration from '@/components/mobile/CameraIntegration';
import PushNotifications from '@/components/mobile/PushNotifications';
import OfflineMode from '@/components/mobile/OfflineMode';

interface DemoState {
  locationPermission: 'granted' | 'denied' | 'prompt';
  cameraPermission: 'granted' | 'denied' | 'prompt';
  notificationPermission: 'granted' | 'denied' | 'prompt';
  isOnline: boolean;
}

export default function AdvancedMobileFeaturesDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    locationPermission: 'prompt',
    cameraPermission: 'prompt',
    notificationPermission: 'prompt',
    isOnline: true
  });
  
  const [activeTab, setActiveTab] = useState<'location' | 'camera' | 'notifications' | 'offline'>('location');
  const [showPermissions, setShowPermissions] = useState(false);

  // Check initial permissions and status
  useEffect(() => {
    const checkPermissions = async () => {
      // Check location permission
      if ('permissions' in navigator) {
        try {
          const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setDemoState(prev => ({ ...prev, locationPermission: locationPermission.state }));
        } catch (error) {
          console.warn('Location permission check failed:', error);
        }
      }

      // Check camera permission
      if ('permissions' in navigator) {
        try {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setDemoState(prev => ({ ...prev, cameraPermission: cameraPermission.state }));
        } catch (error) {
          console.warn('Camera permission check failed:', error);
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        setDemoState(prev => ({ ...prev, notificationPermission: Notification.permission }));
      }

      // Check online status
      setDemoState(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    checkPermissions();

    // Listen for online/offline changes
    const handleOnline = () => setDemoState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDemoState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tabs = [
    {
      id: 'location' as const,
      name: 'Location Services',
      icon: MapPinIcon,
      description: 'GPS integration, geofencing, and location-based features'
    },
    {
      id: 'camera' as const,
      name: 'Camera Integration',
      icon: CameraIcon,
      description: 'Take photos, access gallery, and image processing'
    },
    {
      id: 'notifications' as const,
      name: 'Push Notifications',
      icon: BellIcon,
      description: 'Event reminders, nearby events, and smart notifications'
    },
    {
      id: 'offline' as const,
      name: 'Offline Mode',
      icon: WifiIcon,
      description: 'Data caching, offline browsing, and sync management'
    }
  ];

  const getPermissionStatus = (permission: string) => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'denied':
        return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    }
  };

  const getPermissionText = (permission: string) => {
    switch (permission) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Prompt';
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      {/* Header */}
      <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Advanced Mobile Features
          </h1>
          <p className="text-[rgb(var(--muted))] text-lg">
            Explore cutting-edge mobile capabilities including location services, camera integration, 
            push notifications, and offline mode.
          </p>
          
          {/* Permission Status Overview */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getPermissionStatus(demoState.locationPermission).bg} ${getPermissionStatus(demoState.locationPermission).border} mb-2`}>
                <MapPinIcon className={`w-6 h-6 ${getPermissionStatus(demoState.locationPermission).color}`} />
              </div>
              <div className="text-sm font-medium text-[rgb(var(--text))]">Location</div>
              <div className={`text-xs ${getPermissionStatus(demoState.locationPermission).color}`}>
                {getPermissionText(demoState.locationPermission)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getPermissionStatus(demoState.cameraPermission).bg} ${getPermissionStatus(demoState.cameraPermission).border} mb-2`}>
                <CameraIcon className={`w-6 h-6 ${getPermissionStatus(demoState.cameraPermission).color}`} />
              </div>
              <div className="text-sm font-medium text-[rgb(var(--text))]">Camera</div>
              <div className={`text-xs ${getPermissionStatus(demoState.cameraPermission).color}`}>
                {getPermissionText(demoState.cameraPermission)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getPermissionStatus(demoState.notificationPermission).bg} ${getPermissionStatus(demoState.notificationPermission).border} mb-2`}>
                <BellIcon className={`w-6 h-6 ${getPermissionStatus(demoState.notificationPermission).color}`} />
              </div>
              <div className="text-sm font-medium text-[rgb(var(--text))]">Notifications</div>
              <div className={`text-xs ${getPermissionStatus(demoState.notificationPermission).color}`}>
                {getPermissionText(demoState.notificationPermission)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                demoState.isOnline ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'
              } mb-2`}>
                <WifiIcon className={`w-6 h-6 ${
                  demoState.isOnline ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="text-sm font-medium text-[rgb(var(--text))]">Connection</div>
              <div className={`text-xs ${
                demoState.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {demoState.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-4xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive
                      ? 'border-[rgb(var(--brand))] text-[rgb(var(--brand))]'
                      : 'border-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--border-color))]/20'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'location' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">Location Services</h2>
                <p className="text-[rgb(var(--muted))]">
                  Advanced GPS integration with geofencing, location tracking, and proximity-based features.
                  Test location permissions, accuracy, and real-time location updates.
                </p>
              </div>
              
              <AdvancedLocationService
                onLocationUpdate={(location) => {
                  console.log('Location updated:', location);
                }}
                onGeofenceEnter={(geofence) => {
                  console.log('Entered geofence:', geofence);
                }}
                onGeofenceExit={(geofence) => {
                  console.log('Exited geofence:', geofence);
                }}
                enableTracking={true}
                enableGeofencing={true}
                className="mb-6"
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Location Features</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Real-time GPS tracking with accuracy indicators</li>
                      <li>• Geofencing for event venues and areas of interest</li>
                      <li>• Proximity alerts for nearby events</li>
                      <li>• Location history and favorite places</li>
                      <li>• Background location updates (when permitted)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">Camera Integration</h2>
                <p className="text-[rgb(var(--muted))]">
                  Full camera access with photo capture, gallery integration, and image processing.
                  Take photos for events, access your photo library, and manage captured images.
                </p>
              </div>
              
              <CameraIntegration
                onPhotoCapture={(photoData) => {
                  console.log('Photo captured:', photoData);
                }}
                onPhotoError={(error) => {
                  console.error('Camera error:', error);
                }}
                enableCamera={true}
                enableGallery={true}
                maxPhotos={10}
                photoQuality={0.9}
                className="mb-6"
              />
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CameraIcon className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">Camera Features</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• High-quality photo capture with adjustable settings</li>
                      <li>• Gallery access and multiple photo selection</li>
                      <li>• Image metadata and file management</li>
                      <li>• Camera device selection (front/back)</li>
                      <li>• Photo preview and editing capabilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">Push Notifications</h2>
                <p className="text-[rgb(var(--muted))]">
                  Smart notification system with event reminders, nearby event alerts, and customizable preferences.
                  Manage notification types, timing, and quiet hours.
                </p>
              </div>
              
              <PushNotifications
                onNotificationClick={(notification) => {
                  console.log('Notification clicked:', notification);
                }}
                onSettingsChange={(settings) => {
                  console.log('Notification settings changed:', settings);
                }}
                enableNotifications={true}
                className="mb-6"
              />
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BellIcon className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-800 mb-1">Notification Features</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Event reminders with customizable timing</li>
                      <li>• Nearby event alerts based on location</li>
                      <li>• Quiet hours and notification scheduling</li>
                      <li>• Sound and vibration preferences</li>
                      <li>• Smart notification grouping and management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">Offline Mode</h2>
                <p className="text-[rgb(var(--muted))]">
                  Comprehensive offline experience with data caching, offline browsing, and automatic sync.
                  Cache events, images, and user data for seamless offline access.
                </p>
              </div>
              
              <OfflineMode
                onCacheUpdate={(stats) => {
                  console.log('Cache updated:', stats);
                }}
                onSyncComplete={(status) => {
                  console.log('Sync completed:', status);
                }}
                enableOfflineMode={true}
                maxCacheSize={100}
                className="mb-6"
              />
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <WifiIcon className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-orange-800 mb-1">Offline Features</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Intelligent data caching with size management</li>
                      <li>• Offline event browsing and search</li>
                      <li>• Automatic sync when connection is restored</li>
                      <li>• Pending changes tracking and conflict resolution</li>
                      <li>• Cache statistics and storage optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Summary */}
        <div className="mt-12 bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
          <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">Advanced Mobile Features Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-3">Core Capabilities</h4>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Location-based services with GPS integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Camera access and photo management
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Push notification system with smart scheduling
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Offline data caching and sync management
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-3">Technical Features</h4>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  IndexedDB for offline storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Service Worker for push notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Haptic feedback integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Permission management and status tracking
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Important Notes</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• These features require appropriate browser permissions</li>
                  <li>• Some capabilities may be limited on desktop browsers</li>
                  <li>• Test on actual mobile devices for best results</li>
                  <li>• Ensure HTTPS for production deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
