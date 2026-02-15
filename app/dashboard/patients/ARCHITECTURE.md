# Patients Page - Architecture & Organization

## 📁 File Structure

```
app/dashboard/patients/
├── page.tsx                          # Main page component (composition only)
├── hooks/
│   ├── index.ts                      # Hooks barrel export
│   ├── usePatientData.ts             # Data fetching & real-time updates
│   └── usePatientsFilters.ts         # Search, filters, & pagination
├── components/
│   ├── index.ts                      # Components barrel export
│   ├── PageHeader.tsx                # Sticky header with patient counts
│   ├── ActiveFiltersDisplay.tsx      # Shows active search/filter state
│   ├── ErrorDisplay.tsx              # Error message display
│   └── FloatingActionButton.tsx      # Mobile FAB for adding patients
└── [id]/                             # Patient detail pages
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Data Layer**: Custom hooks (`usePatientData`, `usePatientsFilters`)
- **UI Layer**: Presentational components in `components/`
- **Composition**: Main `page.tsx` orchestrates data and UI

### 2. **Custom Hooks**

#### `usePatientData()`
**Purpose**: Manages patient data fetching and real-time Supabase subscriptions

**Returns**:
- `patients` - Array of patient records
- `loading` - Initial loading state
- `refreshing` - Refresh loading state
- `error` - Error message if any
- `refresh()` - Manual refresh function

**Handles**:
- Initial data fetch from Supabase
- Real-time subscriptions (postgres_changes)
- Error handling and toast notifications
- Loading states management

---

#### `usePatientsFilters(patients)`
**Purpose**: Manages search, filtering, and pagination logic

**Parameters**:
- `patients` - Source patient array

**Returns**:
- **State**: `searchQuery`, `currentPage`, `showHighRiskOnly`, etc.
- **Computed**: `filteredPatients`, `paginatedPatients`, `totalPages`
- **Actions**: `handleSearch()`, `toggleHighRiskFilter()`, `goToNextPage()`, etc.

**Handles**:
- Debounced search (300ms)
- Risk level filtering (high/critical)
- Overdue patients filtering
- Pagination (12 items per page)
- Filter state management

### 3. **Component Organization**

#### Page-Specific Components (`components/`)
Small, focused components that belong to this page:
- `PageHeader` - Sticky title bar with live indicator
- `ActiveFiltersDisplay` - Filter summary banner
- `ErrorDisplay` - Error message formatting
- `FloatingActionButton` - Mobile add button

#### Shared Components (from `@/components/patient-management`)
Reusable across the application:
- `StatsBar` - Patient statistics overview
- `SearchFiltersBar` - Search input and filter controls
- `PatientGrid` - Grid layout for patient cards
- `PaginationControls` - Page navigation
- `EmptyState` - Empty/no results states

### 4. **Page Component Responsibility**

The main `page.tsx` now focuses **only on**:
- ✅ Importing hooks and components
- ✅ Orchestrating data flow
- ✅ Handling navigation (router.push)
- ✅ Managing minimal UI state (expandedCard)
- ✅ Composing the layout

**Does NOT**:
- ❌ Fetch data directly
- ❌ Implement filtering logic
- ❌ Handle complex state management
- ❌ Define inline components

## 🎯 Benefits of This Architecture

### Maintainability
- **Single Responsibility**: Each file has one clear purpose
- **Easy to Locate**: Logic organized by concern, not proximity
- **Reusable Hooks**: `usePatientData` can be used in other pages

### Testability
- **Isolated Logic**: Hooks can be tested independently
- **Mock-Friendly**: Easy to mock Supabase in `usePatientData`
- **Pure Functions**: Filter logic is a pure function

### Scalability
- **Easy to Extend**: Add new filters in `usePatientsFilters`
- **Component Reuse**: Page components can be extracted to shared if needed
- **Clear Boundaries**: Adding features doesn't bloat `page.tsx`

### Developer Experience
- **Clear Intent**: File names describe their purpose
- **Type Safety**: Full TypeScript support throughout
- **IntelliSense**: Barrel exports improve autocomplete
- **Documentation**: Each component/hook has clear JSDoc comments

## 🔄 Data Flow

```
Supabase DB
    ↓
usePatientData() hook
    ↓ (patients array)
usePatientsFilters() hook
    ↓ (filtered & paginated)
Page Component
    ↓ (props)
UI Components
```

## 📝 Usage Example

```tsx
// Clean and focused page component
export default function PatientsPage() {
  // Custom hooks handle complexity
  const { patients, loading, refresh } = usePatientData();
  const { 
    filteredPatients, 
    handleSearch,
    toggleHighRiskFilter 
  } = usePatientsFilters(patients);

  // Just composition
  return (
    <div>
      <PageHeader />
      <SearchFiltersBar onSearchChange={handleSearch} />
      <PatientGrid patients={filteredPatients} />
    </div>
  );
}
```

## 🚀 Future Improvements

1. **Add More Hooks**:
   - `usePatientExport()` - Export to CSV/PDF
   - `usePatientBulkActions()` - Select and bulk update

2. **Enhanced Filtering**:
   - Date range filters
   - Blood type filter
   - Custom saved filters

3. **Performance**:
   - Virtual scrolling for large datasets
   - Optimistic updates for better UX

4. **Analytics**:
   - Track which filters are most used
   - Monitor search patterns
