'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export function RetryButton({ 
  onRetry, 
  children = 'Try Again', 
  className,
  size = 'md',
  variant = 'primary'
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90',
    secondary: 'bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]',
    outline: 'border border-[rgb(var(--border-color))] bg-transparent text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]'
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <ArrowPathIcon 
        className={cn(
          'transition-transform',
          isRetrying ? 'animate-spin' : ''
        )} 
        className={cn(
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
        )}
      />
      {isRetrying ? 'Retrying...' : children}
    </button>
  );
}
