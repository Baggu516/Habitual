import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Layers, CheckCircle, Clock, TrendingUp, Plus, Sparkles, Menu } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { useHabits } from '@/providers/HabitProvider';
import DonutChart from '@/components/DonutChart';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { stats, habits, days, isLoading } = useHabits();

  const openMore = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tab)/settings' as any);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        {/* <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={openMore}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="sidebar-toggle"
        >
          <Menu size={24} color={Colors.headerText} />
        </TouchableOpacity> */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Hey👋, {user?.name?.split(' ')[0] ?? 'there'}
          </Text>
          <Text style={styles.headerDate}>{dateStr}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 32 + insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Sparkles size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Start your journey</Text>
            <Text style={styles.emptySubtitle}>
              Create your first habit and begin building a better routine
            </Text>
            <TouchableOpacity
              style={styles.createHabitBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(tab)/add' as any);
              }}
              activeOpacity={0.8}
              testID="create-habit-cta"
            >
              <Plus size={20} color={Colors.white} />
              <Text style={styles.createHabitBtnText}>Create Your First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.chartSection}>
              <View style={styles.chartCard}>
                <DonutChart percentage={stats.completionPercent} size={180} strokeWidth={14} />
                <Text style={styles.chartLabel}>Overall Completion</Text>
                <View style={styles.trackingBadge}>
                  <Clock size={12} color={Colors.textSecondary} />
                  <Text style={styles.trackingText}>{days}-day tracker</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  label="Total"
                  value={stats.totalHabits}
                  color={Colors.primary}
                  icon={<Layers size={16} color={Colors.primary} />}
                  delay={100}
                />
                <View style={styles.statGap} />
                <StatCard
                  label="Done"
                  value={stats.completedCells}
                  color={Colors.secondary}
                  icon={<CheckCircle size={16} color={Colors.secondary} />}
                  delay={200}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  label="Remaining"
                  value={stats.remainingCells}
                  color={Colors.accent}
                  icon={<Clock size={16} color={Colors.accent} />}
                  delay={300}
                />
                <View style={styles.statGap} />
                <StatCard
                  label="Rate"
                  value={`${stats.completionPercent}%`}
                  color={Colors.secondary}
                  icon={<TrendingUp size={16} color={Colors.secondary} />}
                  delay={400}
                />
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Habit Progress</Text>
              {stats.perHabit.map((h, i) => (
                <ProgressBar
                  key={h.habitId}
                  label={h.title}
                  percent={h.percent}
                  completed={h.completed}
                  total={h.total}
                  delay={200 + i * 100}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 0,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.headerText,
  },
  headerDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  createHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
    width: '100%',
  },
  createHabitBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    gap: 5,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  statsGrid: {
    marginBottom: 28,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statGap: {
    width: 10,
  },
  progressSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
});
