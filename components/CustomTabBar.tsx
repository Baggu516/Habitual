import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';

const TAB_BAR_HEIGHT = 64;
const FAB_SIZE = 56;
const FAB_OVERLAP = 22;
const TAB_BAR_RADIUS = 24;

const FOOTER_BG = '#FFFFFF';
const FOOTER_BORDER = 'rgba(0, 0, 0, 0.08)';
const TAB_ACTIVE = Colors.primary;
const TAB_INACTIVE = '#9CA3AF';
const FAB_GREEN = Colors.primary;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const bottomInset = Math.max(insets?.bottom ?? 0, 8);
  const centerIndex = Math.floor(state.routes.length / 2);

  const barContent = (
    <View style={[styles.tabBar, { paddingBottom: bottomInset }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isCenter = index === centerIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        if (isCenter) {
          return (
            <View key={route.key} style={styles.centerSlot}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                  styles.fab,
                  pressed && styles.fabPressed,
                ]}
              >
                <Text style={styles.fabLabel}>+</Text>
              </Pressable>
            </View>
          );
        }

        const Icon = options.tabBarIcon;
        const tabColor = isFocused ? TAB_ACTIVE : TAB_INACTIVE;
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {Icon ? (
              <View style={styles.iconWrapper}>
                {Icon({
                  focused: isFocused,
                  color: tabColor,
                  size: 24,
                })}
              </View>
            ) : null}
            <Text style={[styles.label, { color: tabColor }]} numberOfLines={1}>
              {options.title ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const barHeight = TAB_BAR_HEIGHT + bottomInset + FAB_OVERLAP;

  return (
    <View style={[styles.wrapper, { height: barHeight }]}>
      <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
      {barContent}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBarBg: {
    backgroundColor: FOOTER_BG,
    borderTopLeftRadius: TAB_BAR_RADIUS,
    borderTopRightRadius: TAB_BAR_RADIUS,
    borderTopWidth: 1,
    borderTopColor: FOOTER_BORDER,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  iconWrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    marginTop: -FAB_OVERLAP,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: FAB_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
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
  fabLabel: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 32,
    marginTop: -2,
  },
});
