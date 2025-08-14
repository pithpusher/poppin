// ==============================
// FILE: components/map/FilterBar.tsx
// (presets + custom date range + Free toggle)
// ==============================
"use client";

import { Chip } from "@/components/ui/Chip";
import { useId } from "react";

export type Range = "today" | "week" | "30" | "all" | "custom";

type Props = {
  range: Range;
  setRange: (r: Range) => void;
  onlyFree: boolean;
  setOnlyFree: (v: boolean) => void;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
  setStartDate: (v: string | null) => void;
  setEndDate: (v: string | null) => void;
  onApplyCustom: () => void;
};

export function FilterBar({
  range, setRange, onlyFree, setOnlyFree,
  startDate, endDate, setStartDate, setEndDate, onApplyCustom
}: Props) {
  const startId = useId();
  const endId = useId();

  return (
<div className="sticky top-0 z-10 bg-[rgb(var(--panel))]/90 backdrop-blur border-b border-[color:var(--border-color)]">
  <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
        <Chip active={range === "today"} onClick={() => setRange("today")}>Today</Chip>
        <Chip active={range === "week"}  onClick={() => setRange("week")}>This week</Chip>
        <Chip active={range === "30"}    onClick={() => setRange("30")}>Next 30 days</Chip>
        <Chip active={range === "all"}   onClick={() => setRange("all")}>All</Chip>
        <Chip active={range === "custom"} onClick={() => setRange("custom")}>Custom</Chip>

        <div className="mx-2 h-5 w-px bg-zinc-200" />

        <Chip active={onlyFree} onClick={() => setOnlyFree(!onlyFree)}>Free</Chip>

        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <label htmlFor={startId} className="text-xs text-zinc-600">Start</label>
            <input
              id={startId}
              type="date"
              value={startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value || null)}
              className="rounded-lg border px-2 py-1 text-sm"
            />
            <label htmlFor={endId} className="text-xs text-zinc-600">End</label>
            <input
              id={endId}
              type="date"
              value={endDate ?? ""}
              onChange={(e) => setEndDate(e.target.value || null)}
              className="rounded-lg border px-2 py-1 text-sm"
            />
            <button
              onClick={onApplyCustom}
              className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white"
              type="button"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
