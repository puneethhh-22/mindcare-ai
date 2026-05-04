/**
 * Custom hook for medication management.
 */
import { useState, useCallback } from "react";
import { medicationsApi } from "@/services/api";
import type { Medication, AdherenceStats } from "@/types";

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState<AdherenceStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [meds, stats] = await Promise.all([
        medicationsApi.list(),
        medicationsApi.getAdherence(),
      ]);
      setMedications(meds);
      setAdherence(stats);
    } catch {
      setError("Failed to load medications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logTaken = useCallback(
    async (id: string, status: "taken" | "skipped") => {
      await medicationsApi.logTaken(id, status);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      await medicationsApi.delete(id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
    },
    []
  );

  return { medications, adherence, isLoading, error, load, logTaken, remove };
}
