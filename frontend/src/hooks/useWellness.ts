/**
 * Custom hook for wellness data fetching and state.
 */
import { useState, useEffect, useCallback } from "react";
import { wellnessApi } from "@/services/api";
import type { MoodEntry, WaterSummary, WeeklySummary } from "@/types";

export function useWellness() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [water, setWater] = useState<WaterSummary | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [tip, setTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [moodData, waterData, tipData] = await Promise.all([
        wellnessApi.getMoodHistory(7),
        wellnessApi.getWaterToday(),
        wellnessApi.getWellnessTip(),
      ]);
      setMoodHistory(moodData);
      setWater(waterData);
      setTip(tipData.tip);
    } catch {
      setError("Failed to load wellness data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await wellnessApi.getWeeklySummary();
      setSummary(data);
    } catch {
      setError("Failed to load weekly summary.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logWater = useCallback(async (amount_ml: number) => {
    const result = await wellnessApi.logWater(amount_ml);
    setWater({
      total_ml: result.total_ml,
      goal_ml: result.goal_ml,
      percentage: result.percentage,
    });
    return result;
  }, []);

  return {
    moodHistory,
    water,
    summary,
    tip,
    isLoading,
    error,
    loadDashboardData,
    loadSummary,
    logWater,
    setMoodHistory,
    setWater,
  };
}
