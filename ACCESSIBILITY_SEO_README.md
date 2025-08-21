# 🚀 Accessibility & SEO Features

Comprehensive accessibility and SEO implementation for the Poppin Next.js application, featuring ARIA labels, keyboard navigation, Core Web Vitals monitoring, and structured data.

## ✨ **Features Overview**

### 🔍 **Accessibility Features**
- **ARIA Labels & Descriptions**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility with logical tab order
- **Focus Management**: Proper focus handling and visual indicators
- **Semantic HTML**: Proper HTML structure and landmarks
- **Screen Reader Optimization**: Enhanced screen reader experience

### 🎯 **SEO Features**
- **Meta Tags**: Dynamic title, description, and keywords
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Structured Data**: JSON-LD schema markup
- **Performance Monitoring**: Core Web Vitals tracking

### ⚡ **Performance Features**
- **Core Web Vitals**: FCP, LCP, FID, CLS monitoring
- **Resource Optimization**: Preloading and prefetching
- **Performance Scoring**: Real-time performance metrics
- **Optimization Tips**: Performance improvement suggestions

## 🏗️ **Component Architecture**

### **SEOHead Component**
```typescript
<SEOHead
  title="Page Title"
  description="Page description for SEO"
  keywords={['keyword1', 'keyword2']}
  canonicalUrl="https://poppin.app/page"
  ogType="website"
  structuredData={eventSchema}
  preload={[{ href: '/api/data', as: 'fetch' }]}
/>
```

**Features:**
- Dynamic meta tag generation
- Open Graph and Twitter Card support
- Structured data injection
- Resource preloading optimization
- Canonical URL management

### **AccessibleButton Component**
```typescript
<AccessibleButton
  variant="primary"
  size="md"
  ariaLabel="Custom button label"
  ariaDescribedBy="description-id"
  ariaExpanded={false}
  ariaControls="modal-id"
  leftIcon={<Icon />}
  loading={false}
>
  Button Text
</AccessibleButton>
```

**Features:**
- Multiple variants (primary, secondary, outline, ghost, danger)
- Size options (sm, md, lg, xl)
- Comprehensive ARIA support
- Loading states with screen reader support
- Icon support with proper labeling
- Keyboard navigation integration

### **AccessibleNavigation Component**
```typescript
<AccessibleNavigation
  items={navigationItems}
  variant="tabs"
  orientation="horizontal"
  activeItemId="current-tab"
  ariaLabel="Main navigation"
  onItemClick={handleNavigation}
/>
```

**Features:**
- Multiple variants (default, tabs, breadcrumb)
- Orientation support (horizontal, vertical)
- Dropdown menu support
- Keyboard navigation (Arrow keys, Enter, Space, Escape)
- ARIA landmarks and roles
- Focus management

### **PerformanceMonitor Component**
```typescript
<PerformanceMonitor
  enabled={true}
  showMetrics={true}
  onMetricsUpdate={handleMetrics}
/>
```

**Features:**
- Core Web Vitals monitoring (FCP, LCP, FID, CLS)
- Performance scoring system
- Real-time metrics display
- Resource loading monitoring
- Performance optimization tips

## 🎨 **Usage Examples**

### **Basic SEO Implementation**
```typescript
import SEOHead from '@/components/seo/SEOHead';

export default function EventPage({ event }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "location": {
      "@type": "Place",
      "name": event.venue
    }
  };

  return (
    <>
      <SEOHead
        title={event.title}
        description={event.description}
        keywords={event.tags}
        structuredData={structuredData}
        ogType="event"
      />
      {/* Page content */}
    </>
  );
}
```

### **Accessible Form Implementation**
```typescript
import AccessibleButton from '@/components/ui/AccessibleButton';

export default function SearchForm() {
  return (
    <form role="search" aria-label="Event search form">
      <div>
        <label htmlFor="search-input" className="sr-only">
          Search events
        </label>
        <input
          id="search-input"
          type="search"
          aria-describedby="search-help"
          placeholder="Search events..."
        />
        <div id="search-help" className="sr-only">
          Type to search for events by name, location, or category
        </div>
      </div>
      
      <AccessibleButton
        type="submit"
        variant="primary"
        ariaLabel="Submit search"
        leftIcon={<MagnifyingGlassIcon />}
      >
        Search
      </AccessibleButton>
    </form>
  );
}
```

### **Navigation with Dropdowns**
```typescript
const navigationItems = [
  {
    id: 'events',
    label: 'Events',
    href: '/events'
  },
  {
    id: 'profile',
    label: 'Profile',
    children: [
      { id: 'settings', label: 'Settings', href: '/profile/settings' },
      { id: 'preferences', label: 'Preferences', href: '/profile/preferences' }
    ]
  }
];

<AccessibleNavigation
  items={navigationItems}
  variant="default"
  orientation="horizontal"
  ariaLabel="Main navigation"
/>
```

## 🔧 **Configuration & Customization**

### **Tailwind CSS Integration**
The components use CSS custom properties for theming:
```css
:root {
  --bg: 255 255 255;
  --text: 0 0 0;
  --brand: 220 38 38;
  --muted: 100 116 139;
  --border-color: 203 213 225;
  --panel: 248 250 252;
}
```

### **Performance Monitoring Configuration**
```typescript
// Enable/disable monitoring
<PerformanceMonitor enabled={true} />

// Show/hide detailed metrics
<PerformanceMonitor showMetrics={true} />

// Custom metrics callback
<PerformanceMonitor onMetricsUpdate={handleMetrics} />
```

### **Accessibility Customization**
```typescript
// Custom ARIA attributes
<AccessibleButton
  ariaLabel="Custom label"
  ariaDescribedBy="description-id"
  ariaExpanded={false}
  ariaControls="controlled-element"
  ariaHaspopup="menu"
  ariaPressed={false}
  ariaCurrent="page"
/>

// Custom roles
<AccessibleButton role="menuitem" />
```

## 📱 **Responsive Design**

All components are fully responsive and include:
- Mobile-first design approach
- Touch-friendly interactions
- Responsive typography
- Adaptive layouts
- Mobile-specific accessibility features

## ♿ **Accessibility Standards**

### **WCAG 2.1 AA Compliance**
- **Perceivable**: Proper contrast ratios, screen reader support
- **Operable**: Full keyboard navigation, focus management
- **Understandable**: Clear labels, consistent navigation
- **Robust**: Cross-browser compatibility, semantic HTML

### **ARIA Implementation**
- **Landmarks**: Navigation, main, complementary, contentinfo
- **Labels**: Descriptive labels and descriptions
- **States**: Expanded, pressed, current, busy
- **Properties**: Controls, describedby, haspopup

### **Keyboard Navigation**
- **Tab Order**: Logical tab sequence
- **Arrow Keys**: Component-specific navigation
- **Enter/Space**: Button activation
- **Escape**: Modal/dropdown closure
- **Home/End**: First/last element focus

## 🚀 **Performance Optimization**

### **Core Web Vitals Targets**
- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **Resource Optimization**
- **Preloading**: Critical resources
- **Prefetching**: DNS and connection optimization
- **Lazy Loading**: Non-critical resources
- **Bundle Optimization**: Code splitting and tree shaking

## 🧪 **Testing & Validation**

### **Accessibility Testing**
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Semantic Validation**: HTML validation tools

### **SEO Testing**
- **Meta Tag Validation**: Google Rich Results Test
- **Structured Data**: Schema.org validator
- **Performance Testing**: Lighthouse, PageSpeed Insights
- **Mobile Testing**: Mobile-friendly test

## 📚 **Best Practices**

### **Accessibility Guidelines**
1. **Always provide ARIA labels** for interactive elements
2. **Use semantic HTML** elements and landmarks
3. **Ensure keyboard navigation** works for all features
4. **Provide focus indicators** for keyboard users
5. **Test with screen readers** regularly

### **SEO Guidelines**
1. **Use descriptive titles** and meta descriptions
2. **Implement structured data** for rich snippets
3. **Optimize for Core Web Vitals** performance
4. **Provide canonical URLs** to prevent duplicate content
5. **Use proper heading hierarchy** (H1, H2, H3)

### **Performance Guidelines**
1. **Monitor Core Web Vitals** continuously
2. **Optimize images** and use modern formats
3. **Minimize JavaScript** bundle size
4. **Implement lazy loading** for non-critical resources
5. **Use CDN** for static assets

## 🔗 **Related Documentation**

- [Enhanced Event Cards](./ENHANCED_EVENT_CARDS_README.md)
- [Map Enhancements](./MAP_ENHANCEMENTS_README.md)
- [Advanced Mobile Features](./ADVANCED_MOBILE_README.md)
- [Search & Discovery](./SEARCH_DISCOVERY_README.md)

## 🚀 **Getting Started**

1. **Install Dependencies**:
   ```bash
   npm install clsx tailwind-merge
   ```

2. **Import Components**:
   ```typescript
   import SEOHead from '@/components/seo/SEOHead';
   import AccessibleButton from '@/components/ui/AccessibleButton';
   import AccessibleNavigation from '@/components/ui/AccessibleNavigation';
   import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
   ```

3. **Use in Your Pages**:
   ```typescript
   // Add SEO head
   <SEOHead title="Page Title" description="Description" />
   
   // Use accessible components
   <AccessibleButton variant="primary">Click Me</AccessibleButton>
   
   // Monitor performance
   <PerformanceMonitor enabled={true} />
   ```

4. **Test Accessibility**:
   - Use keyboard navigation
   - Test with screen readers
   - Validate ARIA implementation
   - Check color contrast

## 🎯 **Next Steps**

- [ ] Implement automated accessibility testing
- [ ] Add more structured data schemas
- [ ] Create accessibility audit tools
- [ ] Implement performance budgets
- [ ] Add accessibility training materials

---

**Built with ❤️ for an inclusive and performant web experience**
