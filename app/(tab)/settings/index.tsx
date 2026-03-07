import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { UserPen, LogOut, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const PROFILE_PROGRESS = 12.5;

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleEditProfile = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-profile' as any);
  }, []);

  const handleSubscription = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tab)/settings/subscription' as any);
  }, []);

  const handleLogout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  }, [logout]);

  const bottomPadding = 24 + insets.bottom + 100;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.name ?? 'User'}
            </Text>
            <TouchableOpacity
              onPress={handleEditProfile}
              activeOpacity={0.7}
              style={styles.viewProfileLink}
            >
              <Text style={styles.viewProfileText}>View profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{PROFILE_PROGRESS}%</Text>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditProfile}
            activeOpacity={0.6}
          >
            <View style={styles.menuIconWrap}>
              <UserPen size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSubscription}
            activeOpacity={0.6}
          >
            <View style={styles.menuIconWrap}>
              <CreditCard size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Subscription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Log out + version – fixed bottom center */}
      <View style={[styles.logoutFooter, { paddingBottom: bottomPadding }]}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: Colors.headerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.headerText,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    // width: '100%',
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
    marginBottom: 4,
  },
  viewProfileLink: {
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  viewRequestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  viewRequestsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.black,
  },
  logoutFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    minWidth: 160,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
