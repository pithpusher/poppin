"use client";
import clsx from "clsx";
export type Tab = { id: string; label: string };
export default function PillTabs({tabs,active,onChange}:{tabs:Tab[];active:string;onChange:(id:string)=>void;}){
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {tabs.map(t=>(
        <button
          key={t.id}
          onClick={()=>onChange(t.id)}
          className={clsx(
            "h-10 px-4 rounded-full border text-sm transition whitespace-nowrap",
            active===t.id
              ? "token-border bg-[rgb(var(--panel))] text-[rgb(var(--text))] shadow-card"
              : "token-border text-[rgb(var(--muted))] hover:bg-white/5"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
