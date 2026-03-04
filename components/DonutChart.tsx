import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({
  percentage,
  size = 200,
  strokeWidth = 14,
}: DonutChartProps) {
  const [displayPercent, setDisplayPercent] = useState(0);
  const frameRef = useRef<number>(0);
  const prevPercentRef = useRef(0);

  useEffect(() => {
    const startVal = prevPercentRef.current;
    const endVal = percentage;
    const startTime = Date.now();
    const duration = 1000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayPercent(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevPercentRef.current = endVal;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * displayPercent) / 100;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {displayPercent > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.secondary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
          />
        )}
      </Svg>
      <View style={styles.centerContent}>
        <Text style={styles.percentText}>{displayPercent}</Text>
        <Text style={styles.percentSign}>%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  percentText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -1,
  },
  percentSign: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginLeft: 2,
  },
});
