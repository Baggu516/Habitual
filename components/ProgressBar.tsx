import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  label: string;
  percent: number;
  completed: number;
  total: number;
  delay?: number;
}

export default function ProgressBar({
  label,
  percent,
  completed,
  total,
  delay = 0,
}: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(widthAnim, {
        toValue: percent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [percent, delay, widthAnim]);

  const barColor =
    percent >= 80
      ? Colors.secondary
      : percent >= 50
        ? Colors.accent
        : percent >= 25
          ? Colors.primary
          : Colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.stats, { color: barColor }]}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.trackOuter}>
        <Animated.View
          style={[
            styles.trackFill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[styles.percentText, { color: barColor }]}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  stats: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  trackOuter: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 6,
    textAlign: 'right' as const,
  },
});
