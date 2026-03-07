import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from '@/providers/AuthProvider';
import {
  Habit,
  CompletionData,
  HabitStats,
  HistoryEntry,
  DEFAULT_DAYS,
  FREE_HABIT_LIMIT,
  FREE_DAYS_LIMIT,
  HabitConfig,
} from '@/types/habit';

export type GridLayout = 'habits-rows' | 'days-rows';

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDefaultStartDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return toYYYYMMDD(d);
}

function addDays(dateStr: string, daysToAdd: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + daysToAdd);
  return toYYYYMMDD(d);
}

function getDateForDayIndex(startDate: string, dayIndex: number): string {
  return addDays(startDate, dayIndex);
}

function isPastDate(startDate: string, dayIndex: number): boolean {
  const today = toYYYYMMDD(new Date());
  const cellDate = getDateForDayIndex(startDate, dayIndex);
  return cellDate < today;
}

function parseConfig(raw: string | null): HabitConfig {
  if (!raw) return { days: DEFAULT_DAYS };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'number') return { days: parsed };
    return {
      days: typeof parsed.days === 'number' ? parsed.days : DEFAULT_DAYS,
      trackingStartDate:
        typeof parsed.trackingStartDate === 'string' ? parsed.trackingStartDate : undefined,
    };
  } catch {
    return { days: DEFAULT_DAYS };
  }
}

function storageKeys(userId: string) {
  return {
    habits: `@habitual_habits_${userId}`,
    config: `@habitual_config_${userId}`,
    completions: `@habitual_completions_${userId}`,
    history: `@habitual_history_${userId}`,
    gridLayout: `@habitual_gridLayout_${userId}`,
  };
}

function computeStats(habits: Habit[], days: number, completions: CompletionData): HabitStats {
  const totalHabits = habits.length;
  let completedCells = 0;
  const totalCells = totalHabits * days;
  const perHabit = habits.map((h) => {
    const arr = completions[h.id] || [];
    const completed = arr.filter(Boolean).length;
    completedCells += completed;
    return {
      habitId: h.id,
      title: h.title,
      completed,
      total: days,
      percent: days > 0 ? Math.round((completed / days) * 100) : 0,
    };
  });
  return {
    totalHabits,
    totalCells,
    completedCells,
    remainingCells: totalCells - completedCells,
    completionPercent: totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0,
    perHabit,
  };
}

export const [HabitProvider, useHabits] = createContextHook(() => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [days, setDays] = useState<number>(DEFAULT_DAYS);
  const [trackingStartDate, setTrackingStartDateState] = useState<string | undefined>(undefined);
  const [completions, setCompletions] = useState<CompletionData>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [gridLayout, setGridLayoutState] = useState<GridLayout>('habits-rows');

  const keys = user ? storageKeys(user.id) : null;

  const dataQuery = useQuery({
    queryKey: ['habitData', user?.id],
    queryFn: async () => {
      if (!keys) return null;
      const [hRaw, cRaw, configRaw, histRaw, layoutRaw] = await Promise.all([
        AsyncStorage.getItem(keys.habits),
        AsyncStorage.getItem(keys.completions),
        AsyncStorage.getItem(keys.config),
        AsyncStorage.getItem(keys.history),
        AsyncStorage.getItem(keys.gridLayout),
      ]);
      const layout: GridLayout = layoutRaw === 'days-rows' ? 'days-rows' : 'habits-rows';
      const config = parseConfig(configRaw);
      return {
        habits: hRaw ? (JSON.parse(hRaw) as Habit[]) : [],
        days: config.days,
        trackingStartDate: config.trackingStartDate,
        completions: cRaw ? (JSON.parse(cRaw) as CompletionData) : {},
        history: histRaw ? (JSON.parse(histRaw) as HistoryEntry[]) : [],
        gridLayout: layout,
      };
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dataQuery.data) {
      setHabits(dataQuery.data.habits);
      setDays(dataQuery.data.days);
      setTrackingStartDateState(dataQuery.data.trackingStartDate);
      setCompletions(dataQuery.data.completions);
      setHistory(dataQuery.data.history);
      setGridLayoutState(dataQuery.data.gridLayout ?? 'habits-rows');
    }
  }, [dataQuery.data]);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setDays(DEFAULT_DAYS);
      setTrackingStartDateState(undefined);
      setCompletions({});
      setHistory([]);
      setGridLayoutState('habits-rows');
    }
  }, [user]);

  const resolvedStartDate = useMemo(
    () => trackingStartDate ?? getDefaultStartDate(days),
    [trackingStartDate, days]
  );

  const getDateForDayIndexExport = useCallback(
    (dayIndex: number) => getDateForDayIndex(resolvedStartDate, dayIndex),
    [resolvedStartDate]
  );

  const isPastDateExport = useCallback(
    (dayIndex: number) => isPastDate(resolvedStartDate, dayIndex),
    [resolvedStartDate]
  );

  const setTrackingStartDate = useCallback(
    (dateStr: string) => {
      setTrackingStartDateState(dateStr);
      if (keys) {
        const config: HabitConfig = { days, trackingStartDate: dateStr };
        AsyncStorage.setItem(keys.config, JSON.stringify(config));
      }
    },
    [days, keys]
  );

  const setGridLayout = useCallback(
    (layout: GridLayout) => {
      setGridLayoutState(layout);
      if (keys) AsyncStorage.setItem(keys.gridLayout, layout);
    },
    [keys]
  );

  const persist = useCallback(
    async (h: Habit[], d: number, c: CompletionData, startDate?: string) => {
      if (!keys) return;
      const config: HabitConfig = {
        days: d,
        trackingStartDate: startDate ?? trackingStartDate ?? undefined,
      };
      await Promise.all([
        AsyncStorage.setItem(keys.habits, JSON.stringify(h)),
        AsyncStorage.setItem(keys.config, JSON.stringify(config)),
        AsyncStorage.setItem(keys.completions, JSON.stringify(c)),
      ]);
    },
    [keys, trackingStartDate]
  );

  const persistHistory = useCallback(
    async (entries: HistoryEntry[]) => {
      if (!keys) return;
      await AsyncStorage.setItem(keys.history, JSON.stringify(entries));
    },
    [keys]
  );

  const addHabit = useCallback(
    (title: string) => {
      if (user?.subscriptionType === 'free' && habits.length >= FREE_HABIT_LIMIT) {
        throw new Error(`Free plan limited to ${FREE_HABIT_LIMIT} habits`);
      }
      const newHabit: Habit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: title.trim(),
        createdAt: new Date().toISOString(),
      };
      const nh = [...habits, newHabit];
      const nc = { ...completions, [newHabit.id]: new Array(days).fill(false) as boolean[] };
      setHabits(nh);
      setCompletions(nc);
      persist(nh, days, nc);
    },
    [habits, days, completions, user, persist]
  );

  const editHabit = useCallback(
    (id: string, title: string) => {
      const nh = habits.map((h) => (h.id === id ? { ...h, title: title.trim() } : h));
      setHabits(nh);
      persist(nh, days, completions);
    },
    [habits, days, completions, persist]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      const nh = habits.filter((h) => h.id !== id);
      const nc = { ...completions };
      delete nc[id];
      setHabits(nh);
      setCompletions(nc);
      persist(nh, days, nc);
    },
    [habits, days, completions, persist]
  );

  const toggleCell = useCallback(
    (habitId: string, dayIndex: number) => {
      const nc = { ...completions };
      if (!nc[habitId]) {
        nc[habitId] = new Array(days).fill(false) as boolean[];
      }
      nc[habitId] = [...nc[habitId]];
      nc[habitId][dayIndex] = !nc[habitId][dayIndex];
      setCompletions(nc);
      if (keys) {
        AsyncStorage.setItem(keys.completions, JSON.stringify(nc));
      }
    },
    [completions, days, keys]
  );

  const updateDays = useCallback(
    (newDays: number) => {
      if (user?.subscriptionType === 'free' && newDays > FREE_DAYS_LIMIT) {
        throw new Error(`Free plan limited to ${FREE_DAYS_LIMIT} days`);
      }
      const nc: CompletionData = {};
      for (const hid of Object.keys(completions)) {
        const old = completions[hid] || [];
        if (newDays > old.length) {
          nc[hid] = [...old, ...(new Array(newDays - old.length).fill(false) as boolean[])];
        } else {
          nc[hid] = old.slice(0, newDays);
        }
      }
      const newStartDate = getDefaultStartDate(newDays);
      setDays(newDays);
      setTrackingStartDateState(newStartDate);
      setCompletions(nc);
      persist(habits, newDays, nc, newStartDate);
    },
    [completions, habits, user, persist]
  );

  const archiveAndStartNew = useCallback(() => {
    if (habits.length === 0) return;

    const currentStats = computeStats(habits, days, completions);

    const earliestHabit = habits.reduce((earliest, h) => {
      return h.createdAt < earliest ? h.createdAt : earliest;
    }, habits[0].createdAt);

    const entry: HistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      habits: [...habits],
      days,
      completions: { ...completions },
      stats: currentStats,
      completedAt: new Date().toISOString(),
      createdAt: earliestHabit,
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    persistHistory(newHistory);

    // Clear habits and completions so user can create new ones.
    setHabits([]);
    setCompletions({});
    persist([], days, {});
  }, [habits, days, completions, history, persist, persistHistory]);

  /** Reset all checkboxes without archiving. Keeps habits and period. */
  const resetCompletionsOnly = useCallback(() => {
    if (habits.length === 0) return;
    const nc: CompletionData = {};
    habits.forEach((h) => {
      nc[h.id] = new Array(days).fill(false) as boolean[];
    });
    setCompletions(nc);
    persist(habits, days, nc);
  }, [habits, days, persist]);

  const deleteHistoryEntry = useCallback(
    (id: string) => {
      const newHistory = history.filter((h) => h.id !== id);
      setHistory(newHistory);
      persistHistory(newHistory);
    },
    [history, persistHistory]
  );

  const stats: HabitStats = useMemo(
    () => computeStats(habits, days, completions),
    [habits, completions, days]
  );

  return {
    habits,
    days,
    completions,
    stats,
    history,
    gridLayout,
    setGridLayout,
    trackingStartDate: resolvedStartDate,
    getDateForDayIndex: getDateForDayIndexExport,
    isPastDate: isPastDateExport,
    setTrackingStartDate,
    isLoading: dataQuery.isLoading && !!user,
    addHabit,
    editHabit,
    deleteHabit,
    toggleCell,
    updateDays,
    archiveAndStartNew,
    resetCompletionsOnly,
    deleteHistoryEntry,
    isFree: user?.subscriptionType === 'free',
  };
});
