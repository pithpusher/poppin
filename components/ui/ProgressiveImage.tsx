import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export default function ProgressiveImage({
  src,
  alt,
  className,
  placeholder,
  fallback = '/placeholder-event.jpg',
  onLoad,
  onError,
  priority = false
}: ProgressiveImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsLoaded(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (fallback && fallback !== src) {
        setImageSrc(fallback);
        setIsLoading(true);
        // Try to load fallback
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setIsLoading(false);
          setIsLoaded(true);
        };
        fallbackImg.onerror = () => {
          setIsLoading(false);
        };
        fallbackImg.src = fallback;
      }
      onError?.();
    };

    if (priority) {
      img.src = src;
    } else {
      // Small delay for non-priority images
      const timer = setTimeout(() => {
        img.src = src;
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, priority, onLoad, onError]);

  if (hasError && !imageSrc) {
    return (
      <div className={cn(
        "bg-[rgb(var(--muted))]/20 rounded-xl flex items-center justify-center",
        className
      )}>
        <div className="text-center text-[rgb(var(--muted))] p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {/* Blur placeholder */}
      {placeholder && !isLoaded && (
        <div 
          className="absolute inset-0 z-20 blur-sm scale-110"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoading && "opacity-0",
          isLoaded && "opacity-100",
          placeholder && !isLoaded && "opacity-0"
        )}
        style={{
          filter: isLoaded ? 'none' : 'blur(0px)',
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Specialized event image component
export function EventImage({
  src,
  alt,
  className,
  ...props
}: Omit<ProgressiveImageProps, 'fallback'>) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      className={cn("aspect-video", className)}
      fallback="/placeholder-event.jpg"
      placeholder="/placeholder-event-blur.jpg"
      {...props}
    />
  );
}

// Avatar image component
export function AvatarImage({
  src,
  alt,
  className,
  size = 'md',
  ...props
}: Omit<ProgressiveImageProps, 'fallback'> & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )}
      fallback="/placeholder-avatar.jpg"
      {...props}
    />
  );
}
