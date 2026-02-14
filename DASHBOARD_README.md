# MamaGuard Clinical Dashboard

## 📊 Overview

The Clinical Dashboard is a professional healthcare interface for doctors and medical staff to monitor pregnant patients in real-time, prioritize care based on AI-detected risk factors, and take immediate action when needed.

## 🎯 Key Features

### 1. **Real-Time Triage System**
- **Critical Alerts**: Immediate attention required (red indicators)
- **Warning Threshold**: Moderate risk patients (yellow indicators)
- **Stable Monitoring**: Normal progression patients (green indicators)

### 2. **AI-Powered Insights**
- Voice stress analysis
- Blood pressure anomaly detection
- Fetal movement tracking
- Pattern recognition for preeclampsia and other conditions

### 3. **Patient Cards**
Each patient card displays:
- Patient photo, name, ID, and gestational week
- Real-time risk level indicator
- AI-generated insight with specific symptoms
- Trend visualization (heart rate, pain level, activity, etc.)
- Quick action buttons (Call, Dispatch, Schedule)

### 4. **Smart Search & Filters**
- Search by patient name, ID, or symptoms
- AI filter toggles for specific conditions
- Quick access to critical vs warning patients

## 🗂️ File Structure

```
app/
  dashboard/
    layout.tsx              # Dashboard shell with sidebar & header
    page.tsx                # Main triage board view
    patients/
      page.tsx              # Full patient list
      [id]/page.tsx         # Individual patient details
    analytics/
      page.tsx              # Analytics & reports

components/
  dashboard/
    DashboardSidebar.tsx    # Left sidebar navigation
    DashboardHeader.tsx     # Top header with search & stats
    PatientCard.tsx         # Individual patient display
    TrendChart.tsx          # (Future) Reusable chart component
    
lib/
  mockData.ts              # Sample patient data
  
types/
  index.ts                 # TypeScript interfaces
```

## 🎨 Design System

### Colors
- **Clinical Background**: `#f8fafc` (Slate 50)
- **Surface**: `#ffffff` (White)
- **Primary Clinical**: `#0ea5e9` (Sky 500)
- **Danger**: `#ef4444` (Red 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Success**: `#10b981` (Green 500)

### Typography
- **Primary Font**: Inter
- **Monospace**: Roboto Mono (for IDs, timestamps)

### Components
- **Shadows**: Subtle elevation (soft, card, hover)
- **Borders**: Light gray (`#e2e8f0`)
- **Rounded Corners**: 8px-12px for cards

## 🔗 Navigation Structure

```
/dashboard                        → Main triage board
/dashboard?filter=critical        → Filter by critical patients
/dashboard?filter=warning         → Filter by warning patients
/dashboard/patients               → Patient monitoring view
/dashboard/patients/list          → Full patient list
/dashboard/patients/[id]          → Individual patient details
/dashboard/analytics              → Analytics & reports
```

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar visible
- Multi-column patient cards
- All stats and charts displayed

### Tablet (768px-1023px)
- Collapsible sidebar
- Two-column patient cards
- Simplified charts

### Mobile (< 768px)
- Hidden sidebar (hamburger menu)
- Single-column stacked layout
- Essential info only

## 🚀 Future Enhancements

### Phase 1 (Current)
- [x] Static dashboard with mock data
- [x] Basic patient cards with trends
- [x] Sidebar navigation
- [x] Search interface

### Phase 2 (Next Steps)
- [ ] Real-time data integration
- [ ] WebSocket for live updates
- [ ] Patient detail pages
- [ ] Video call integration
- [ ] Dispatch workflow

### Phase 3 (Advanced)
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Multi-user roles (Doctor, Nurse, Admin)
- [ ] Notification system
- [ ] Mobile app sync

## 🔐 Access Control

**Route Protection**: All `/dashboard/*` routes should require authentication.

```tsx
// Future: Add middleware
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## 📊 Data Flow

```
Patient WhatsApp → AI Analysis → Risk Scoring → Dashboard Update → Doctor Alert
```

1. Patient sends voice message via WhatsApp
2. AI processes and extracts vital information
3. Risk algorithm assigns priority level
4. Dashboard updates in real-time
5. Doctor receives notification for critical cases

## 🎭 Mock Data

Located in `lib/mockData.ts`:
- **mockDoctor**: Current logged-in doctor
- **mockStats**: Dashboard statistics
- **mockCriticalPatients**: High-risk patients
- **mockWarningPatients**: Moderate-risk patients

Replace with real API calls when backend is ready.

## ♿ Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators on all interactive elements
- Color contrast meets WCAG AA standards
- Search inputs properly labeled

## 🧪 Testing Checklist

- [ ] All links navigate correctly
- [ ] Patient cards display all information
- [ ] Charts render properly
- [ ] Search input is functional
- [ ] Buttons have hover/focus states
- [ ] Responsive design works on all breakpoints
- [ ] Sidebar navigation is accessible
- [ ] Statistics update correctly

## 📝 Notes

- Dashboard uses server components by default (no "use client")
- Images optimized with Next.js `<Image>` component
- Links use Next.js `<Link>` for client-side navigation
- Tailwind CSS for styling (custom clinical theme)
- TypeScript for type safety
