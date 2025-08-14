use client;
import Link from nextlink;
import { usePathname } from nextnavigation;

const items = [
  { href ,       label Home,  icon i-mdi-home-variant },
  { href map,    label Map,   icon i-mdi-map },
  { href events, label Events,icon i-mdi-calendar },
  { href account,label Account,icon i-mdi-account-circle },
];

export default function BottomNav(){
  const path = usePathname();
  return (
    nav className=fixed bottom-0 inset-x-0 z-50 bg-[rgb(var(--panel))]95 backdrop-blur border-t border-[rgb(var(--border-color))]
      div className=max-w-6xl mx-auto px-2 flex justify-around h-14
        {items.map(it={
          const active = path===it.href  (it.href!== && path.startsWith(it.href));
          return (
            Link key={it.href} href={it.href} className=flex flex-col items-center justify-center gap-0.5 w-20
              span className={`${it.icon} ${active'text-brand''text-[rgb(var(--muted))]'} w-6 h-6`} 
              span className={`text-[11px] ${active'text-[rgb(var(--text))]''text-[rgb(var(--muted))]'}`}{it.label}span
            Link
          );
        })}
      div
    nav
  );
}
