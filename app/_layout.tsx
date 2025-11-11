import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../src/components/ThemeToggle';
import { AppProvider } from '../src/context/AppContext';

// Иконки для табов
const HomeIcon = () => <Text>🏠</Text>;
const HistoryIcon = () => <Text>📊</Text>;
const StatsIcon = () => <Text>📈</Text>;
const SettingsIcon = () => <Text>⚙️</Text>;

function ThemedApp() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderTopColor: isDark ? '#374151' : '#e5e7eb',
          },
          tabBarActiveTintColor: isDark ? '#60a5fa' : '#3b82f6',
          tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="main"
          options={{
            title: 'Продукты',
            tabBarIcon: () => <HomeIcon />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Статистика',
            tabBarIcon: () => <StatsIcon />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'История',
            tabBarIcon: () => <HistoryIcon />,
          }}
        />
        <Tabs.Screen
          name="notification-settings"
          options={{
            title: 'Настройки',
            tabBarIcon: () => <SettingsIcon />,
          }}
        />
        <Tabs.Screen
          name="add-method-selection"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="add-product"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="product-detail"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="qr-scan"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="modal"
          options={{ href: null }}
        />
        {/* Добавьте этот маршрут */}
        <Tabs.Screen
          name="recipe-detail"
          options={{ href: null }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </ThemeProvider>
  );
}