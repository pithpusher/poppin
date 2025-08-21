// Offline storage and background sync utilities
export class OfflineStorage {
  private dbName = 'PoppinOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores for offline data
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('pendingActions')) {
          const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          actionsStore.createIndex('type', 'type', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
      };
    });
  }

  // Store events for offline viewing
  async storeEvents(events: any[]) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    
    for (const event of events) {
      await store.put({
        ...event,
        timestamp: Date.now(),
        offline: true
      });
    }
  }

  // Get stored events
  async getStoredEvents(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store pending actions for background sync
  async storePendingAction(action: {
    type: 'create_event' | 'update_event' | 'delete_event' | 'favorite_event';
    data: any;
    timestamp?: number;
  }) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    
    await store.add({
      ...action,
      timestamp: action.timestamp || Date.now()
    });
  }

  // Get pending actions
  async getPendingActions(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove completed action
  async removePendingAction(id: number) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    await store.delete(id);
  }

  // Store user preferences
  async storePreference(key: string, value: any) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['userPreferences'], 'readwrite');
    const store = transaction.objectStore('userPreferences');
    
    await store.put({ key, value, timestamp: Date.now() });
  }

  // Get user preference
  async getPreference(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readonly');
      const store = transaction.objectStore('userPreferences');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear old offline data
  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    if (!this.db) await this.init();
    
    const cutoff = Date.now() - maxAge;
    
    // Clean up old events
    const eventsTransaction = this.db!.transaction(['events'], 'readwrite');
    const eventsStore = eventsTransaction.objectStore('events');
    const eventsIndex = eventsStore.index('timestamp');
    const eventsRequest = eventsIndex.openCursor(IDBKeyRange.upperBound(cutoff));
    
    eventsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    // Clean up old pending actions
    const actionsTransaction = this.db!.transaction(['pendingActions'], 'readwrite');
    const actionsStore = actionsTransaction.objectStore('pendingActions');
    const actionsIndex = actionsStore.index('timestamp');
    const actionsRequest = actionsIndex.openCursor(IDBKeyRange.upperBound(cutoff));
    
    actionsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Background sync manager
export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private isOnline = navigator.onLine;

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async syncPendingActions() {
    if (!this.isOnline) return;

    try {
      const pendingActions = await offlineStorage.getPendingActions();
      
      for (const action of pendingActions) {
        try {
          await this.performAction(action);
          await offlineStorage.removePendingAction(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action, error);
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async performAction(action: any) {
    switch (action.type) {
      case 'create_event':
        // Implement event creation logic
        break;
      case 'update_event':
        // Implement event update logic
        break;
      case 'delete_event':
        // Implement event deletion logic
        break;
      case 'favorite_event':
        // Implement favorite logic
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }
}

// Initialize background sync
export const backgroundSync = BackgroundSyncManager.getInstance();
