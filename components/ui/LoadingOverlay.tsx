import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: 'overlay' | 'inline' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingOverlay({
  isLoading,
  text = 'Loading...',
  variant = 'overlay',
  size = 'md',
  className
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className={cn(
      "border-2 border-[rgb(var(--muted))]/30 border-t-[rgb(var(--brand))] rounded-full animate-spin",
      sizeClasses[size]
    )} />
  );

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-[rgb(var(--bg))] flex items-center justify-center">
        <div className="text-center space-y-4">
          {spinner}
          <div className="text-[rgb(var(--text))] font-medium">{text}</div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="text-center space-y-2">
          {spinner}
          {text && <div className="text-sm text-[rgb(var(--muted))]">{text}</div>}
        </div>
      </div>
    );
  }

  // Default overlay variant
  return (
    <div className={cn(
      "absolute inset-0 bg-[rgb(var(--bg))]/80 backdrop-blur-sm flex items-center justify-center z-10",
      className
    )}>
      <div className="text-center space-y-3">
        {spinner}
        <div className="text-[rgb(var(--text))] font-medium">{text}</div>
      </div>
    </div>
  );
}

// Specialized loading components
export function PageLoading() {
  return (
    <LoadingOverlay
      isLoading={true}
      text="Loading page..."
      variant="fullscreen"
      size="lg"
    />
  );
}

export function ContentLoading({ text = 'Loading content...' }: { text?: string }) {
  return (
    <LoadingOverlay
      isLoading={true}
      text={text}
      variant="inline"
      size="md"
    />
  );
}

export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingOverlay
        isLoading={true}
        variant="inline"
        size={size}
        className="p-0"
      />
      <span>Loading...</span>
    </div>
  );
}

export function SearchLoading() {
  return (
    <div className="w-4 h-4 border-2 border-[rgb(var(--muted))] border-t-transparent rounded-full animate-spin" />
  );
}

export function MapLoading() {
  return (
    <div className="absolute inset-0 bg-[rgb(var(--bg))]/90 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[rgb(var(--muted))]/30 border-t-[rgb(var(--brand))] rounded-full animate-spin" />
        <div className="text-[rgb(var(--text))] font-medium">Loading map...</div>
        <div className="text-sm text-[rgb(var(--muted))]">This may take a moment</div>
      </div>
    </div>
  );
}
