"use client";

/**
 * Patients list: real data from Supabase.
 * Data mapping (DB → UI, @/types Patient):
 *   full_name or name → Patient Name
 *   risk_level        → Status / Risk Level (badge)
 *   gestational_week  → Progress bar (40-week term = 100%)
 *   national_id      → Patient ID display (fallback: id slice)
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { normalizePatient } from "@/lib/patients";
import type { Patient } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  StatsBar,
  SearchFiltersBar,
  PatientGrid,
  PatientGridSkeleton,
  PaginationControls,
  EmptyState,
} from "@/components/patient-management";

const ITEMS_PER_PAGE = 12;

/** Search: full_name or name, phone_number. High Risk toggle: risk_level in ('high', 'critical'). */
function filterPatients(
  patients: Patient[],
  query: string,
  showHighRiskOnly: boolean,
  showOverdueOnly: boolean,
): Patient[] {
  const q = query.trim().toLowerCase();
  return patients.filter((p) => {
    const name = (p.full_name ?? p.name ?? "").toLowerCase();
    const matchesSearch =
      !q ||
      name.includes(q) ||
      p.phone_number.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.national_id ?? "").toLowerCase().includes(q);

    const matchesHighRisk =
      !showHighRiskOnly ||
      p.risk_level === "high" ||
      p.risk_level === "critical";

    const isOverdue = p.due_date != null && new Date(p.due_date) < new Date();
    const matchesOverdue = !showOverdueOnly || isOverdue;

    return matchesSearch && matchesHighRisk && matchesOverdue;
  });
}

export default function PatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchPatients = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const list = (data ?? []).map((row) =>
          normalizePatient(row as Record<string, unknown>),
        );
        setPatients(list);
        if (isRefresh) {
          toast({
            title: "Patients updated",
            description: "Patient list has been refreshed successfully.",
          });
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load patients";
        setError(errorMessage);
        setPatients([]);
        toast({
          title: "Error loading patients",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchPatients();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("patients-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
        },
        () => {
          // Silently refresh when changes occur
          fetchPatients(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatients]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const filteredPatients = useMemo(
    () =>
      filterPatients(
        patients,
        debouncedSearch,
        showHighRiskOnly,
        showOverdueOnly,
      ),
    [patients, debouncedSearch, showHighRiskOnly, showOverdueOnly],
  );

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / ITEMS_PER_PAGE),
  );

  const highRiskCount = useMemo(
    () =>
      patients.filter(
        (p) => p.risk_level === "high" || p.risk_level === "critical",
      ).length,
    [patients],
  );

  const handleRefresh = useCallback(() => {
    fetchPatients(true);
  }, [fetchPatients]);

  const handlePatientClick = useCallback(
    (patientId: string) => {
      router.push(`/dashboard/patients/${patientId}`);
    },
    [router],
  );

  const handleNewPatient = useCallback(() => {
    router.push("/dashboard/patients/new");
  }, [router]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setShowHighRiskOnly(false);
    setShowOverdueOnly(false);
    setCurrentPage(1);
  }, []);

  const toggleHighRiskFilter = useCallback(() => {
    setShowHighRiskOnly((prev) => !prev);
    setCurrentPage(1);
  }, []);

  const toggleOverdueFilter = useCallback(() => {
    setShowOverdueOnly((prev) => !prev);
    setCurrentPage(1);
  }, []);

  const handleExpandCard = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const showAddCard =
    !searchQuery && !showHighRiskOnly && !showOverdueOnly && currentPage === 1;
  const hasActiveFilters = searchQuery || showHighRiskOnly || showOverdueOnly;
  const showEmptyDb =
    !loading && !refreshing && !hasActiveFilters && patients.length === 0;
  const showEmptyResults =
    !loading &&
    !refreshing &&
    hasActiveFilters &&
    filteredPatients.length === 0;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900">
              Patient Management
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {patients.length} total patients • {highRiskCount} high risk
            {hasActiveFilters && ` • ${filteredPatients.length} filtered`}
          </p>
        </div>
      </div>

      <StatsBar patients={patients} />

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
        onRefresh={handleRefresh}
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-10">
        <div className="max-w-[1600px] mx-auto w-full">
          {hasActiveFilters && (
            <div className="mb-4 text-sm text-slate-600">
              Found{" "}
              <strong className="text-slate-900">
                {filteredPatients.length}
              </strong>{" "}
              patient
              {filteredPatients.length !== 1 ? "s" : ""}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
              {showHighRiskOnly && " (high risk)"}
              {showOverdueOnly && " (overdue)"}
            </div>
          )}

          {error && !loading && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

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
              <div className="mt-10">
                <PatientGrid
                  patients={paginatedPatients}
                  expandedCard={expandedCard}
                  onExpand={handleExpandCard}
                  onPatientClick={handlePatientClick}
                  onNewPatient={handleNewPatient}
                  showAddCard={showAddCard}
                />
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPatients.length}
                currentItemsCount={paginatedPatients.length}
                onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNextPage={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </>
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={handleNewPatient}
        className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        aria-label="Add new patient"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
