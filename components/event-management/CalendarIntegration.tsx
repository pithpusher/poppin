'use client';

import React, { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  BellIcon,
  ChevronDownIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CalendarIntegrationProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location?: string;
    organizer?: string;
    imageUrl?: string;
  };
  className?: string;
}

interface CalendarService {
  id: string;
  name: string;
  icon: string;
  url: string;
  supported: boolean;
}

interface ReminderOption {
  id: string;
  label: string;
  value: number;
  unit: 'minutes' | 'hours' | 'days';
}

export default function CalendarIntegration({ event, className = "" }: CalendarIntegrationProps) {
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>(['15']);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calendarServices: CalendarService[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '📅',
      url: 'https://calendar.google.com',
      supported: true
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '🍎',
      url: 'https://www.icloud.com/calendar',
      supported: true
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      icon: '📧',
      url: 'https://outlook.live.com/calendar',
      supported: true
    },
    {
      id: 'yahoo',
      name: 'Yahoo Calendar',
      icon: '📮',
      url: 'https://calendar.yahoo.com',
      supported: true
    }
  ];

  const reminderOptions: ReminderOption[] = [
    { id: '5', label: '5 minutes before', value: 5, unit: 'minutes' },
    { id: '15', label: '15 minutes before', value: 15, unit: 'minutes' },
    { id: '30', label: '30 minutes before', value: 30, unit: 'minutes' },
    { id: '60', label: '1 hour before', value: 1, unit: 'hours' },
    { id: '1440', label: '1 day before', value: 1, unit: 'days' },
    { id: '2880', label: '2 days before', value: 2, unit: 'days' }
  ];

  const formatDateForCalendar = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateGoogleCalendarUrl = (): string => {
    const startDate = formatDateForCalendar(event.startDate);
    const endDate = formatDateForCalendar(event.endDate);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description,
      location: event.location || '',
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateAppleCalendarUrl = (): string => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Poppin//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@poppin.com`,
      `DTSTAMP:${formatDateForCalendar(new Date().toISOString())}`,
      `DTSTART:${formatDateForCalendar(event.startDate)}`,
      `DTEND:${formatDateForCalendar(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location || ''}`,
      `ORGANIZER:${event.organizer || 'Poppin'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    return URL.createObjectURL(blob);
  };

  const generateOutlookUrl = (): string => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: event.description,
      location: event.location || ''
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateYahooUrl = (): string => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      desc: event.description,
      in_loc: event.location || '',
      st: startDate.toISOString(),
      dur: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)).toString()
    });

    return `https://calendar.yahoo.com/?${params.toString()}`;
  };

  const handleAddToCalendar = async (serviceId: string) => {
    setIsAddingToCalendar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let url = '';
      
      switch (serviceId) {
        case 'google':
          url = generateGoogleCalendarUrl();
          window.open(url, '_blank');
          break;
        case 'apple':
          url = generateAppleCalendarUrl();
          // For Apple Calendar, we'll download the .ics file
          const link = document.createElement('a');
          link.href = url;
          link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        case 'outlook':
          url = generateOutlookUrl();
          window.open(url, '_blank');
          break;
        case 'yahoo':
          url = generateYahooUrl();
          window.open(url, '_blank');
          break;
        default:
          throw new Error('Unsupported calendar service');
      }

      setSuccessMessage(`Event added to ${calendarServices.find(s => s.id === serviceId)?.name}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setErrorMessage('Failed to add event to calendar. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const toggleReminder = (reminderId: string) => {
    setSelectedReminders(prev => 
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  return (
    <div className={cn("bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-8 h-8 text-[rgb(var(--brand))]" />
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text))]">Add to Calendar</h2>
            <p className="text-[rgb(var(--muted))]">
              Add this event to your preferred calendar service
            </p>
          </div>
        </div>

        {/* Event Preview */}
        <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
          <h3 className="font-semibold text-[rgb(var(--text))] mb-2">{event.title}</h3>
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

      {/* Calendar Services */}
      <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Choose Calendar Service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {calendarServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleAddToCalendar(service.id)}
              disabled={!service.supported || isAddingToCalendar}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border transition-all",
                service.supported
                  ? "border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--brand))] hover:bg-[rgb(var(--brand))]/5 cursor-pointer"
                  : "border-[rgb(var(--border-color))]/10 bg-[rgb(var(--muted))]/20 cursor-not-allowed opacity-50"
              )}
            >
              <span className="text-2xl">{service.icon}</span>
              <div className="text-left">
                <div className="font-medium text-[rgb(var(--text))]">{service.name}</div>
                <div className="text-sm text-[rgb(var(--muted))]">
                  {service.supported ? 'Click to add event' : 'Coming soon'}
                </div>
              </div>
              {isAddingToCalendar && selectedCalendar === service.id && (
                <div className="ml-auto">
                  <div className="w-5 h-5 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder Options */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Event Reminders
          </h3>
          <button
            onClick={() => setShowReminderOptions(!showReminderOptions)}
            className="flex items-center gap-2 text-[rgb(var(--brand))] hover:text-[rgb(var(--brand))]/80 transition-colors"
          >
            <span className="text-sm">Customize</span>
            <ChevronDownIcon className={cn(
              "w-4 h-4 transition-transform",
              showReminderOptions ? "rotate-180" : ""
            )} />
          </button>
        </div>

        {showReminderOptions && (
          <div className="space-y-3 mb-4">
            {reminderOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReminders.includes(option.id)}
                  onChange={() => toggleReminder(option.id)}
                  className="w-4 h-4 text-[rgb(var(--brand))] bg-[rgb(var(--bg))] border-[rgb(var(--border-color))]/20 rounded focus:ring-[rgb(var(--brand))]/50 focus:ring-2"
                />
                <span className="text-[rgb(var(--text))]">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Quick Add with Default Reminders */}
        <div className="bg-[rgb(var(--bg))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[rgb(var(--text))]">Quick Add with Reminders</h4>
              <p className="text-sm text-[rgb(var(--muted))]">
                Add event with {selectedReminders.length} reminder{selectedReminders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => handleAddToCalendar('google')}
              disabled={isAddingToCalendar}
              className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCalendar ? 'Adding...' : 'Add to Google Calendar'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Google Calendar: Opens in a new tab for easy addition</li>
            <li>• Apple Calendar: Downloads an .ics file to import</li>
            <li>• Outlook: Opens the compose event page</li>
            <li>• Yahoo: Opens the add event form</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
