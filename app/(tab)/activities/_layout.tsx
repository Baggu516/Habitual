import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function ActivitiesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' as const },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Activities' }} />
    </Stack>
  );
}
