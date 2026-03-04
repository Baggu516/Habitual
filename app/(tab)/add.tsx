import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Trash2,
  Crown,
  Calendar,
  Flame,
  ArchiveRestore,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/providers/HabitProvider';
import { DAY_OPTIONS, FREE_HABIT_LIMIT, FREE_DAYS_LIMIT } from '@/types/habit';

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { habits, days, updateDays, addHabit, deleteHabit, archiveAndStartNew, stats, isLoading, isFree } = useHabits();
  const [newHabit, setNewHabit] = useState('');

  const handleAddHabit = useCallback(() => {
    if (!newHabit.trim()) return;
    try {
      addHabit(newHabit.trim());
      setNewHabit('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add habit';
      Alert.alert('Limit Reached', msg);
    }
  }, [newHabit, addHabit]);

  const handleDeleteHabit = useCallback(
    (id: string, title: string) => {
      Alert.alert('Delete Habit', `Remove "${title}"? This will clear its tracking data.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabit(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]);
    },
    [deleteHabit]
  );

  const handleDaysChange = useCallback(
    (d: number) => {
      try {
        updateDays(d);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to update days';
        Alert.alert('Limit Reached', msg);
      }
    },
    [updateDays]
  );

  const handleArchive = useCallback(() => {
    if (habits.length === 0) {
      Alert.alert('No Habits', 'Add some habits first before completing a session.');
      return;
    }
    Alert.alert(
      'Complete & Start New',
      `This will archive your current session (${stats.completionPercent}% done) and reset all checkboxes. Your habits will remain. You can view archived sessions in the History tab.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive & Reset',
          onPress: () => {
            archiveAndStartNew();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, [habits.length, stats.completionPercent, archiveAndStartNew]);

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Habits</Text>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 40 + insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { marginTop: 8 }]}>
          <View style={styles.sectionHeader}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Tracking Days</Text>
            {isFree && (
              <Text style={styles.limitBadge}>Max {FREE_DAYS_LIMIT} days</Text>
            )}
          </View>
          <View style={styles.daysRow}>
            {DAY_OPTIONS.map((d) => {
              const active = days === d;
              const disabled = isFree && d > FREE_DAYS_LIMIT;
              return (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dayPill,
                    active && styles.dayPillActive,
                    disabled && styles.dayPillDisabled,
                  ]}
                  onPress={() => handleDaysChange(d)}
                  disabled={disabled}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      active && styles.dayPillTextActive,
                      disabled && styles.dayPillTextDisabled,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Flame size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>My Habits</Text>
            <Text style={styles.habitCount}>
              {habits.length}
              {isFree ? `/${FREE_HABIT_LIMIT}` : ''}
            </Text>
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="New habit name..."
              placeholderTextColor={Colors.textMuted}
              value={newHabit}
              onChangeText={setNewHabit}
              onSubmitEditing={handleAddHabit}
              returnKeyType="done"
              testID="add-habit-input"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !newHabit.trim() && styles.addButtonDisabled,
              ]}
              onPress={handleAddHabit}
              disabled={!newHabit.trim()}
              activeOpacity={0.7}
              testID="add-habit-button"
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyHabits}>
              <Text style={styles.emptyHabitsText}>
                No habits added yet. Add your first one above!
              </Text>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habits.map((h, idx) => (
                <View
                  key={h.id}
                  style={[
                    styles.habitItem,
                    idx === habits.length - 1 && styles.habitItemLast,
                  ]}
                >
                  <View style={styles.habitDot} />
                  <Text style={styles.habitTitle} numberOfLines={1}>
                    {h.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteHabit(h.id, h.title)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    testID={`delete-${h.id}`}
                  >
                    <Trash2 size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* {habits.length > 0 && (
          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={handleArchive}
            activeOpacity={0.7}
            testID="archive-button"
          >
            <ArchiveRestore size={18} color={Colors.secondary} />
            <View style={styles.archiveBtnInfo}>
              <Text style={styles.archiveBtnTitle}>Complete & Start New</Text>
              <Text style={styles.archiveBtnSubtitle}>
                Archive current session and reset checkboxes
              </Text>
            </View>
          </TouchableOpacity>
        )} */}

        {isFree && (
          <View style={styles.upgradeCard}>
            <Crown size={20} color={Colors.accent} />
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Unlock Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlimited habits, 30+ day tracking, and more
              </Text>
            </View>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  limitBadge: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  habitCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayPill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  dayPillDisabled: {
    opacity: 0.35,
  },
  dayPillText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  dayPillTextActive: {
    color: Colors.primary,
  },
  dayPillTextDisabled: {
    color: Colors.textMuted,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  addInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  emptyHabits: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyHabitsText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  habitsList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  habitItemLast: {
    borderBottomWidth: 0,
  },
  habitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginRight: 12,
  },
  habitTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  deleteBtn: {
    padding: 6,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.2)',
    gap: 14,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryGlow,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 167, 0.2)',
    gap: 14,
  },
  archiveBtnInfo: {
    flex: 1,
  },
  archiveBtnTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.secondary,
    marginBottom: 2,
  },
  archiveBtnSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
