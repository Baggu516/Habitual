import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { User as UserIcon, Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const { user, updateProfile, updateProfilePending } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveName = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (name.trim() === user?.name) {
      Alert.alert('Info', 'Name is unchanged');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProfile({ name: name.trim() });
      Alert.alert('Success', 'Name updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update name');
    }
  }, [name, user?.name, updateProfile]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (currentPassword !== user?.password) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from current');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProfile({ password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to change password');
    }
  }, [currentPassword, newPassword, confirmPassword, user?.password, updateProfile]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' as const },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.emailLabel}>{user?.email ?? ''}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DISPLAY NAME</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputIconWrap}>
                <UserIcon size={18} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                testID="edit-profile-name"
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, updateProfilePending && styles.saveBtnDisabled]}
              onPress={handleSaveName}
              disabled={updateProfilePending}
              activeOpacity={0.7}
              testID="save-name-btn"
            >
              {updateProfilePending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Check size={18} color={Colors.white} />
                  <Text style={styles.saveBtnText}>Save Name</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputIconWrap}>
                <Lock size={18} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showCurrentPassword}
                testID="current-password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrentPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} color={Colors.textMuted} />
                ) : (
                  <Eye size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputIconWrap}>
                <Lock size={18} color={Colors.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showNewPassword}
                testID="new-password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNewPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showNewPassword ? (
                  <EyeOff size={18} color={Colors.textMuted} />
                ) : (
                  <Eye size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputIconWrap}>
                <Lock size={18} color={Colors.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                testID="confirm-password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color={Colors.textMuted} />
                ) : (
                  <Eye size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.changePassBtn, updateProfilePending && styles.saveBtnDisabled]}
              onPress={handleChangePassword}
              disabled={updateProfilePending}
              activeOpacity={0.7}
              testID="change-password-btn"
            >
              {updateProfilePending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Lock size={16} color={Colors.white} />
                  <Text style={styles.saveBtnText}>Change Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  emailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginLeft: 4,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 4,
  },
  inputIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 14,
  },
  eyeBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  changePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
});
