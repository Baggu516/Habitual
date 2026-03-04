import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Check, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

const PREMIUM_PRICE = '$4.99';
const PREMIUM_PERIOD = '/month';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateSubscription, updateSubscriptionPending } = useAuth();
  const [paying, setPaying] = useState(false);

  const isPremium = user?.subscriptionType === 'premium';

  const handleSubscribe = useCallback(async () => {
    if (isPremium) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Subscribe to Premium',
      `You will be charged ${PREMIUM_PRICE}${PREMIUM_PERIOD}. Unlimited habits and 30+ day tracking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay & Subscribe',
          onPress: async () => {
            setPaying(true);
            try {
              // Placeholder: simulate payment (replace with Stripe/Razorpay etc.)
              await new Promise((r) => setTimeout(r, 1200));
              await updateSubscription('premium');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'You are now a Premium subscriber.');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Payment failed.');
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  }, [isPremium, updateSubscription]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.currentPlan}>
        <Text style={styles.currentLabel}>Current plan</Text>
        <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
          <Crown size={18} color={isPremium ? Colors.white : Colors.accent} />
          <Text style={[styles.planBadgeText, isPremium && styles.planBadgeTextPremium]}>
            {isPremium ? 'Premium' : 'Free'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planPrice}>$0</Text>
        </View>
        <Text style={styles.planDesc}>Up to 5 habits, 7-day tracking</Text>
        <View style={styles.featureRow}>
          <Check size={16} color={Colors.textMuted} />
          <Text style={styles.featureText}>5 habits max</Text>
        </View>
        <View style={styles.featureRow}>
          <Check size={16} color={Colors.textMuted} />
          <Text style={styles.featureText}>7-day tracker</Text>
        </View>
        {!isPremium && (
          <View style={styles.currentTag}>
            <Text style={styles.currentTagText}>Current</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, styles.cardPremium]}>
        <View style={styles.cardHeader}>
          <Text style={styles.planName}>Premium</Text>
          <Text style={styles.planPrice}>
            {PREMIUM_PRICE}
            <Text style={styles.planPeriod}>{PREMIUM_PERIOD}</Text>
          </Text>
        </View>
        <Text style={styles.planDesc}>Unlimited habits, 30+ day tracking</Text>
        <View style={styles.featureRow}>
          <Check size={16} color={Colors.primary} />
          <Text style={styles.featureText}>Unlimited habits</Text>
        </View>
        <View style={styles.featureRow}>
          <Check size={16} color={Colors.primary} />
          <Text style={styles.featureText}>30+ day tracker</Text>
        </View>
        <View style={styles.featureRow}>
          <Check size={16} color={Colors.primary} />
          <Text style={styles.featureText}>Priority support</Text>
        </View>
        {isPremium ? (
          <View style={styles.currentTagPremium}>
            <Text style={styles.currentTagTextPremium}>Active</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            disabled={updateSubscriptionPending || paying}
            activeOpacity={0.8}
          >
            {updateSubscriptionPending || paying ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <CreditCard size={18} color={Colors.white} />
                <Text style={styles.subscribeBtnText}>Pay & Subscribe</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.disclaimer}>
        App works fully offline. Payment is simulated; real payments will be added in a future update.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  currentPlan: {
    marginBottom: 24,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planBadgePremium: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  planBadgeTextPremium: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardPremium: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  planDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  currentTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  currentTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  currentTagPremium: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryGlow,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  currentTagTextPremium: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
