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
} from '@/types/habit';

export type GridLayout = 'habits-rows' | 'days-rows';

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
  const [completions, setCompletions] = useState<CompletionData>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [gridLayout, setGridLayoutState] = useState<GridLayout>('habits-rows');

  const keys = user ? storageKeys(user.id) : null;

  const dataQuery = useQuery({
    queryKey: ['habitData', user?.id],
    queryFn: async () => {
      if (!keys) return null;
      const [hRaw, cRaw, dRaw, histRaw, layoutRaw] = await Promise.all([
        AsyncStorage.getItem(keys.habits),
        AsyncStorage.getItem(keys.completions),
        AsyncStorage.getItem(keys.config),
        AsyncStorage.getItem(keys.history),
        AsyncStorage.getItem(keys.gridLayout),
      ]);
      const layout: GridLayout = layoutRaw === 'days-rows' ? 'days-rows' : 'habits-rows';
      return {
        habits: hRaw ? (JSON.parse(hRaw) as Habit[]) : [],
        days: dRaw ? (JSON.parse(dRaw) as number) : DEFAULT_DAYS,
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
      setCompletions(dataQuery.data.completions);
      setHistory(dataQuery.data.history);
      setGridLayoutState(dataQuery.data.gridLayout ?? 'habits-rows');
    }
  }, [dataQuery.data]);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setDays(DEFAULT_DAYS);
      setCompletions({});
      setHistory([]);
      setGridLayoutState('habits-rows');
    }
  }, [user]);

  const setGridLayout = useCallback(
    (layout: GridLayout) => {
      setGridLayoutState(layout);
      if (keys) AsyncStorage.setItem(keys.gridLayout, layout);
    },
    [keys]
  );

  const persist = useCallback(
    async (h: Habit[], d: number, c: CompletionData) => {
      if (!keys) return;
      await Promise.all([
        AsyncStorage.setItem(keys.habits, JSON.stringify(h)),
        AsyncStorage.setItem(keys.config, JSON.stringify(d)),
        AsyncStorage.setItem(keys.completions, JSON.stringify(c)),
      ]);
    },
    [keys]
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
      setDays(newDays);
      setCompletions(nc);
      persist(habits, newDays, nc);
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

    setHabits([]);
    setCompletions({});
    persist([], days, {});
  }, [habits, days, completions, history, persist, persistHistory]);

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
    isLoading: dataQuery.isLoading && !!user,
    addHabit,
    editHabit,
    deleteHabit,
    toggleCell,
    updateDays,
    archiveAndStartNew,
    deleteHistoryEntry,
    isFree: user?.subscriptionType === 'free',
  };
});
