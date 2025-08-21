// Gesture navigation utilities for app-like feel
export class GestureNavigation {
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private isTracking = false;
  private minSwipeDistance = 50;
  private maxSwipeTime = 500;
  private startTime = 0;

  constructor() {
    this.init();
  }

  private init() {
    // Touch events for mobile
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Mouse events for desktop testing
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.startTracking(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (this.isTracking && e.touches.length === 1) {
      this.updateTracking(e.touches[0].clientX, e.touches[0].clientY);
      
      // Prevent default for horizontal swipes to avoid page scrolling
      const deltaX = Math.abs(this.currentX - this.startX);
      const deltaY = Math.abs(this.currentY - this.startY);
      
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (this.isTracking) {
      this.endTracking();
    }
  }

  private handleMouseDown(e: MouseEvent) {
    this.startTracking(e.clientX, e.clientY);
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isTracking) {
      this.updateTracking(e.clientX, e.clientY);
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (this.isTracking) {
      this.endTracking();
    }
  }

  private startTracking(x: number, y: number) {
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    this.isTracking = true;
    this.startTime = Date.now();
  }

  private updateTracking(x: number, y: number) {
    this.currentX = x;
    this.currentY = y;
  }

  private endTracking() {
    if (!this.isTracking) return;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const deltaTime = Date.now() - this.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only process if swipe is fast enough and long enough
    if (distance > this.minSwipeDistance && deltaTime < this.maxSwipeTime) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      } else {
        if (deltaY > 0) {
          this.handleSwipeDown();
        } else {
          this.handleSwipeUp();
        }
      }
    }

    this.isTracking = false;
  }

  private handleSwipeLeft() {
    // Navigate to next page or show next item
    this.triggerSwipeEvent('left');
  }

  private handleSwipeRight() {
    // Navigate to previous page or show previous item
    this.triggerSwipeEvent('right');
  }

  private handleSwipeUp() {
    // Show more content or expand
    this.triggerSwipeEvent('up');
  }

  private handleSwipeDown() {
    // Hide content or collapse
    this.triggerSwipeEvent('down');
  }

  private triggerSwipeEvent(direction: 'left' | 'right' | 'up' | 'down') {
    const event = new CustomEvent('swipe', {
      detail: { direction, startX: this.startX, startY: this.startY }
    });
    document.dispatchEvent(event);
  }

  // Public method to check if we're on a mobile device
  static isMobile(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Public method to get current touch state
  isTouchActive(): boolean {
    return this.isTracking;
  }

  // Cleanup method
  destroy() {
    // Remove event listeners if needed
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}

// Swipe navigation for specific components
export class ComponentSwipeNavigation {
  private element: HTMLElement;
  private gestureNav: GestureNavigation;
  private onSwipeLeft?: () => void;
  private onSwipeRight?: () => void;
  private onSwipeUp?: () => void;
  private onSwipeDown?: () => void;

  constructor(
    element: HTMLElement,
    callbacks: {
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      onSwipeUp?: () => void;
      onSwipeDown?: () => void;
    } = {}
  ) {
    this.element = element;
    this.onSwipeLeft = callbacks.onSwipeLeft;
    this.onSwipeRight = callbacks.onSwipeRight;
    this.onSwipeUp = callbacks.onSwipeUp;
    this.onSwipeDown = callbacks.onSwipeDown;

    this.gestureNav = new GestureNavigation();
    this.setupSwipeListeners();
  }

  private setupSwipeListeners() {
    document.addEventListener('swipe', (e: CustomEvent) => {
      const { direction } = e.detail;
      
      // Check if the swipe started within our element
      if (this.element.contains(document.elementFromPoint(e.detail.startX, e.detail.startY))) {
        switch (direction) {
          case 'left':
            this.onSwipeLeft?.();
            break;
          case 'right':
            this.onSwipeRight?.();
            break;
          case 'up':
            this.onSwipeUp?.();
            break;
          case 'down':
            this.onSwipeDown?.();
            break;
        }
      }
    });
  }

  destroy() {
    this.gestureNav.destroy();
  }
}

// Initialize global gesture navigation
export const gestureNavigation = new GestureNavigation();
