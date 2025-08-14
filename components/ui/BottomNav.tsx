"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MapPinIcon, CalendarIcon, UserIcon } from "@heroicons/react/24/outline";

const items = [
  { href: "/",       label: "Home", icon: HomeIcon },
  { href: "/map",    label: "Map", icon: MapPinIcon },
  { href: "/events", label: "Events", icon: CalendarIcon },
  { href: "/account",label: "Account", icon: UserIcon },
];

export default function BottomNav(){
  const path = usePathname();
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[rgb(var(--bg))]/80 backdrop-blur token-border-t">
      <div className="max-w-6xl mx-auto px-2 flex justify-around h-14">
        {items.map((it) => {
          const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href} className="flex flex-col items-center justify-center w-20 hover:opacity-80 transition-opacity group h-14 pt-2 pb-1">
              <it.icon className={`w-5 h-5 mb-1 ${active ? 'text-[rgb(var(--text))]' : 'text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]'}`} />
              <span className={`text-sm font-medium ${active ? 'text-[rgb(var(--text))]' : 'text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]'}`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
