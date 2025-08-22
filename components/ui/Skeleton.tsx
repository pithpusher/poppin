import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[rgb(var(--muted))]/20", className)}
      {...props}
    />
  );
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="rounded-lg token-border p-4 bg-[rgb(var(--panel))] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// Event list skeleton
export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="opacity-0 animate-pulse" style={{ 
          animationDelay: `${i * 100}ms`,
          animation: 'fadeIn 0.3s ease-out forwards'
        }}>
          <EventCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Map skeleton
export function MapSkeleton() {
  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] rounded-2xl token-border overflow-hidden bg-[rgb(var(--panel))]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Header skeleton
export function HeaderSkeleton() {
  return (
    <div className="relative z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          <div className="flex-shrink-0">
            <Skeleton className="h-8 md:h-10 lg:h-12 w-48 md:w-56 lg:w-64" />
            <Skeleton className="h-4 md:h-5 lg:h-6 w-32 md:w-40 lg:w-48 mt-2" />
          </div>
          
          <div className="hidden md:flex flex-1 px-4 md:px-6">
            <Skeleton className="w-full h-12 md:h-16 rounded-lg" />
          </div>
          
          <div className="flex gap-2 md:gap-3 flex-shrink-0">
            <Skeleton className="h-10 md:h-12 w-24 md:w-28 rounded-xl" />
            <Skeleton className="h-10 md:h-12 w-20 md:w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter bar skeleton
export function FilterBarSkeleton() {
  return (
    <div className="w-full bg-[rgb(var(--panel))] py-2 md:py-3">
      <div className="flex justify-center">
        <div className="flex items-center gap-2 md:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 md:h-7 w-16 md:w-20 rounded-md" />
          ))}
          <Skeleton className="h-6 md:h-7 w-24 md:w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Search tools skeleton
export function SearchToolsSkeleton() {
  return (
    <div className="px-4 py-2 bg-[rgb(var(--bg))] border-t border-[rgb(var(--border-color))]/20 border-b border-[rgb(var(--border-color))]/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 md:w-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Sidebar skeleton
export function SidebarSkeleton() {
  return (
    <aside className="space-y-3 pb-6 md:block">
      <div className="text-center">
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <EventListSkeleton count={5} />
    </aside>
  );
}

// Grid layout skeleton
export function GridLayoutSkeleton() {
  return (
    <div className="grid md:grid-cols-[2fr,1fr] gap-6 max-w-7xl mx-auto px-4 py-6">
      <MapSkeleton />
      <SidebarSkeleton />
    </div>
  );
}

// Full page skeleton
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <HeaderSkeleton />
      <FilterBarSkeleton />
      <SearchToolsSkeleton />
      <GridLayoutSkeleton />
    </div>
  );
}
