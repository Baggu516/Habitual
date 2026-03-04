import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Target, MoreVertical, Columns3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/providers/HabitProvider';

const CELL_SIZE = 44;
const CELL_GAP = 4;
const LABEL_WIDTH = 110;

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const { habits, days, completions, toggleCell, stats, archiveAndStartNew, isLoading, gridLayout, setGridLayout } = useHabits();

  const handleToggle = useCallback(
    (habitId: string, dayIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleCell(habitId, dayIndex);
    },
    [toggleCell]
  );

  const handleComplete = useCallback(() => {
    if (habits.length === 0) {
      Alert.alert('No Habits', 'Add some habits first before completing a session.');
      return;
    }
    Alert.alert(
      'Complete Session',
      `Archive this session (${stats.completionPercent}% done) and reset all checkboxes?\n\nYour habits will remain. View archived sessions in History.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete & Archive',
          onPress: () => {
            archiveAndStartNew();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [habits.length, stats.completionPercent, archiveAndStartNew]);

  const handleStartFresh = useCallback(() => {
    if (habits.length === 0) return;
    const hasAnyProgress = Object.values(completions).some((arr) =>
      arr.some(Boolean)
    );
    if (!hasAnyProgress) {
      Alert.alert('Already Fresh', 'All checkboxes are already unchecked.');
      return;
    }
    Alert.alert(
      'Start Fresh',
      'Reset all checkboxes without archiving? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            archiveAndStartNew();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }, [habits.length, completions, archiveAndStartNew]);

  const openFABMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Session actions',
      undefined,
      [
        { text: 'Complete & Archive', onPress: handleComplete },
        { text: 'Start Fresh', onPress: handleStartFresh },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [handleComplete, handleStartFresh]);

  const isDaysAsRows = gridLayout === 'days-rows';
  const toggleLayout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGridLayout(isDaysAsRows ? 'habits-rows' : 'days-rows');
  }, [isDaysAsRows, setGridLayout]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Target size={48} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No habits to track</Text>
        <Text style={styles.emptySubtitle}>
          Add habits in Settings to see your tracking matrix here
        </Text>
      </View>
    );
  }

  const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
  const allComplete = stats.completionPercent === 100;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 + insets.bottom + 100 }]}
      >
        {allComplete && (
          <View style={styles.completeBanner}>
            <Text style={styles.completeBannerText}>All habits completed! Ready to archive?</Text>
          </View>
        )}

        {/* Layout toggle: Rows ↔ Columns */}
        <View style={styles.layoutToggleRow}>
          <Text style={styles.layoutToggleLabel}>Layout</Text>
          <TouchableOpacity
            style={styles.layoutToggleBtn}
            onPress={toggleLayout}
            activeOpacity={0.7}
          >
            <Columns3 size={18} color={Colors.primary} />
            <Text style={styles.layoutToggleText}>
              {isDaysAsRows ? 'Days as rows' : 'Habits as rows'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isDaysAsRows ? (
          /* Default: Habits as rows (left), Days as columns (top) */
          <View style={styles.matrixContainer}>
            <View style={styles.fixedColumn}>
              <View style={[styles.cornerCell, styles.cornerCellHabits, { height: CELL_SIZE }]}>
                <Text style={styles.cornerTextColored}>Habits</Text>
              </View>
              {habits.map((h) => (
                <View key={h.id} style={[styles.labelCell, { height: CELL_SIZE }]}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {h.title}
                  </Text>
                </View>
              ))}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.gridScroll}
            >
              <View>
                <View style={styles.dayHeaderRow}>
                  {dayNumbers.map((d) => (
                    <View key={d} style={[styles.dayHeaderCell, styles.dayHeaderCellColored]}>
                      <Text style={styles.dayHeaderTextColored}>D{d}</Text>
                    </View>
                  ))}
                </View>
                {habits.map((h) => (
                  <View key={h.id} style={styles.habitRow}>
                    {dayNumbers.map((_, di) => {
                      const done = completions[h.id]?.[di] ?? false;
                      return (
                        <TouchableOpacity
                          key={di}
                          style={[styles.cell, done ? styles.cellDone : styles.cellEmpty]}
                          onPress={() => handleToggle(h.id, di)}
                          activeOpacity={0.7}
                          testID={`cell-${h.id}-${di}`}
                        >
                          {done && <Check size={18} color={Colors.white} strokeWidth={3} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          /* Swapped: Days as rows (left), Habits as columns (top) */
          <View style={styles.matrixContainer}>
            <View style={styles.fixedColumn}>
              <View style={[styles.cornerCell, styles.cornerCellDays, { height: CELL_SIZE }]}>
                <Text style={styles.cornerTextDays}>Days</Text>
              </View>
              {dayNumbers.map((d) => (
                <View key={d} style={[styles.labelCell, { height: CELL_SIZE }]}>
                  <Text style={styles.labelTextDays}>D{d}</Text>
                </View>
              ))}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.gridScroll}
            >
              <View>
                <View style={styles.dayHeaderRow}>
                  {habits.map((h) => (
                    <View key={h.id} style={[styles.dayHeaderCell, styles.dayHeaderCellHabit]}>
                      <Text style={styles.dayHeaderTextHabit} numberOfLines={1}>
                        {h.title}
                      </Text>
                    </View>
                  ))}
                </View>
                {dayNumbers.map((_, di) => (
                  <View key={di} style={styles.habitRow}>
                    {habits.map((h) => {
                      const done = completions[h.id]?.[di] ?? false;
                      return (
                        <TouchableOpacity
                          key={h.id}
                          style={[styles.cell, done ? styles.cellDone : styles.cellEmpty]}
                          onPress={() => handleToggle(h.id, di)}
                          activeOpacity={0.7}
                          testID={`cell-${h.id}-${di}`}
                        >
                          {done && <Check size={18} color={Colors.white} strokeWidth={3} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* Floating action button – bottom right */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: 24 + insets.bottom + 80 },
          pressed && styles.fabPressed,
        ]}
        onPress={openFABMenu}
        testID="activities-fab"
      >
        <MoreVertical size={24} color={Colors.white} />
      </Pressable>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: Colors.border,
              },
            ]}
          />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressPillText}>{stats.completionPercent}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  completeBanner: {
    backgroundColor: Colors.secondaryGlow,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  completeBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.secondary,
    textAlign: 'center',
  },
  layoutToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 12,
   
    borderRadius: 10,
    paddingVertical: 8,
    gap: 12,
  },
  layoutToggleLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  layoutToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryGlow,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  layoutToggleText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  matrixContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  fixedColumn: {
    marginRight: 2,
  },
  cornerCell: {
    width: LABEL_WIDTH,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: CELL_GAP,
  },
  cornerCellHabits: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  cornerCellDays: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.accent,
  },
  cornerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  cornerTextColored: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  cornerTextDays: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  labelCell: {
    width: LABEL_WIDTH,
    justifyContent: 'center',
    paddingRight: 10,
    marginBottom: CELL_GAP,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  labelTextDays: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  gridScroll: {
    paddingRight: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    height: CELL_SIZE,
    marginBottom: CELL_GAP,
  },
  dayHeaderCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CELL_GAP,
  },
  dayHeaderCellColored: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.accent,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 8,
  },
  dayHeaderCellHabit: {
    width: CELL_SIZE,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  dayHeaderTextColored: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  dayHeaderTextHabit: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  habitRow: {
    flexDirection: 'row',
    marginBottom: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CELL_GAP,
  },
  cellDone: {
    backgroundColor: Colors.secondary,
  },
  cellEmpty: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabPressed: {
    opacity: 0.9,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  progressPill: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
