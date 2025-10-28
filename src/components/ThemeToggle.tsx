import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

// Иконки (замените на react-native-vector-icons)
const Moon = () => <Text>🌙</Text>;
const Sun = () => <Text>☀️</Text>;

// Создаем контекст для темы
type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Провайдер темы для использования в приложении
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('auto');

  const isDark = theme === 'auto' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  // Загрузка сохраненной темы
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleSetTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Хук для использования темы
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Основной компонент переключателя темы
export function ThemeToggle() {
  const { theme, isDark, setTheme } = useTheme();

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Светлая';
      case 'dark': return 'Темная';
      case 'auto': return 'Авто';
      default: return 'Авто';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={toggleTheme}
      accessibilityLabel="Переключить тему"
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        {isDark ? <Sun /> : <Moon />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.themeLabel}>Тема</Text>
        <Text style={styles.themeValue}>{getThemeLabel()}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Компактная версия (как в оригинале)
export function CompactThemeToggle() {
  const { isDark, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity 
      style={styles.compactContainer}
      onPress={toggleTheme}
      accessibilityLabel="Переключить тему"
      accessibilityRole="button"
    >
      {isDark ? <Sun /> : <Moon />}
    </TouchableOpacity>
  );
}

// Компонент для настроек темы
export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; description: string }[] = [
    {
      value: 'light',
      label: 'Светлая',
      description: 'Всегда светлый режим'
    },
    {
      value: 'dark',
      label: 'Темная',
      description: 'Всегда темный режим'
    },
    {
      value: 'auto',
      label: 'Авто',
      description: 'Следует системным настройкам'
    }
  ];

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Настройки темы</Text>
      <View style={styles.themesList}>
        {themes.map((themeOption) => (
          <TouchableOpacity
            key={themeOption.value}
            style={[
              styles.themeOption,
              theme === themeOption.value && styles.themeOptionSelected
            ]}
            onPress={() => setTheme(themeOption.value)}
          >
            <View style={styles.themeOptionContent}>
              <View style={styles.themeOptionText}>
                <Text style={styles.themeOptionLabel}>{themeOption.label}</Text>
                <Text style={styles.themeOptionDescription}>
                  {themeOption.description}
                </Text>
              </View>
              <View style={[
                styles.radio,
                theme === themeOption.value && styles.radioSelected
              ]}>
                {theme === themeOption.value && <View style={styles.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  compactContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  themeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingsContainer: {
    padding: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  themesList: {
    gap: 8,
  },
  themeOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  themeOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
});