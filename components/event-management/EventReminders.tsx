'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  CogIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface EventRemindersProps {
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    organizer?: string;
  };
  className?: string;
}

interface Reminder {
  id: string;
  type: 'time' | 'location' | 'custom';
  title: string;
  message: string;
  triggerTime: number; // minutes before event
  triggerType: 'notification' | 'email' | 'sms' | 'push';
  enabled: boolean;
  customMessage?: string;
}

interface ReminderTemplate {
  id: string;
  name: string;
  time: number;
  description: string;
  icon: string;
}

export default function EventReminders({ event, className = "" }: EventRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'time',
    triggerType: 'notification',
    enabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reminderTemplates: ReminderTemplate[] = [
    { id: '5min', name: '5 minutes before', time: 5, description: 'Quick reminder', icon: '⏰' },
    { id: '15min', name: '15 minutes before', time: 15, description: 'Standard reminder', icon: '⏱️' },
    { id: '30min', name: '30 minutes before', time: 30, description: 'Early reminder', icon: '⏲️' },
    { id: '1hour', name: '1 hour before', time: 60, description: 'Hourly reminder', icon: '🕐' },
    { id: '1day', name: '1 day before', time: 1440, description: 'Daily reminder', icon: '📅' },
    { id: '1week', name: '1 week before', time: 10080, description: 'Weekly reminder', icon: '📆' }
  ];

  // Initialize with default reminders
  useEffect(() => {
    const defaultReminders: Reminder[] = [
      {
        id: 'default-15',
        type: 'time',
        title: 'Event Starting Soon',
        message: `${event.title} starts in 15 minutes`,
        triggerTime: 15,
        triggerType: 'notification',
        enabled: true
      },
      {
        id: 'default-1hour',
        type: 'time',
        title: 'Event Reminder',
        message: `${event.title} starts in 1 hour`,
        triggerTime: 60,
        triggerType: 'notification',
        enabled: true
      }
    ];
    setReminders(defaultReminders);
  }, [event.title]);

  const addReminderFromTemplate = (template: ReminderTemplate) => {
    const reminder: Reminder = {
      id: `template-${Date.now()}`,
      type: 'time',
      title: `Event Reminder`,
      message: `${event.title} starts in ${template.name}`,
      triggerTime: template.time,
      triggerType: 'notification',
      enabled: true
    };
    
    setReminders(prev => [...prev, reminder]);
    setSuccessMessage(`Added ${template.name} reminder`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const addCustomReminder = async () => {
    if (!newReminder.title || !newReminder.message || newReminder.triggerTime === undefined) {
      setErrorMessage('Please fill in all required fields');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reminder: Reminder = {
        id: `custom-${Date.now()}`,
        type: newReminder.type || 'time',
        title: newReminder.title,
        message: newReminder.message,
        triggerTime: newReminder.triggerTime || 15,
        triggerType: newReminder.triggerType || 'notification',
        enabled: newReminder.enabled !== false,
        customMessage: newReminder.customMessage
      };
      
      setReminders(prev => [...prev, reminder]);
      setNewReminder({
        type: 'time',
        triggerType: 'notification',
        enabled: true
      });
      setShowAddForm(false);
      setSuccessMessage('Custom reminder added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to add reminder. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReminder = (reminderId: string) => {
    setReminders(prev => 
      prev.map(r => 
        r.id === reminderId ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    setSuccessMessage('Reminder deleted successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatReminderTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} before`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} before`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} before`;
    }
  };

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case 'notification': return '🔔';
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'push': return '📲';
      default: return '🔔';
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'notification': return 'In-app';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'push': return 'Push';
      default: return 'In-app';
    }
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center gap-3 mb-4">
          <BellIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text))]">Event Reminders</h2>
            <p className="text-[rgb(var(--muted))]">
              Set up customizable reminders for {event.title}
            </p>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))]">
                {formatEventDate(event.startDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))]">
                {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                <span className="text-[rgb(var(--muted))]">{event.location}</span>
              </div>
            )}
            {event.organizer && (
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                <span className="text-[rgb(var(--muted))]">{event.organizer}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg mx-6 mb-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckIcon className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-lg mx-6 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Add Templates */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Quick Add Reminders</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {reminderTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => addReminderFromTemplate(template)}
              className="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--brand))] hover:bg-[rgb(var(--brand))]/5 transition-all"
            >
              <span className="text-2xl">{template.icon}</span>
              <div className="text-center">
                <div className="font-medium text-[rgb(var(--text))] text-sm">{template.name}</div>
                <div className="text-xs text-[rgb(var(--muted))]">{template.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reminder Form */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Custom Reminder
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Custom'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Reminder Title
                </label>
                <input
                  type="text"
                  value={newReminder.title || ''}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Event Starting Soon"
                  className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Trigger Time (minutes before)
                </label>
                <input
                  type="number"
                  value={newReminder.triggerTime || ''}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, triggerTime: parseInt(e.target.value) }))}
                  placeholder="15"
                  min="1"
                  className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                Reminder Message
              </label>
              <textarea
                value={newReminder.message || ''}
                onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                placeholder="e.g., Don't forget about the event!"
                rows={3}
                className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Reminder Type
                </label>
                <select
                  value={newReminder.triggerType || 'notification'}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, triggerType: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="notification">In-app Notification</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newReminder.enabled !== false}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-[rgb(var(--brand))] bg-[rgb(var(--bg))] border-[rgb(var(--border-color))]/20 rounded focus:ring-[rgb(var(--brand))]/50 focus:ring-2"
                  />
                  <span className="text-sm text-[rgb(var(--text))]">Enable immediately</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomReminder}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Add Reminder
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Reminders */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">
          Active Reminders ({reminders.filter(r => r.enabled).length})
        </h3>
        
        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4 opacity-50" />
            <p className="text-lg text-[rgb(var(--text))] mb-2">No reminders set</p>
            <p className="text-[rgb(var(--muted))]">
              Add quick reminders or create custom ones to stay on top of your events
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  reminder.enabled
                    ? "border-[rgb(var(--border-color))]/20 bg-[rgb(var(--bg))]"
                    : "border-[rgb(var(--border-color))]/10 bg-[rgb(var(--muted))]/20 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTriggerTypeIcon(reminder.triggerType)}</span>
                    <div>
                      <div className="font-medium text-[rgb(var(--text))]">{reminder.title}</div>
                      <div className="text-sm text-[rgb(var(--muted))]">
                        {formatReminderTime(reminder.triggerTime)} • {getTriggerTypeLabel(reminder.triggerType)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full transition-colors",
                      reminder.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-[rgb(var(--muted))] text-[rgb(var(--text))]"
                    )}
                  >
                    {reminder.enabled ? 'Active' : 'Inactive'}
                  </button>
                  
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete reminder"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
