'use client';

import { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  BellIcon, 
  MoonIcon, 
  SunIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { tokens } from '@/components/tokens';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function SettingsPage() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem('poppin_offline_mode') === 'true';
    const savedNotifications = localStorage.getItem('poppin_notifications') !== 'false';
    const savedDarkMode = localStorage.getItem('poppin_dark_mode') !== 'false';
    const savedLanguage = localStorage.getItem('poppin_language') || 'en';
    const savedPrivacyMode = localStorage.getItem('poppin_privacy_mode') === 'true';
    const savedAutoSync = localStorage.getItem('poppin_auto_sync') !== 'false';

    setOfflineMode(savedOfflineMode);
    setNotifications(savedNotifications);
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
    setPrivacyMode(savedPrivacyMode);
    setAutoSync(savedAutoSync);
  }, []);

  // Save settings to localStorage when they change
  const updateSetting = (key: string, value: any) => {
    localStorage.setItem(`poppin_${key}`, value.toString());
  };

  const handleOfflineModeToggle = (enabled: boolean) => {
    setOfflineMode(enabled);
    updateSetting('offline_mode', enabled);
    
    if (enabled) {
      // Enable offline mode logic
      console.log('Offline mode enabled');
    } else {
      // Disable offline mode logic
      console.log('Offline mode disabled');
    }
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotifications(enabled);
    updateSetting('notifications', enabled);
    
    if (enabled) {
      // Request notification permissions
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    updateSetting('dark_mode', enabled);
    
    // Apply theme change
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateSetting('language', newLanguage);
  };

  const handlePrivacyModeToggle = (enabled: boolean) => {
    setPrivacyMode(enabled);
    updateSetting('privacy_mode', enabled);
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled);
    updateSetting('auto_sync', enabled);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Header */}
        <div className="relative z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </Link>
              
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))]">Settings</h1>
                <p className={`text-base sm:text-lg md:text-xl ${tokens.muted}`}>Customize your Poppin experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Offline Mode Section */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <WifiIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Offline Mode</h2>
              </div>
              <p className={`text-sm ${tokens.muted} mb-6`}>
                Enable offline mode to access saved events and data without an internet connection.
              </p>
              
              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-[rgb(var(--text))] text-sm">Offline Mode</h3>
                     <p className={`text-sm ${tokens.muted}`}>Access events offline</p>
                   </div>
                  <button
                    onClick={() => handleOfflineModeToggle(!offlineMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      offlineMode ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        offlineMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-[rgb(var(--text))] text-sm">Auto Sync</h3>
                     <p className={`text-sm ${tokens.muted}`}>Sync data when online</p>
                   </div>
                  <button
                    onClick={() => handleAutoSyncToggle(!autoSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSync ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BellIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Notifications</h2>
              </div>
              <p className={`text-sm ${tokens.muted} mb-6`}>
                Manage how and when you receive notifications about events and updates.
              </p>
              
                             <div className="flex items-center justify-between">
                 <div>
                   <h3 className="font-medium text-[rgb(var(--text))] text-sm">Push Notifications</h3>
                   <p className={`text-sm ${tokens.muted}`}>Receive event reminders and updates</p>
                 </div>
                <button
                  onClick={() => handleNotificationsToggle(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MoonIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Appearance</h2>
              </div>
              <p className={`text-sm ${tokens.muted} mb-6`}>
                Customize the look and feel of the app.
              </p>
              
              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-[rgb(var(--text))] text-sm">Dark Mode</h3>
                     <p className={`text-sm ${tokens.muted}`}>Use dark theme</p>
                   </div>
                  <button
                    onClick={() => handleDarkModeToggle(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Language
                  </label>
                                                        <select
                     value={language}
                     onChange={(e) => handleLanguageChange(e.target.value)}
                     className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                   >
                     <option value="en">English</option>
                     <option value="es">Español</option>
                     <option value="fr">Français</option>
                     <option value="de">Deutsch</option>
                     <option value="it">Italiano</option>
                     <option value="pt">Português</option>
                     <option value="zh-CN">中文 (简体)</option>
                   </select>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Privacy & Security</h2>
              </div>
              <p className={`text-sm ${tokens.muted} mb-6`}>
                Control your privacy settings and data sharing preferences.
              </p>
              
                             <div className="flex items-center justify-between">
                 <div>
                   <h3 className="font-medium text-[rgb(var(--text))] text-sm">Privacy Mode</h3>
                   <p className={`text-sm ${tokens.muted}`}>Limit data collection and tracking</p>
                 </div>
                <button
                  onClick={() => handlePrivacyModeToggle(!privacyMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacyMode ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Advanced Section */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cog6ToothIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Advanced</h2>
              </div>
              <p className={`text-sm ${tokens.muted} mb-6`}>
                Advanced settings for power users.
              </p>
              
              <div className="space-y-4">
                                 <button className="w-full px-4 py-3 text-left bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg))]/80 rounded-lg transition-colors">
                   <div className="font-medium text-[rgb(var(--text))] text-sm">Clear Cache</div>
                   <div className={`text-sm ${tokens.muted}`}>Free up storage space</div>
                 </button>
                
                                 <button className="w-full px-4 py-3 text-left bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg))]/80 rounded-lg transition-colors">
                   <div className="font-medium text-[rgb(var(--text))] text-sm">Export Data</div>
                   <div className={`text-sm ${tokens.muted}`}>Download your data</div>
                 </button>
                
                                 <button className="w-full px-4 py-3 text-left bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg))]/80 rounded-lg transition-colors">
                   <div className="font-medium text-[rgb(var(--text))] text-sm">Reset Settings</div>
                   <div className={`text-sm ${tokens.muted}`}>Restore default preferences</div>
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile navigation */}
                        <div className="pb-16 sm:pb-0"></div>
      </div>
    </ErrorBoundary>
  );
}
