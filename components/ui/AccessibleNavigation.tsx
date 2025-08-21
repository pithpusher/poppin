'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import AccessibleButton from './AccessibleButton';

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'tabs' | 'breadcrumb';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  activeItemId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export default function AccessibleNavigation({
  items,
  orientation = 'horizontal',
  variant = 'default',
  className,
  onItemClick,
  activeItemId,
  ariaLabel,
  ariaDescribedBy
}: AccessibleNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, item: NavigationItem) => {
    const currentIndex = items.findIndex(i => i.id === item.id);
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = orientation === 'horizontal' 
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
        const nextItem = items[nextIndex];
        if (nextItem) {
          itemRefs.current.get(nextItem.id)?.focus();
          setFocusedItemId(nextItem.id);
        }
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = orientation === 'horizontal'
          ? currentIndex === 0 ? items.length - 1 : currentIndex - 1
          : Math.max(currentIndex - 1, 0);
        const prevItem = items[prevIndex];
        if (prevItem) {
          itemRefs.current.get(prevItem.id)?.focus();
          setFocusedItemId(prevItem.id);
        }
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleItemClick(item);
        break;
        
      case 'Escape':
        event.preventDefault();
        setExpandedItems(new Set());
        break;
        
      case 'Home':
        event.preventDefault();
        const firstItem = items[0];
        if (firstItem) {
          itemRefs.current.get(firstItem.id)?.focus();
          setFocusedItemId(firstItem.id);
        }
        break;
        
      case 'End':
        event.preventDefault();
        const lastItem = items[items.length - 1];
        if (lastItem) {
          itemRefs.current.get(lastItem.id)?.focus();
          setFocusedItemId(lastItem.id);
        }
        break;
    }
  };

  // Handle item click
  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.id)) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else if (item.href) {
      onItemClick?.(item);
    }
  };

  // Handle item focus
  const handleItemFocus = (itemId: string) => {
    setFocusedItemId(itemId);
  };

  // Handle item blur
  const handleItemBlur = () => {
    setFocusedItemId(null);
  };

  // Get navigation role and ARIA attributes based on variant
  const getNavigationAttributes = () => {
    switch (variant) {
      case 'tabs':
        return {
          role: 'tablist',
          'aria-orientation': orientation,
          'aria-label': ariaLabel || 'Tab navigation'
        };
      case 'breadcrumb':
        return {
          role: 'navigation',
          'aria-label': ariaLabel || 'Breadcrumb navigation'
        };
      default:
        return {
          role: 'navigation',
          'aria-label': ariaLabel || 'Main navigation'
        };
    }
  };

  // Render navigation item
  const renderNavigationItem = (item: NavigationItem, index: number) => {
    const isActive = activeItemId === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    const itemAttributes: Record<string, any> = {
      ref: (el: HTMLElement | null) => {
        if (el) {
          itemRefs.current.set(item.id, el);
        }
      },
      tabIndex: focusedItemId === item.id ? 0 : -1,
      onFocus: () => handleItemFocus(item.id),
      onBlur: handleItemBlur,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, item),
      onClick: () => handleItemClick(item),
      className: cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2',
        'hover:bg-[rgb(var(--muted))]',
        isActive && 'bg-[rgb(var(--brand))] text-white',
        hasChildren && 'cursor-pointer',
        orientation === 'vertical' && 'w-full justify-start',
        orientation === 'horizontal' && 'justify-center'
      )
    };

    // Add ARIA attributes based on variant
    if (variant === 'tabs') {
      itemAttributes.role = 'tab';
      itemAttributes['aria-selected'] = isActive;
      if (hasChildren) {
        itemAttributes['aria-expanded'] = isExpanded;
        itemAttributes['aria-haspopup'] = true;
      }
    } else if (variant === 'breadcrumb') {
      itemAttributes['aria-current'] = isActive ? 'page' : undefined;
    }

    return (
      <div key={item.id} className="relative">
        {item.href ? (
          <a
            href={item.href}
            {...itemAttributes}
            aria-label={item.ariaLabel || item.label}
            aria-describedby={item.ariaDescribedBy}
          >
            {item.icon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </a>
        ) : (
          <button
            type="button"
            {...itemAttributes}
            aria-label={item.ariaLabel || item.label}
            aria-describedby={item.ariaDescribedBy}
          >
            {item.icon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {hasChildren && (
              <span 
                className={cn(
                  'ml-auto transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
                aria-hidden="true"
              >
                ▼
              </span>
            )}
          </button>
        )}
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div
            role="menu"
            aria-label={`${item.label} submenu`}
            className={cn(
              'absolute z-50 min-w-48 bg-[rgb(var(--panel))] border border-[rgb(var(--border-color))]/20 rounded-lg shadow-lg',
              orientation === 'horizontal' ? 'top-full left-0 mt-1' : 'left-full top-0 ml-1'
            )}
          >
            {item.children!.map((child) => (
              <button
                key={child.id}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => onItemClick?.(child)}
                className="w-full text-left px-4 py-2 hover:bg-[rgb(var(--muted))] focus:bg-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]/50 focus:ring-offset-2 rounded"
                aria-label={child.ariaLabel || child.label}
              >
                {child.icon && (
                  <span className="mr-2" aria-hidden="true">
                    {child.icon}
                  </span>
                )}
                {child.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      ref={navigationRef}
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        variant === 'tabs' && 'border-b border-[rgb(var(--border-color))]/20',
        variant === 'breadcrumb' && 'text-sm',
        className
      )}
      {...getNavigationAttributes()}
      aria-describedby={ariaDescribedBy}
    >
      {items.map((item, index) => renderNavigationItem(item, index))}
    </nav>
  );
}
