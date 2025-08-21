'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  ariaPressed?: boolean;
  ariaCurrent?: boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  className?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      ariaLabel,
      ariaDescribedBy,
      ariaExpanded,
      ariaControls,
      ariaHaspopup,
      ariaPressed,
      ariaCurrent,
      role = 'button',
      tabIndex = 0,
      onKeyDown,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const mergedRef = (node: HTMLButtonElement) => {
      buttonRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Focus management for keyboard navigation
    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (!disabled && !loading && onClick) {
              onClick(event as any);
            }
            break;
          case 'Tab':
            // Ensure proper tab order
            if (event.shiftKey) {
              // Shift+Tab - focus previous element
              const focusableElements = getFocusableElements();
              const currentIndex = focusableElements.indexOf(button);
              if (currentIndex > 0) {
                focusableElements[currentIndex - 1].focus();
              }
            } else {
              // Tab - focus next element
              const focusableElements = getFocusableElements();
              const currentIndex = focusableElements.indexOf(button);
              if (currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
              }
            }
            break;
        }
      };

      button.addEventListener('keydown', handleKeyDown);
      return () => button.removeEventListener('keydown', handleKeyDown);
    }, [disabled, loading, onClick]);

    // Get all focusable elements for keyboard navigation
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];
      
      return Array.from(
        document.querySelectorAll(focusableSelectors.join(','))
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];
    };

    // Handle click with proper accessibility
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      // Focus the button after click for better accessibility
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
      
      onClick?.(event);
    };

    // Handle custom key down events
    const handleCustomKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
    };

    // Generate ARIA attributes
    const ariaAttributes: Record<string, any> = {};
    if (ariaLabel) ariaAttributes['aria-label'] = ariaLabel;
    if (ariaDescribedBy) ariaAttributes['aria-describedby'] = ariaDescribedBy;
    if (ariaExpanded !== undefined) ariaAttributes['aria-expanded'] = ariaExpanded;
    if (ariaControls) ariaAttributes['aria-controls'] = ariaControls;
    if (ariaHaspopup !== undefined) ariaAttributes['aria-haspopup'] = ariaHaspopup;
    if (ariaPressed !== undefined) ariaAttributes['aria-pressed'] = ariaPressed;
    if (ariaCurrent !== undefined) ariaAttributes['aria-current'] = ariaCurrent;

    // Add loading state ARIA attributes
    if (loading) {
      ariaAttributes['aria-busy'] = true;
      ariaAttributes['aria-live'] = 'polite';
    }

    // Variant styles
    const variantStyles = {
      primary: 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90 focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2',
      secondary: 'bg-[rgb(var(--muted))] text-[rgb(var(--text))] hover:bg-[rgb(var(--muted))]/80 focus:ring-2 focus:ring-[rgb(var(--muted))]/50 focus:ring-offset-2',
      outline: 'border border-[rgb(var(--border-color))] bg-transparent hover:bg-[rgb(var(--bg))] focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2',
      ghost: 'bg-transparent hover:bg-[rgb(var(--muted))] focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2'
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    return (
      <button
        ref={mergedRef}
        role={role}
        tabIndex={tabIndex}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleCustomKeyDown}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...ariaAttributes}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="mr-2" role="status" aria-label="Loading">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button Text */}
        <span className={loading ? 'sr-only' : ''}>
          {children}
        </span>
        
        {/* Right Icon */}
        {rightIcon && !loading && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {/* Screen Reader Only Loading Text */}
        {loading && (
          <span className="sr-only">Loading...</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
