import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PopupAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface BeautifulPopupProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actions: PopupAction[];
  showCloseButton?: boolean;
}

export default function BeautifulPopup({
  visible,
  onRequestClose,
  title,
  message,
  icon,
  actions,
  showCloseButton = false,
}: BeautifulPopupProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      scale.setValue(0.85);
    }
  }, [visible, overlayOpacity, scale]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop – visual only; tap-to-close is the View below so card stays on top */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          />
        </View>

        {/* Invisible full-area touch to close when tapping outside card */}
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 0, elevation: 0 }]}
          onPress={onRequestClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        {/* Card – above backdrop so buttons receive touches */}
        <View
          style={[styles.centered, { zIndex: 1, elevation: 1 }]}
          pointerEvents="box-none"
          collapsable={false}
        >
          <Animated.View style={{ transform: [{ scale }] }} collapsable={false}>
            <View style={styles.card} pointerEvents="auto">
              {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    style={[
                      styles.button,
                      action.style === 'cancel' && styles.buttonCancel,
                      action.style === 'destructive' && styles.buttonDestructive,
                      action.style !== 'cancel' && action.style !== 'destructive' && styles.buttonPrimary,
                    ]}
                    onPress={() => {
                      const fn = action.onPress;
                      if (typeof fn === 'function') fn();
                      setTimeout(() => onRequestClose(), 50);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        action.style === 'cancel' && styles.buttonTextCancel,
                        action.style === 'destructive' && styles.buttonTextDestructive,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {showCloseButton && (
                <Pressable
                  style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                  onPress={onRequestClose}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 56, 340),
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actions: {
    width: '100%',
    marginTop: 18,
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonCancel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDestructive: {
    backgroundColor: Colors.dangerGlow,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  buttonTextCancel: {
    color: Colors.textSecondary,
  },
  buttonTextDestructive: {
    color: Colors.danger,
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
});
