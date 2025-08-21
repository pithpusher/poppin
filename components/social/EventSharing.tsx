'use client';

import React, { useState } from 'react';
import { 
  ShareIcon, 
  LinkIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface EventSharingProps {
  eventId: string;
  eventTitle: string;
  eventUrl: string;
  eventImage?: string;
  eventDescription?: string;
  className?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

export default function EventSharing({ 
  eventId, 
  eventTitle, 
  eventUrl, 
  eventImage, 
  eventDescription = "Check out this amazing event!",
  className = "" 
}: EventSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `${eventTitle} - ${eventDescription}`;
  const encodedUrl = encodeURIComponent(eventUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareOptions: ShareOption[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: ShareIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: ShareIcon,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: ShareIcon,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: ShareIcon,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: ShareIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        const url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: EnvelopeIcon,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const subject = encodeURIComponent(`Check out: ${eventTitle}`);
        const body = encodeURIComponent(`${eventDescription}\n\n${eventUrl}`);
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = url;
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: eventDescription,
          url: eventUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className={className}>
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
      >
        <ShareIcon className="w-4 h-4" />
        Share Event
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(var(--panel))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Share Event</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Event Preview */}
            <div className="bg-[rgb(var(--bg))] rounded-lg p-4 mb-4 border border-[rgb(var(--border-color))]/20">
              <h4 className="font-medium text-[rgb(var(--text))] mb-2">{eventTitle}</h4>
              <p className="text-sm text-[rgb(var(--muted))] mb-3">{eventDescription}</p>
              <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                <LinkIcon className="w-3 h-3" />
                {eventUrl}
              </div>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg text-white transition-colors",
                    option.color
                  )}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90"
                )}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]/20">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`Check out: ${eventTitle}`);
                    const body = encodeURIComponent(`${eventDescription}\n\n${eventUrl}`);
                    const url = `mailto:?subject=${subject}&body=${body}`;
                    window.location.href = url;
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => {
                    const text = `${eventTitle} - ${eventDescription} ${eventUrl}`;
                    if (navigator.share) {
                      navigator.share({ text });
                    } else {
                      copyToClipboard();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
