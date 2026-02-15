"use client";

/**
 * Patients Management Page
 * 
 * Features:
 * - Real-time patient data from Supabase
 * - Search and filtering (by name, phone, ID)
 * - Risk level filtering (high risk, critical)
 * - Overdue patients filtering
 * - Pagination (12 items per page)
 * - Responsive grid layout
 * 
 * Data mapping (DB → UI):
 *   full_name/name    → Patient Name
 *   risk_level        → Risk Level Badge (critical, high, medium, low)
 *   gestational_week  → Progress (40-week term = 100%)
 *   national_id       → Patient ID (fallback: id slice)
 */

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  StatsBar,
  SearchFiltersBar,
  PatientGrid,
  PatientGridSkeleton,
  PaginationControls,
  EmptyState,
} from "@/components/patient-management";

// Page-specific hooks and components
import { usePatientData, usePatientsFilters } from "./hooks";
import {
  PageHeader,
  ActiveFiltersDisplay,
  ErrorDisplay,
  FloatingActionButton,
} from "./components";

export default function PatientsPage() {
  const router = useRouter();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Data fetching with real-time updates
  const { patients, loading, refreshing, error, refresh } = usePatientData();

  // Filtering, search, and pagination
  const {
    searchQuery,
    debouncedSearch,
    currentPage,
    showHighRiskOnly,
    showOverdueOnly,
    hasActiveFilters,
    filteredPatients,
    paginatedPatients,
    totalPages,
    handleSearch,
    clearSearch,
    toggleHighRiskFilter,
    toggleOverdueFilter,
    goToPreviousPage,
    goToNextPage,
  } = usePatientsFilters(patients);

  // Computed values
  const highRiskCount = useMemo(
    () =>
      patients.filter(
        (p) => p.risk_level === "high" || p.risk_level === "critical",
      ).length,
    [patients],
  );

  // Navigation handlers
  const handlePatientClick = useCallback(
    (patientId: string) => {
      router.push(`/dashboard/patients/${patientId}`);
    },
    [router],
  );

  const handleNewPatient = useCallback(() => {
    router.push("/dashboard/patients/new");
  }, [router]);

  // UI state
  const handleExpandCard = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const showAddCard =
    !searchQuery && !showHighRiskOnly && !showOverdueOnly && currentPage === 1;
  const showEmptyDb =
    !loading && !refreshing && !hasActiveFilters && patients.length === 0;
  const showEmptyResults =
    !loading &&
    !refreshing &&
    hasActiveFilters &&
    filteredPatients.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ============================================================
          HEADER SECTION - Sticky page title with live indicator
          ============================================================ */}
      <PageHeader totalPatients={patients.length} highRiskCount={highRiskCount} />

      {/* ============================================================
          STATS & FILTERS SECTION - Natural scroll behavior
          ============================================================ */}
      <div className="max-w-[1600px] mx-auto">
        {/* Statistics Overview */}
        <div className="border-b border-slate-200/80">
          <StatsBar patients={patients} />
        </div>

        {/* Search and Filter Controls */}
        <div className="border-b border-slate-200/80">
          <SearchFiltersBar
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onClearSearch={clearSearch}
            showHighRiskOnly={showHighRiskOnly}
            onToggleHighRisk={toggleHighRiskFilter}
            showOverdueOnly={showOverdueOnly}
            onToggleOverdue={toggleOverdueFilter}
            onNewPatient={handleNewPatient}
            highRiskCount={highRiskCount}
            refreshing={refreshing}
            onRefresh={refresh}
          />
        </div>
      </div>

      {/* ============================================================
          MAIN CONTENT SECTION - Patient cards with pagination
          ============================================================ */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <ActiveFiltersDisplay
              totalResults={filteredPatients.length}
              searchQuery={debouncedSearch}
              showHighRiskOnly={showHighRiskOnly}
              showOverdueOnly={showOverdueOnly}
            />
          )}

          {/* Error Display */}
          {error && !loading && <ErrorDisplay error={error} />}

          {/* Content: Loading, Empty States, or Patient Grid */}
          {loading ? (
            <PatientGridSkeleton />
          ) : showEmptyDb ? (
            <EmptyState
              isEmptyDatabase
              onClearSearch={clearSearch}
              onNewPatient={handleNewPatient}
            />
          ) : showEmptyResults ? (
            <EmptyState searchQuery={searchQuery} onClearSearch={clearSearch} />
          ) : (
            <>
              <div className="space-y-6">
                <PatientGrid
                  patients={paginatedPatients}
                  expandedCard={expandedCard}
                  onExpand={handleExpandCard}
                  onPatientClick={handlePatientClick}
                  onNewPatient={handleNewPatient}
                  showAddCard={showAddCard}
                />
              </div>
              <div className="mt-10 mb-6">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPatients.length}
                  currentItemsCount={paginatedPatients.length}
                  onPreviousPage={goToPreviousPage}
                  onNextPage={goToNextPage}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* ============================================================
          MOBILE FAB - Floating action button for adding patients
          ============================================================ */}
      <FloatingActionButton onClick={handleNewPatient} />
    </div>
  );
}
