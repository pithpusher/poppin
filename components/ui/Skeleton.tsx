import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text" | "title" | "avatar";
  lines?: number;
  animated?: boolean;
}

export default function Skeleton({ 
  className, 
  variant = "default", 
  lines = 1, 
  animated = true 
}: SkeletonProps) {
  const baseClasses = "bg-[rgb(var(--muted))]/20 rounded animate-pulse";
  
  if (variant === "circular") {
    return (
      <div 
        className={cn(
          baseClasses,
          "rounded-full",
          animated && "animate-pulse",
          className
        )} 
      />
    );
  }
  
  if (variant === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-3",
              i === lines - 1 ? "w-3/4" : "w-full",
              animated && "animate-pulse",
              className
            )}
          />
        ))}
      </div>
    );
  }
  
  if (variant === "title") {
    return (
      <div 
        className={cn(
          baseClasses,
          "h-6 w-3/4",
          animated && "animate-pulse",
          className
        )} 
      />
    );
  }
  
  if (variant === "avatar") {
    return (
      <div 
        className={cn(
          baseClasses,
          "w-10 h-10 rounded-full",
          animated && "animate-pulse",
          className
        )} 
      />
    );
  }
  
  return (
    <div 
      className={cn(
        baseClasses,
        animated && "animate-pulse",
        className
      )} 
    />
  );
}

// Specialized skeleton components
export function EventCardSkeleton() {
  return (
    <div className="bg-[rgb(var(--panel))] rounded-2xl p-4 space-y-3 animate-in fade-in-0 duration-300">
      {/* Image skeleton */}
      <div className="aspect-video w-full rounded-xl bg-[rgb(var(--muted))]/20 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="space-y-2">
        <Skeleton variant="title" className="h-5 w-4/5" />
        <Skeleton variant="text" lines={2} />
        
        {/* Meta info skeleton */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton className="h-3 w-20" />
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="bg-[rgb(var(--panel))] rounded-xl p-3 space-y-2 animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-8 h-8" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-2xl bg-[rgb(var(--muted))]/10 flex items-center justify-center animate-in fade-in-0 duration-500">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-[rgb(var(--muted))]/20 animate-pulse" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in-0 duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <EventCardSkeleton />
        </div>
      ))}
    </div>
  );
}
