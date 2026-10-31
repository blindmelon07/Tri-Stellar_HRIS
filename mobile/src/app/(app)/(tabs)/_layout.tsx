import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.backgroundElement },
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', headerShown: false, tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ title: 'Attendance', tabBarIcon: ({ color }) => <Icon name="calendar" color={color} /> }}
      />
      <Tabs.Screen
        name="filings"
        options={{ title: 'Filings', tabBarIcon: ({ color }) => <Icon name="filing" color={color} /> }}
      />
      <Tabs.Screen
        name="payslips"
        options={{ title: 'Payslips', tabBarIcon: ({ color }) => <Icon name="payslip" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="profile" color={color} /> }}
      />
    </Tabs>
  );
}
