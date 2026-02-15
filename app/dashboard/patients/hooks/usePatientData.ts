import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { normalizePatient } from "@/lib/patients";
import type { Patient } from "@/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing patient data fetching and real-time updates
 */
export function usePatientData() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const refresh = useCallback(() => {
    fetchPatients(true);
  }, [fetchPatients]);

  return {
    patients,
    loading,
    refreshing,
    error,
    refresh,
  };
}
