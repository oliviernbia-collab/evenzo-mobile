import { Tabs } from 'expo-router';
import { Home, Briefcase, FileText, Calendar, User } from '../../../components/icons';

export default function ProTabsLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#b45309',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Tableau de bord', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }} />
      <Tabs.Screen name="quotes" options={{ title: 'Devis', tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Compte', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
