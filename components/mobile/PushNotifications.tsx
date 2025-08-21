'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BellIcon, BellSlashIcon, BellAlertIcon, ClockIcon, MapPinIcon, XMarkIcon, CheckIcon, CogIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface NotificationSettings {
  eventReminders: boolean;
  nearbyEvents: boolean;
  trendingEvents: boolean;
  priceAlerts: boolean;
  reminderTime: number; // minutes before event
  nearbyRadius: number; // miles
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

interface PushNotificationsProps {
  onNotificationClick?: (notification: NotificationData) => void;
  onSettingsChange?: (settings: NotificationSettings) => void;
  enableNotifications?: boolean;
  className?: string;
}

export default function PushNotifications({
  onNotificationClick,
  onSettingsChange,
  enableNotifications = true,
  className = ""
}: PushNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    eventReminders: true,
    nearbyEvents: true,
    trendingEvents: false,
    priceAlerts: false,
    reminderTime: 30,
    nearbyRadius: 5,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: true
  });
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced haptic feedback for notification events
  const triggerHaptic = useCallback((type: 'notification' | 'success' | 'error' = 'notification') => {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'notification':
        navigator.vibrate([100, 50, 100]);
        break;
      case 'success':
        navigator.vibrate([20, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([200, 100, 200]);
        break;
    }
  }, []);

  // Check notification support and permission
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      serviceWorkerRef.current = registration;
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported in this browser');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await registerServiceWorker();
        return true;
      } else {
        setError('Notification permission denied');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permission';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registerServiceWorker]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (permission !== 'granted' || !serviceWorkerRef.current) {
      throw new Error('Permission not granted or service worker not ready');
    }

    try {
      const subscription = await serviceWorkerRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      setSubscription(subscription);
      setIsSubscribed(true);
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      triggerHaptic('success');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [permission, triggerHaptic]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      setError('Failed to unsubscribe from notifications');
    }
  }, [subscription, triggerHaptic]);

  // Send local notification
  const sendLocalNotification = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    if (permission !== 'granted') return;

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.split(':')[0]) * 60 + parseInt(settings.quietHours.start.split(':')[1]);
      const endTime = parseInt(settings.quietHours.end.split(':')[0]) * 60 + parseInt(settings.quietHours.end.split(':')[1]);
      
      if (currentTime >= startTime || currentTime <= endTime) {
        return; // Quiet hours active
      }
    }

    const notificationData: NotificationData = {
      ...notification,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    // Add to local notifications
    setNotifications(prev => [notificationData, ...prev]);

    // Send browser notification
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge,
      tag: notification.tag,
      data: notification.data,
      requireInteraction: false,
      silent: !settings.soundEnabled
    });

    // Handle notification click
    browserNotification.onclick = () => {
      onNotificationClick?.(notificationData);
      browserNotification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);

    // Haptic feedback
    if (settings.vibrationEnabled) {
      triggerHaptic('notification');
    }

    return notificationData;
  }, [permission, settings, onNotificationClick, triggerHaptic]);

  // Schedule event reminder
  const scheduleEventReminder = useCallback((event: any, reminderMinutes: number = settings.reminderTime) => {
    if (!settings.eventReminders) return;

    const eventTime = new Date(event.start_at);
    const reminderTime = new Date(eventTime.getTime() - reminderMinutes * 60 * 1000);
    const now = new Date();
    
    if (reminderTime <= now) return; // Event already passed

    const delay = reminderTime.getTime() - now.getTime();
    
    // Clear existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // Schedule reminder
    notificationTimeoutRef.current = setTimeout(() => {
      sendLocalNotification({
        title: 'Event Reminder',
        body: `${event.title} starts in ${reminderMinutes} minutes`,
        icon: event.image_url || '/favicon.ico',
        tag: `event_reminder_${event.id}`,
        data: { eventId: event.id, type: 'reminder' },
        actionUrl: `/event/${event.id}`
      });
    }, delay);
  }, [settings.eventReminders, settings.reminderTime, sendLocalNotification]);

  // Check for nearby events
  const checkNearbyEvents = useCallback(async (userLocation: { lat: number; lng: number }) => {
    if (!settings.nearbyEvents) return;

    try {
      // This would typically call your API to get nearby events
      const response = await fetch(`/api/events/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${settings.nearbyRadius}`);
      const nearbyEvents = await response.json();

      if (nearbyEvents.length > 0) {
        sendLocalNotification({
          title: 'Nearby Events',
          body: `${nearbyEvents.length} events happening near you`,
          icon: '/favicon.ico',
          tag: 'nearby_events',
          data: { events: nearbyEvents, type: 'nearby' },
          actionUrl: '/map'
        });
      }
    } catch (error) {
      console.error('Failed to check nearby events:', error);
    }
  }, [settings.nearbyEvents, settings.nearbyRadius, sendLocalNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  }, [settings, onSettingsChange]);

  // Initialize component
  useEffect(() => {
    if (permission === 'granted' && !serviceWorkerRef.current) {
      registerServiceWorker();
    }
  }, [permission, registerServiceWorker]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getUnreadCount = () => notifications.filter(n => !n.read).length;

  if (!enableNotifications) {
    return null;
  }

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
          Push Notifications
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Permission Status */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${permission === 'granted' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : permission === 'denied'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }
          `}>
            {permission === 'granted' ? 'Granted' : 
             permission === 'denied' ? 'Denied' : 'Prompt'}
          </div>
          
          {/* Unread Count */}
          {getUnreadCount() > 0 && (
            <div className="px-2 py-1 bg-[rgb(var(--brand))] text-white rounded-full text-xs font-medium">
              {getUnreadCount()}
            </div>
          )}
        </div>
      </div>

      {/* Permission Request */}
      {permission === 'default' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <BellAlertIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Enable Notifications</span>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            Get notified about events, reminders, and nearby activities.
          </p>
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Requesting...' : 'Enable'}
          </button>
        </div>
      )}

      {/* Subscription Controls */}
      {permission === 'granted' && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isSubscribed
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSubscribed ? (
              <>
                <BellSlashIcon className="w-4 h-4" />
                Unsubscribe
              </>
            ) : (
              <>
                <BellIcon className="w-4 h-4" />
                Subscribe
              </>
            )}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
          >
            <CogIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
          <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-3">Notification Settings</h4>
          
          <div className="space-y-3">
            {/* Notification Types */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.eventReminders}
                  onChange={(e) => updateSettings({ eventReminders: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Event Reminders</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.nearbyEvents}
                  onChange={(e) => updateSettings({ nearbyEvents: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Nearby Events</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.trendingEvents}
                  onChange={(e) => updateSettings({ trendingEvents: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Trending Events</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.priceAlerts}
                  onChange={(e) => updateSettings({ priceAlerts: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Price Alerts</span>
              </label>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm text-[rgb(var(--text))] mb-1">
                Reminder Time (minutes before event)
              </label>
              <select
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 text-sm"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={1440}>1 day</option>
              </select>
            </div>

            {/* Nearby Radius */}
            <div>
              <label className="block text-sm text-[rgb(var(--text))] mb-1">
                Nearby Events Radius (miles)
              </label>
              <select
                value={settings.nearbyRadius}
                onChange={(e) => updateSettings({ nearbyRadius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 text-sm"
              >
                <option value={1}>1 mile</option>
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>

            {/* Quiet Hours */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) => updateSettings({ 
                    quietHours: { ...settings.quietHours, enabled: e.target.checked }
                  })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Quiet Hours</span>
              </label>
              
              {settings.quietHours.enabled && (
                <div className="flex items-center gap-2 ml-6">
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateSettings({
                      quietHours: { ...settings.quietHours, start: e.target.value }
                    })}
                    className="px-2 py-1 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded border border-[rgb(var(--border-color))]/20 text-sm"
                  />
                  <span className="text-sm text-[rgb(var(--muted))]">to</span>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateSettings({
                      quietHours: { ...settings.quietHours, end: e.target.value }
                    })}
                    className="px-2 py-1 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded border border-[rgb(var(--border-color))]/20 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Sound & Vibration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Sound</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                  className="rounded border-[rgb(var(--border-color))]/20"
                />
                <span className="text-sm text-[rgb(var(--text))]">Vibration</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[rgb(var(--text))]">Recent Notifications</h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`
                  p-3 rounded-lg border transition-colors cursor-pointer
                  ${notification.read
                    ? 'bg-[rgb(var(--bg))] border-[rgb(var(--border-color))]/20'
                    : 'bg-blue-50 border-blue-200'
                  }
                  hover:bg-[rgb(var(--bg))]/80
                `}
                onClick={() => {
                  markAsRead(notification.id);
                  onNotificationClick?.(notification);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-[rgb(var(--text))]">
                        {notification.title}
                      </h5>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(var(--muted))] mb-2">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                      <ClockIcon className="w-3 h-3" />
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-1 hover:bg-[rgb(var(--bg))] rounded transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3 text-[rgb(var(--muted))]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block w-4 h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[rgb(var(--muted))]">Processing...</span>
        </div>
      )}
    </div>
  );
}
