"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
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
    { href: '/', label: 'Home' },
    { href: '/map', label: 'Map' },
    { href: '/events/new', label: 'Post Event' },
    { href: '/organizer/apply', label: 'Host With Us' },
    { href: '/auth', label: 'Sign In' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/moderation', label: 'Moderation' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[rgb(var(--bg))] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-[rgb(var(--text))]" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-[rgb(var(--text))]" />
        )}
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[rgb(var(--panel))] token-border rounded-lg shadow-lg z-50 py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--text))] transition-colors ${
                pathname === item.href ? 'text-[rgb(var(--text))] font-medium bg-[rgb(var(--bg))]' : 'text-[rgb(var(--muted))]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
