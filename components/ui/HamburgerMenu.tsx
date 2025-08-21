"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { 
      href: '/', 
      label: 'Home', 
      icon: HomeIcon,
      description: 'Discover events near you'
    },
    { 
      href: '/map', 
      label: 'Map', 
      icon: MapPinIcon,
      description: 'View events on a map'
    },
    { 
      href: '/events', 
      label: 'Browse Events', 
      icon: CalendarIcon,
      description: 'Find upcoming events'
    },
    { 
      href: '/events/new', 
      label: 'Post Event', 
      icon: PlusIcon,
      description: 'Create a new event',
      highlight: true
    },
    { 
      href: '/organizer/apply', 
      label: 'Host With Us', 
      icon: UserGroupIcon,
      description: 'Become an event organizer'
    },
    { 
      href: '/account', 
      label: 'My Account', 
      icon: UserIcon,
      description: 'Manage your profile'
    },
    { 
      href: '/pricing', 
      label: 'Pricing', 
      icon: CurrencyDollarIcon,
      description: 'View plans and pricing'
    },
    { 
      href: '/auth', 
      label: 'Sign In', 
      icon: ArrowRightOnRectangleIcon,
      description: 'Access your account'
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[rgb(var(--bg))] transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-[rgb(var(--text))] transition-transform duration-200 rotate-90" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-[rgb(var(--text))] transition-transform duration-200" />
        )}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[70]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Dropdown */}
          <div className="absolute top-full right-0 mt-3 w-80 bg-[rgb(var(--panel))] token-border rounded-2xl shadow-2xl z-[80] overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-6 py-3 border-b border-[rgb(var(--border-color))]/20">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">Menu</h3>
              <p className="text-xs text-[rgb(var(--muted))] mt-0.5">Navigate and manage your account</p>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-6 py-2.5 transition-all duration-200 hover:bg-[rgb(var(--bg))] group ${
                      isActive 
                        ? 'bg-[rgb(var(--brand))]/10 border-r-2 border-[rgb(var(--brand))]' 
                        : 'hover:border-r-2 hover:border-[rgb(var(--muted))]/30'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isActive 
                          ? 'bg-[rgb(var(--brand))] text-white' 
                          : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))] group-hover:bg-[rgb(var(--brand))] group-hover:text-white'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm transition-colors duration-200 ${
                          isActive 
                            ? 'text-[rgb(var(--brand))]' 
                            : 'text-[rgb(var(--text))] group-hover:text-[rgb(var(--text))]'
                        }`}>
                          {item.label}
                          {item.highlight && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--brand))] text-white">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))] mt-0.5 truncate">
                          {item.description}
                        </div>
                      </div>
                      
                      <div className={`flex-shrink-0 transition-transform duration-200 ${
                        isActive ? 'text-[rgb(var(--brand))]' : 'text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]'
                      }`}>
                        <ArrowRightOnRectangleIcon className="w-4 h-4 rotate-180" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-[rgb(var(--border-color))]/20 bg-[rgb(var(--bg))]/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[rgb(var(--muted))]">Poppin v1.0</span>
                <span className="text-[rgb(var(--muted))]">Made for your city</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
