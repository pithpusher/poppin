// Performance optimization utilities for app-like feel
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollSentinel: HTMLElement | null = null;

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    this.init();
  }

  private init() {
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupSmoothScrolling();
    this.setupLazyLoading();
  }

  // Setup intersection observer for infinite scroll and lazy loading
  private setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              const action = target.dataset.action;
              
              switch (action) {
                case 'load-more':
                  this.triggerLoadMore();
                  break;
                case 'lazy-load':
                  this.triggerLazyLoad(target);
                  break;
                case 'animate':
                  this.triggerAnimation(target);
                  break;
              }
            }
          });
        },
        {
          rootMargin: '100px',
          threshold: 0.1
        }
      );
    }
  }

  // Setup resize observer for responsive optimizations
  private setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          const action = target.dataset.resizeAction;
          
          if (action === 'optimize-layout') {
            this.optimizeLayout(target);
          }
        });
      });
    }
  }

  // Setup smooth scrolling behavior
  private setupSmoothScrolling() {
    // Add smooth scrolling to all internal links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]');
      
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    });
  }

  // Setup lazy loading for images and content
  private setupLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach(element => {
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }
    });
  }

  // Create infinite scroll sentinel
  createInfiniteScrollSentinel(container: HTMLElement, onLoadMore: () => void) {
    if (!this.intersectionObserver) return;

    const sentinel = document.createElement('div');
    sentinel.dataset.action = 'load-more';
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    
    container.appendChild(sentinel);
    this.intersectionObserver.observe(sentinel);
    
    // Store the callback
    (sentinel as any).loadMoreCallback = onLoadMore;
    
    return sentinel;
  }

  // Create lazy loading element
  createLazyElement(
    element: HTMLElement,
    loadCallback: () => void,
    placeholder?: string
  ) {
    if (!this.intersectionObserver) return;

    element.dataset.action = 'lazy-load';
    element.dataset.placeholder = placeholder || '';
    
    // Show placeholder if provided
    if (placeholder) {
      element.innerHTML = placeholder;
    }
    
    this.intersectionObserver.observe(element);
    
    // Store the callback
    (element as any).lazyLoadCallback = loadCallback;
  }

  // Trigger load more functionality
  private triggerLoadMore() {
    // This will be called when the sentinel comes into view
    console.log('Load more triggered');
  }

  // Trigger lazy loading
  private triggerLazyLoad(element: HTMLElement) {
    const callback = (element as any).lazyLoadCallback;
    if (callback && typeof callback === 'function') {
      callback();
      // Remove the observer after loading
      if (this.intersectionObserver) {
        this.intersectionObserver.unobserve(element);
      }
    }
  }

  // Trigger animation
  private triggerAnimation(element: HTMLElement) {
    element.classList.add('animate-in');
  }

  // Optimize layout based on container size
  private optimizeLayout(element: HTMLElement) {
    const { width, height } = element.getBoundingClientRect();
    
    // Adjust layout based on dimensions
    if (width < 768) {
      element.classList.add('mobile-layout');
    } else {
      element.classList.remove('mobile-layout');
    }
  }

  // Debounce function for performance
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for performance
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Preload critical resources
  preloadResources(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }

  // Optimize images for different screen sizes
  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        // Create responsive image sources
        const picture = document.createElement('picture');
        
        // WebP version for modern browsers
        const webpSource = document.createElement('source');
        webpSource.srcset = src.replace(/\.[^.]+$/, '.webp');
        webpSource.type = 'image/webp';
        picture.appendChild(webpSource);
        
        // Fallback to original
        const imgSource = document.createElement('source');
        imgSource.srcset = src;
        picture.appendChild(imgSource);
        
        // Replace original img
        img.parentNode?.replaceChild(picture, img);
        picture.appendChild(img);
      }
    });
  }

  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Initialize performance optimizer
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Utility functions for common performance optimizations
export const performanceUtils = {
  // Debounced scroll handler
  debouncedScroll: PerformanceOptimizer.debounce((callback: () => void) => {
    callback();
  }, 16), // ~60fps

  // Throttled resize handler
  throttledResize: PerformanceOptimizer.throttle((callback: () => void) => {
    callback();
  }, 100),

  // Check if element is in viewport
  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get element's distance from viewport center
  getDistanceFromCenter(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    
    return Math.sqrt(
      Math.pow(centerX - elementCenterX, 2) + 
      Math.pow(centerY - elementCenterY, 2)
    );
  }
};
