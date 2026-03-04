import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/habit';

const USERS_KEY = '@habitual_users';
const SESSION_KEY = '@habitual_session';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!sessionQuery.isLoading) {
      setUser(sessionQuery.data ?? null);
      setIsReady(true);
    }
  }, [sessionQuery.data, sessionQuery.isLoading]);

  const loginMutation = useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = raw ? JSON.parse(raw) : [];
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === params.email.toLowerCase() &&
          u.password === params.password
      );
      if (!found) {
        throw new Error('Invalid email or password');
      }
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(found));
      return found;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['habitData'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (params: { name: string; email: string; password: string }) => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = raw ? JSON.parse(raw) : [];
      const exists = users.find(
        (u) => u.email.toLowerCase() === params.email.toLowerCase()
      );
      if (exists) {
        throw new Error('An account with this email already exists');
      }
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        password: params.password,
        subscriptionType: 'free',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['habitData'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (params: { name?: string; password?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) throw new Error('User not found');
      if (params.name) users[idx].name = params.name.trim();
      if (params.password) users[idx].password = params.password;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
      return users[idx];
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionType: 'free' | 'premium') => {
      if (!user) throw new Error('Not authenticated');
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) throw new Error('User not found');
      users[idx].subscriptionType = subscriptionType;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
      return users[idx];
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
    queryClient.clear();
  };

  return {
    user,
    isReady,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    registerPending: registerMutation.isPending,
    loginError: loginMutation.error?.message ?? null,
    registerError: registerMutation.error?.message ?? null,
    resetLoginError: loginMutation.reset,
    resetRegisterError: registerMutation.reset,
    logout,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfilePending: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error?.message ?? null,
    updateSubscription: updateSubscriptionMutation.mutateAsync,
    updateSubscriptionPending: updateSubscriptionMutation.isPending,
  };
});
