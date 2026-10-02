import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, Heart, User } from '../../../components/icons';

export default function ClientTabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#b45309',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Recherche', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Panier', tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoris', tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Compte', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
