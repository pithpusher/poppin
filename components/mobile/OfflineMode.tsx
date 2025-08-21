'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WifiIcon, WifiIcon as WifiOffIcon, CloudArrowUpIcon, CloudArrowDownIcon, ArrowPathIcon, CheckIcon, ExclamationTriangleIcon, TrashIcon, DatabaseIcon } from '@heroicons/react/24/outline';

interface CacheStats {
  events: number;
  images: number;
  userData: number;
  totalSize: number;
  lastSync: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAttempt: number;
  syncErrors: string[];
  pendingChanges: number;
}

interface OfflineModeProps {
  onCacheUpdate?: (stats: CacheStats) => void;
  onSyncComplete?: (status: SyncStatus) => void;
  enableOfflineMode?: boolean;
  maxCacheSize?: number; // MB
  className?: string;
}

export default function OfflineMode({
  onCacheUpdate,
  onSyncComplete,
  enableOfflineMode = true,
  maxCacheSize = 100,
  className = ""
}: OfflineModeProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    events: 0,
    images: 0,
    userData: 0,
    totalSize: 0,
    lastSync: 0
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncAttempt: 0,
    syncErrors: [],
    pendingChanges: 0
  });
  
  const [showCacheDetails, setShowCacheDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced haptic feedback for offline events
  const triggerHaptic = useCallback((type: 'sync' | 'error' | 'success' = 'sync') => {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'sync':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 200, 100]);
        break;
      case 'success':
        navigator.vibrate([20, 50, 20]);
        break;
    }
  }, []);

  // Check online status
  const checkOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    setSyncStatus(prev => ({ ...prev, isOnline: online }));
    
    if (online && !syncStatus.isSyncing) {
      // Auto-sync when coming back online
      setTimeout(() => {
        syncData();
      }, 1000);
    }
  }, [syncStatus.isSyncing]);

  // Initialize IndexedDB
  const initDatabase = useCallback(async () => {
    try {
      if (!('indexedDB' in window)) {
        throw new Error('IndexedDB not supported');
      }

      const dbName = 'PoppinOfflineDB';
      const dbVersion = 1;
      
      const request = indexedDB.open(dbName, dbVersion);
      
      request.onerror = () => {
        throw new Error('Failed to open IndexedDB');
      };
      
      request.onsuccess = () => {
        const db = request.result;
        console.log('IndexedDB initialized successfully');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('category', 'category', { unique: false });
          eventsStore.createIndex('date', 'start_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'url' });
          imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userData')) {
          const userDataStore = db.createObjectStore('userData', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('pendingChanges')) {
          const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('type', 'type', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      setError('Offline storage not available');
    }
  }, []);

  // Cache event data
  const cacheEvent = useCallback(async (event: any) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      await store.put({
        ...event,
        cachedAt: Date.now(),
        lastAccessed: Date.now()
      });
      
      updateCacheStats();
    } catch (error) {
      console.error('Failed to cache event:', error);
    }
  }, []);

  // Cache image
  const cacheImage = useCallback(async (url: string, blob: Blob) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      await store.put({
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size
      });
      
      updateCacheStats();
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }, []);

  // Get cached event
  const getCachedEvent = useCallback(async (id: string) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      
      const event = await store.get(id);
      if (event) {
        // Update last accessed time
        const updateTransaction = db.transaction(['events'], 'readwrite');
        const updateStore = updateTransaction.objectStore('events');
        event.lastAccessed = Date.now();
        await updateStore.put(event);
      }
      
      return event;
    } catch (error) {
      console.error('Failed to get cached event:', error);
      return null;
    }
  }, []);

  // Get cached image
  const getCachedImage = useCallback(async (url: string) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      const image = await store.get(url);
      return image?.blob ? URL.createObjectURL(image.blob) : null;
    } catch (error) {
      console.error('Failed to get cached image:', error);
      return null;
    }
  }, []);

  // Add pending change
  const addPendingChange = useCallback(async (change: any) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      
      await store.add({
        ...change,
        timestamp: Date.now()
      });
      
      setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    } catch (error) {
      console.error('Failed to add pending change:', error);
    }
  }, []);

  // Open database connection
  const openDatabase = useCallback(async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PoppinOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, []);

  // Update cache statistics
  const updateCacheStats = useCallback(async () => {
    try {
      const db = await openDatabase();
      
      // Count events
      const eventsTransaction = db.transaction(['events'], 'readonly');
      const eventsStore = eventsTransaction.objectStore('events');
      const eventsCount = await eventsStore.count();
      
      // Count images
      const imagesTransaction = db.transaction(['images'], 'readonly');
      const imagesStore = imagesTransaction.objectStore('images');
      const imagesCount = await imagesStore.count();
      
      // Count user data
      const userDataTransaction = db.transaction(['userData'], 'readonly');
      const userDataStore = userDataTransaction.objectStore('userData');
      const userDataCount = await userDataStore.count();
      
      // Calculate total size
      let totalSize = 0;
      
      // Get events size
      const eventsCursor = await eventsStore.openCursor();
      while (eventsCursor) {
        totalSize += JSON.stringify(eventsCursor.value).length;
        await eventsCursor.continue();
      }
      
      // Get images size
      const imagesCursor = await imagesStore.openCursor();
      while (imagesCursor) {
        totalSize += imagesCursor.value.size || 0;
        await imagesCursor.continue();
      }
      
      const stats: CacheStats = {
        events: eventsCount,
        images: imagesCount,
        userData: userDataCount,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
        lastSync: Date.now()
      };
      
      setCacheStats(stats);
      onCacheUpdate?.(stats);
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }, [onCacheUpdate, openDatabase]);

  // Sync data with server
  const syncData = useCallback(async () => {
    if (!isOnline || syncStatus.isSyncing) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      
      // Get pending changes
      const db = await openDatabase();
      const transaction = db.transaction(['pendingChanges'], 'readonly');
      const store = transaction.objectStore('pendingChanges');
      const pendingChanges = await store.getAll();
      
      if (pendingChanges.length === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncAttempt: Date.now() }));
        return;
      }
      
      // Process pending changes
      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'event_like':
              await fetch('/api/events/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(change.data)
              });
              break;
              
            case 'event_save':
              await fetch('/api/events/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(change.data)
              });
              break;
              
            case 'search_save':
              await fetch('/api/searches/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(change.data)
              });
              break;
              
            default:
              console.warn('Unknown change type:', change.type);
          }
          
          // Remove processed change
          const deleteTransaction = db.transaction(['pendingChanges'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('pendingChanges');
          await deleteStore.delete(change.id);
          
        } catch (error) {
          console.error('Failed to sync change:', change, error);
          setSyncStatus(prev => ({
            ...prev,
            syncErrors: [...prev.syncErrors, `Failed to sync ${change.type}: ${error}`]
          }));
        }
      }
      
      // Update sync status
      const newStatus: SyncStatus = {
        isOnline: true,
        isSyncing: false,
        lastSyncAttempt: Date.now(),
        syncErrors: [],
        pendingChanges: 0
      };
      
      setSyncStatus(newStatus);
      onSyncComplete?.(newStatus);
      triggerHaptic('success');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setError(errorMessage);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSyncAttempt: Date.now() }));
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, syncStatus.isSyncing, onSyncComplete, triggerHaptic, openDatabase]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const db = await openDatabase();
      
      // Clear all stores
      const stores = ['events', 'images', 'userData', 'pendingChanges'];
      for (const storeName of stores) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      }
      
      // Update stats
      await updateCacheStats();
      
      // Reset sync status
      setSyncStatus(prev => ({ ...prev, pendingChanges: 0, syncErrors: [] }));
      
      triggerHaptic('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cache';
      setError(errorMessage);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [updateCacheStats, triggerHaptic, openDatabase]);

  // Preload essential data
  const preloadData = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      // Preload popular events
      const eventsResponse = await fetch('/api/events/popular?limit=20');
      const events = await eventsResponse.json();
      
      for (const event of events) {
        await cacheEvent(event);
        
        // Preload event image if available
        if (event.image_url) {
          try {
            const imageResponse = await fetch(event.image_url);
            const imageBlob = await imageResponse.blob();
            await cacheImage(event.image_url, imageBlob);
          } catch (error) {
            console.warn('Failed to preload image:', event.image_url);
          }
        }
      }
      
      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to preload data:', error);
    }
  }, [isOnline, cacheEvent, cacheImage, triggerHaptic]);

  // Initialize component
  useEffect(() => {
    initDatabase();
    checkOnlineStatus();
    
    // Set up event listeners
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    // Set up intervals
    cacheUpdateIntervalRef.current = setInterval(updateCacheStats, 30000); // Update every 30 seconds
    syncIntervalRef.current = setInterval(() => {
      if (isOnline && !syncStatus.isSyncing) {
        syncData();
      }
    }, 60000); // Sync every minute when online
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      
      if (cacheUpdateIntervalRef.current) {
        clearInterval(cacheUpdateIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [initDatabase, checkOnlineStatus, updateCacheStats, syncData, isOnline, syncStatus.isSyncing]);

  // Auto-preload when coming online
  useEffect(() => {
    if (isOnline && !isLoading) {
      setTimeout(preloadData, 2000); // Wait 2 seconds after coming online
    }
  }, [isOnline, isLoading, preloadData]);

  const formatFileSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!enableOfflineMode) {
    return null;
  }

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
          {isOnline ? (
            <WifiIcon className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOffIcon className="w-5 h-5 text-red-500" />
          )}
          Offline Mode
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Online Status */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${isOnline 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
            }
          `}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          {/* Pending Changes */}
          {syncStatus.pendingChanges > 0 && (
            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">
              {syncStatus.pendingChanges}
            </div>
          )}
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="mb-4 p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-[rgb(var(--text))]">Cache Statistics</h4>
          <button
            onClick={() => setShowCacheDetails(!showCacheDetails)}
            className="text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            {showCacheDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[rgb(var(--muted))]">Events:</span>
            <span className="ml-2 text-[rgb(var(--text))] font-medium">{cacheStats.events}</span>
          </div>
          <div>
            <span className="text-[rgb(var(--muted))]">Images:</span>
            <span className="ml-2 text-[rgb(var(--text))] font-medium">{cacheStats.images}</span>
          </div>
          <div>
            <span className="text-[rgb(var(--muted))]">Size:</span>
            <span className="ml-2 text-[rgb(var(--text))] font-medium">{formatFileSize(cacheStats.totalSize)}</span>
          </div>
          <div>
            <span className="text-[rgb(var(--muted))]">Last Sync:</span>
            <span className="ml-2 text-[rgb(var(--text))] font-medium">{formatTimestamp(cacheStats.lastSync)}</span>
          </div>
        </div>
        
        {/* Cache Usage Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))] mb-1">
            <span>Cache Usage</span>
            <span>{Math.round((cacheStats.totalSize / maxCacheSize) * 100)}%</span>
          </div>
          <div className="w-full bg-[rgb(var(--bg))] rounded-full h-2 border border-[rgb(var(--border-color))]/20">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                cacheStats.totalSize / maxCacheSize > 0.8 
                  ? 'bg-red-500' 
                  : cacheStats.totalSize / maxCacheSize > 0.6 
                    ? 'bg-yellow-500' 
                    : 'bg-[rgb(var(--brand))]'
              }`}
              style={{ width: `${Math.min((cacheStats.totalSize / maxCacheSize) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cache Details */}
      {showCacheDetails && (
        <div className="mb-4 p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
          <h5 className="text-sm font-medium text-[rgb(var(--text))] mb-2">Detailed Cache Info</h5>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Events Cache:</span>
              <span className="text-[rgb(var(--text))]">{cacheStats.events} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Images Cache:</span>
              <span className="text-[rgb(var(--text))]">{cacheStats.images} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">User Data:</span>
              <span className="text-[rgb(var(--text))]">{cacheStats.userData} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Total Cache Size:</span>
              <span className="text-[rgb(var(--text))]">{formatFileSize(cacheStats.totalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Max Cache Size:</span>
              <span className="text-[rgb(var(--text))]">{formatFileSize(maxCacheSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="mb-4 p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20">
        <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-2">Sync Status</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))]">Status:</span>
            <span className={`font-medium ${
              syncStatus.isSyncing ? 'text-yellow-600' : 
              syncStatus.pendingChanges > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {syncStatus.isSyncing ? 'Syncing...' : 
               syncStatus.pendingChanges > 0 ? `${syncStatus.pendingChanges} pending` : 'Up to date'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))]">Last Sync:</span>
            <span className="text-[rgb(var(--text))]">{formatTimestamp(syncStatus.lastSyncAttempt)}</span>
          </div>
          
          {syncStatus.syncErrors.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <div className="text-red-800 font-medium mb-1">Sync Errors:</div>
              {syncStatus.syncErrors.slice(0, 3).map((error, index) => (
                <div key={index} className="text-red-700">{error}</div>
              ))}
              {syncStatus.syncErrors.length > 3 && (
                <div className="text-red-600">...and {syncStatus.syncErrors.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={syncData}
          disabled={!isOnline || syncStatus.isSyncing || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncStatus.isSyncing ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="w-4 h-4" />
              Sync Now
            </>
          )}
        </button>
        
        <button
          onClick={preloadData}
          disabled={!isOnline || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg font-medium hover:bg-[rgb(var(--bg))]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloudArrowDownIcon className="w-4 h-4" />
          Preload
        </button>
        
        <button
          onClick={clearCache}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            Some features may be limited. Your changes will be synced when you're back online.
          </p>
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
