export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  subscriptionType: 'free' | 'premium';
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
}

export interface CompletionData {
  [habitId: string]: boolean[];
}

export interface HabitStat {
  habitId: string;
  title: string;
  completed: number;
  total: number;
  percent: number;
}

export interface HabitStats {
  totalHabits: number;
  totalCells: number;
  completedCells: number;
  remainingCells: number;
  completionPercent: number;
  perHabit: HabitStat[];
}

export interface HistoryEntry {
  id: string;
  habits: Habit[];
  days: number;
  completions: CompletionData;
  stats: HabitStats;
  completedAt: string;
  createdAt: string;
}

export const FREE_HABIT_LIMIT = 5;
export const FREE_DAYS_LIMIT = 7;
export const DEFAULT_DAYS = 7;
export const DAY_OPTIONS = [7, 14, 21, 30] as const;
