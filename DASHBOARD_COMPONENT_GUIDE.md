# Clinical Dashboard - Component Guide

## Overview

The MamaGuard Clinical Dashboard is a production-ready, accessible, and feature-rich patient monitoring system built with Next.js, React, TypeScript, and Tailwind CSS.

## Architecture

### Component Hierarchy

```
DashboardLayout
├── DashboardSidebar
│   ├── Logo
│   ├── Triage Queue Summary
│   ├── DashboardNav (Client Component)
│   │   ├── Navigation Links
│   │   └── AI Filters
│   └── Doctor Profile
├── DashboardHeader (Client Component)
│   ├── Search Bar
│   ├── Patient Stats
│   ├── Quick Actions
│   └── Notification Panel
└── DashboardPage (Client Component)
    ├── PageHeader (Client Component)
    │   ├── Breadcrumbs
    │   ├── Metadata
    │   └── Actions
    └── TriageSection[] (Client Component)
        ├── SectionHeader
        ├── Sort Controls
        ├── Collapse Toggle
        └── PatientList
            └── PatientCard[]
```

## Components

### 1. DashboardSidebar

**Location**: `components/dashboard/DashboardSidebar.tsx`  
**Type**: Server Component

#### Features:
- Fixed width sidebar with logo
- Live triage queue summary
- Dynamic navigation with active state detection
- AI filter checkboxes
- Doctor profile with settings link

#### Props:
```typescript
interface DashboardSidebarProps {
  doctor: Doctor;
  stats: DashboardStats;
}
```

---

### 2. DashboardNav

**Location**: `components/dashboard/DashboardNav.tsx`  
**Type**: Client Component

#### Features:
- Uses `usePathname()` for active state detection
- Dynamically highlights current page
- Configurable navigation items
- Interactive AI filter checkboxes

#### Key Implementation:
```typescript
const isActive = (href: string) => {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname?.startsWith(href);
};
```

---

### 3. DashboardHeader

**Location**: `components/dashboard/DashboardHeader.tsx`  
**Type**: Client Component

#### Features:
- **Search**: Full-text search with clear button
- **Stats**: Real-time patient statistics (clickable for filtering)
- **Quick Actions**: "New Patient" button
- **Notifications**: Dropdown panel with unread count
- **Responsive**: Mobile-first design with toggle search

#### State Management:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [showNotifications, setShowNotifications] = useState(false);
const [showMobileSearch, setShowMobileSearch] = useState(false);
```

#### Notification Features:
- Unread count badge
- Color-coded notifications (critical/warning/info)
- Mark all as read
- Individual notification click handling
- Link to full notifications page
- Mobile backdrop for better UX

---

### 4. PageHeader

**Location**: `components/dashboard/PageHeader.tsx`  
**Type**: Client Component

#### Features:
- **Flexible Actions**: Unlimited actions with variants (primary/secondary/danger)
- **Loading States**: Individual action loading spinners
- **Breadcrumbs**: Optional navigation trail
- **Metadata**: Display contextual information
- **Variants**: Default or compact sizing

#### Props:
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: Action[];
  metadata?: {
    label: string;
    value: string | number;
    icon?: string;
  }[];
  variant?: "default" | "compact";
}
```

#### Example Usage:
```tsx
<PageHeader
  title="Priority Triage Board"
  description="Real-time patient monitoring"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Triage Board" }
  ]}
  metadata={[
    { label: "Total Patients", value: 15, icon: "groups" },
    { label: "Last Updated", value: "2m ago", icon: "schedule" }
  ]}
  actions={[
    {
      label: "Refresh",
      icon: "refresh",
      onClick: handleRefresh,
      variant: "primary",
      loading: isRefreshing
    }
  ]}
/>
```

---

### 5. TriageSection

**Location**: `components/dashboard/TriageSection.tsx`  
**Type**: Client Component

#### Features:
- **Patient Count**: Shows number of patients in title
- **Collapsible**: Optional expand/collapse functionality
- **Loading States**: Shows spinner during data fetch
- **Sort Controls**: Dropdown to sort by Priority/Time/Name
- **Empty States**: Custom messages for empty/loading states

#### Props:
```typescript
interface TriageSectionProps {
  id: string;
  title: string;
  icon: string;
  variant: "critical" | "warning" | "success";
  patients: DashboardPatient[];
  className?: string;
  isLoading?: boolean;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  showCount?: boolean;
  onSort?: (sortBy: string) => void;
}
```

#### Example Usage:
```tsx
<TriageSection
  id="critical-section"
  title="Physiological Critical"
  icon="error"
  variant="critical"
  patients={criticalPatients}
  isLoading={isRefreshing}
  isCollapsible={true}
  showCount={true}
  onSort={handleSort}
/>
```

---

### 6. PatientCard

**Location**: `components/dashboard/PatientCard.tsx`  
**Type**: Server Component

#### Features:
- Color-coded risk indicators
- Patient profile with avatar
- Alert details with AI insights
- Real-time trend charts (SVG)
- Action buttons (Call, Dispatch, Schedule)
- Full accessibility support

#### Risk Colors:
```typescript
const RISK_COLORS = {
  critical: { border: "bg-red-500", badge: "bg-red-50 text-red-700" },
  warning: { border: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
  stable: { border: "bg-green-500", badge: "bg-green-50 text-green-700" },
  normal: { border: "bg-blue-500", badge: "bg-blue-50 text-blue-700" }
};
```

---

### 7. SectionHeader

**Location**: `components/dashboard/SectionHeader.tsx`  
**Type**: Server Component

#### Features:
- Color-coded icons based on variant
- Decorative line element
- Consistent styling across sections

---

### 8. PatientList

**Location**: `components/dashboard/PatientList.tsx`  
**Type**: Server Component

#### Features:
- Responsive grid layout
- Empty state message
- Accessibility roles and labels

---

## State Management

### Current Implementation:
- **Local State**: Each component manages its own state (search, notifications, collapse states)
- **Props**: Data flows down from parent components

### Recommended for Production:
```typescript
// Consider using:
- React Context for global dashboard state
- URL params for filters and search
- Server state management (React Query/SWR) for data fetching
```

## Responsive Design

### Breakpoints:
- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md/lg)
- **Desktop**: `> 1024px` (xl)

### Responsive Features:
- Collapsible sidebar on mobile
- Stacked layouts on small screens
- Hidden stats on mobile header
- Icon-only buttons on mobile
- Mobile-optimized notification panel

## Accessibility

### ARIA Attributes:
- `aria-label` on all interactive elements
- `aria-expanded` for collapsible sections
- `aria-current="page"` for active navigation
- `aria-live="polite"` for dynamic content
- `role="toolbar"`, `role="status"`, `role="dialog"`

### Semantic HTML:
- `<nav>`, `<header>`, `<section>`, `<article>`
- `<fieldset>` and `<legend>` for form groups
- `<label>` with `htmlFor` for form inputs
- `<time>` with `dateTime` for timestamps

### Keyboard Navigation:
- All interactive elements are keyboard accessible
- Focus states on all buttons and links
- Logical tab order

## Performance Optimization

### Server vs Client Components:
- **Server**: Static layouts, data display (PatientCard, SectionHeader)
- **Client**: Interactive features (DashboardHeader, PageHeader, TriageSection)

### Image Optimization:
- Using `next/image` for avatars
- Responsive image sizing

### Code Splitting:
- Route-based splitting via App Router
- Component-level splitting via dynamic imports (if needed)

## Future Enhancements

### Short Term:
1. Real-time WebSocket updates
2. Advanced filtering UI
3. Export to PDF/Excel
4. Print-friendly styles
5. Dark mode toggle

### Medium Term:
1. Patient detail pages
2. Historical data visualization
3. Alert management system
4. Team collaboration features
5. Mobile app version

### Long Term:
1. Predictive analytics dashboard
2. AI-powered triage recommendations
3. Integration with EHR systems
4. Multi-language support
5. Advanced reporting tools

## Testing Recommendations

### Unit Tests:
```typescript
- Test component rendering
- Test state changes
- Test prop variations
- Test accessibility
```

### Integration Tests:
```typescript
- Test navigation flows
- Test data loading
- Test user interactions
- Test responsive behavior
```

### E2E Tests:
```typescript
- Critical patient workflows
- Search and filter functionality
- Notification interactions
- Mobile responsiveness
```

## Best Practices

1. **Type Safety**: All components are fully typed with TypeScript
2. **Accessibility**: WCAG 2.1 AA compliant
3. **Performance**: Optimized renders with proper component splitting
4. **Maintainability**: Clear component structure and documentation
5. **Scalability**: Modular architecture ready for growth

## Getting Started

### Development:
```bash
npm run dev
```

### Building:
```bash
npm run build
```

### Testing:
```bash
npm run test (when tests are added)
```

## Support

For issues or questions, refer to:
- Project README
- Component source code
- TypeScript type definitions
