import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Archive,
  ChevronDown,
  Trash2,
  CheckCircle,
  TrendingUp,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/providers/HabitProvider';
import { HistoryEntry } from '@/types/habit';

function HistoryCard({
  entry,
  index,
  onDelete,
}: {
  entry: HistoryEntry;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const toggleExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = expanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
    setExpanded(!expanded);
  }, [expanded, expandAnim]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete History',
      'Remove this completed session from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete(entry.id);
          },
        },
      ]
    );
  }, [entry.id, onDelete]);

  const completedDate = new Date(entry.completedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, entry.habits.length * 52 + 16],
  });

  const rotateChevron = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.percentBadge,
              {
                backgroundColor:
                  entry.stats.completionPercent >= 80
                    ? Colors.secondaryGlow
                    : entry.stats.completionPercent >= 50
                    ? Colors.primaryGlow
                    : Colors.dangerGlow,
              },
            ]}
          >
            <Text
              style={[
                styles.percentText,
                {
                  color:
                    entry.stats.completionPercent >= 80
                      ? Colors.secondary
                      : entry.stats.completionPercent >= 50
                      ? Colors.primary
                      : Colors.danger,
                },
              ]}
            >
              {entry.stats.completionPercent}%
            </Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>
              {entry.habits.length} habit{entry.habits.length !== 1 ? 's' : ''} · {entry.days} days
            </Text>
            <Text style={styles.cardDate}>
              {startDate} — {completedDate}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteIcon}
          >
            <Trash2 size={16} color={Colors.danger} />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <CheckCircle size={12} color={Colors.secondary} />
          <Text style={styles.miniStatText}>
            {entry.stats.completedCells}/{entry.stats.totalCells}
          </Text>
        </View>
        <View style={styles.miniStat}>
          <TrendingUp size={12} color={Colors.primary} />
          <Text style={styles.miniStatText}>{entry.stats.completionPercent}% done</Text>
        </View>
      </View>

      <Animated.View style={[styles.expandSection, { maxHeight, overflow: 'hidden' }]}>
        <View style={styles.habitsList}>
          {entry.stats.perHabit.map((h) => (
            <View key={h.habitId} style={styles.habitRow}>
              <View style={styles.habitDot} />
              <Text style={styles.habitName} numberOfLines={1}>
                {h.title}
              </Text>
              <View style={styles.habitProgress}>
                <View style={styles.habitBarBg}>
                  <View
                    style={[
                      styles.habitBarFill,
                      {
                        width: `${h.percent}%`,
                        backgroundColor:
                          h.percent >= 80
                            ? Colors.secondary
                            : h.percent >= 50
                            ? Colors.primary
                            : Colors.danger,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.habitPercent}>{h.percent}%</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, deleteHistoryEntry } = useHabits();

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Archive size={48} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No history yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete a tracking session in Settings to archive it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 32 + insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Flame size={18} color={Colors.accent} />
        <Text style={styles.headerText}>
          {history.length} completed session{history.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {history.map((entry, i) => (
        <HistoryCard
          key={entry.id}
          entry={entry}
          index={i}
          onDelete={deleteHistoryEntry}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  percentBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteIcon: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniStatText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  expandSection: {},
  habitsList: {
    marginTop: 12,
    gap: 8,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  habitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginRight: 10,
  },
  habitName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  habitProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitBarBg: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  habitBarFill: {
    height: 5,
    borderRadius: 3,
  },
  habitPercent: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
});
