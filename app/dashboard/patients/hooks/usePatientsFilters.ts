import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Patient } from "@/types";

const ITEMS_PER_PAGE = 12;

/**
 * Filter patients based on search query and risk level
 */
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

/**
 * Custom hook for managing patient filters, search, and pagination
 */
export function usePatientsFilters(patients: Patient[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const hasActiveFilters = searchQuery || showHighRiskOnly || showOverdueOnly;

  return {
    // State
    searchQuery,
    debouncedSearch,
    currentPage,
    showHighRiskOnly,
    showOverdueOnly,
    hasActiveFilters,
    // Computed
    filteredPatients,
    paginatedPatients,
    totalPages,
    // Actions
    handleSearch,
    clearSearch,
    toggleHighRiskFilter,
    toggleOverdueFilter,
    goToPreviousPage,
    goToNextPage,
  };
}
