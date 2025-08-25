"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MapPinIcon, PlusIcon, CalendarIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const [pathname, setPathname] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const actualPathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    setPathname(actualPathname);
  }, [actualPathname]);

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      current: pathname === '/'
    },
    {
      name: 'Map',
      href: '/map',
      icon: MapPinIcon,
      current: pathname === '/map'
    },
    {
      name: 'Post',
      href: '/post',
      icon: PlusIcon,
      current: pathname === '/post'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarIcon,
      current: pathname === '/calendar'
    },
    {
      name: 'Organizers',
      href: '/organizers',
      icon: UserGroupIcon,
      current: pathname === '/organizers'
    }
  ];

  // Don't render navigation items until client-side to prevent SSR issues
  if (!isClient) {
    return (
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[rgb(var(--bg))] backdrop-blur-md border-t border-[rgb(var(--border-color))]/20 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-2 flex justify-around h-14">
          {/* Loading state during SSR */}
        </div>
      </nav>
    );
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[rgb(var(--bg))] backdrop-blur-md border-t border-[rgb(var(--border-color))]/20 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-2 flex justify-around h-14">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-20 hover:opacity-80 transition-opacity group h-14 pt-2 pb-1 ${item.current ? 'text-[rgb(var(--text))]' : 'text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]'}`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
