import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Иконки (замените на react-native-vector-icons)
const Bell = () => <Text>🔔</Text>;
const Clock = () => <Text>⏰</Text>;
const Settings = () => <Text>⚙️</Text>;
const CheckCircle = () => <Text>✅</Text>;

interface NotificationSettings {
  enabled: boolean;
  daysBeforeExpiry: number;
  dailyReminderEnabled: boolean;
  reminderTime: string;
  expiredNotificationsEnabled: boolean;
}

interface NotificationSettingsScreenProps {
  // Props for navigation if needed
}

export function NotificationSettingsScreen({}: NotificationSettingsScreenProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    daysBeforeExpiry: 2,
    dailyReminderEnabled: true,
    reminderTime: '09:00',
    expiredNotificationsEnabled: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>();

  // Configure notifications
  useEffect(() => {
    configureNotifications();
    loadSettings();
  }, []);

  const configureNotifications = async () => {
    // Set notification handler with correct type
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Get current permission status
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setHasChanges(false);
      
      // Schedule/cancel notifications based on new settings
      await updateNotificationSchedules();
      
      Alert.alert('Успех', 'Настройки уведомлений сохранены');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить настройки');
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      setPermissionStatus(status);
      
      if (status === 'granted') {
        Alert.alert('Успех', 'Уведомления разрешены');
        updateSetting('enabled', true);
      } else {
        Alert.alert('Внимание', 'Уведомления отклонены');
        updateSetting('enabled', false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Ошибка', 'Не удалось запросить разрешение');
    }
  };

  const sendTestNotification = async () => {
    try {
      if (permissionStatus === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Тестовое уведомление',
            body: 'Это пример уведомления о скором истечении срока годности',
            sound: true,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 2,
            repeats: false,
          } as Notifications.TimeIntervalTriggerInput,
        });
        Alert.alert('Успех', 'Тестовое уведомление отправлено');
      } else {
        Alert.alert('Внимание', 'Сначала разрешите уведомления');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Ошибка', 'Не удалось отправить тестовое уведомление');
    }
  };

  const updateNotificationSchedules = async () => {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (settings.enabled && settings.dailyReminderEnabled) {
      // Schedule daily reminder
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ежедневный обзор продуктов',
          body: 'Проверьте продукты с истекающим сроком годности',
          sound: true,
        },
        trigger: {
          type: 'daily',
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.DailyTriggerInput,
      });
    }
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    return `${hour}:${minutes}`;
  };

  const renderTimePicker = () => {
    // For a real app, you might want to use a proper time picker
    // This is a simplified version with preset times
    const times = ['07:00', '09:00', '12:00', '18:00', '20:00'];
    
    return (
      <View style={styles.timePicker}>
        <Text style={styles.timeLabel}>Время напоминания</Text>
        <View style={styles.timeOptions}>
          {times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeOption,
                settings.reminderTime === time && styles.timeOptionSelected
              ]}
              onPress={() => updateSetting('reminderTime', time)}
            >
              <Text style={[
                styles.timeOptionText,
                settings.reminderTime === time && styles.timeOptionTextSelected
              ]}>
                {formatTime(time)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.timeDescription}>
          Ежедневно в {formatTime(settings.reminderTime)} вы будете получать сводку по продуктам
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Уведомления</Text>
          <Text style={styles.subtitle}>Настройте напоминания о сроках годности</Text>
        </View>

        <View style={styles.content}>
          {/* Main Toggle */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <Bell />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Уведомления</Text>
                    <Text style={styles.settingDescription}>
                      {settings.enabled ? 'Включены' : 'Отключены'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => {
                    if (value) {
                      requestNotificationPermission();
                    } else {
                      updateSetting('enabled', false);
                    }
                  }}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={settings.enabled ? '#3b82f6' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Days Before Expiry */}
          {settings.enabled && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Clock />
                  <Text style={styles.cardTitle}>Заблаговременное напоминание</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.sliderSection}>
                  <Text style={styles.sliderLabel}>
                    Уведомлять за {settings.daysBeforeExpiry} {
                      settings.daysBeforeExpiry === 1 ? 'день' :
                      settings.daysBeforeExpiry < 5 ? 'дня' : 'дней'
                    } до окончания срока
                  </Text>
                  
                  {/* Custom slider implementation */}
                  <View style={styles.sliderContainer}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.sliderOption,
                          settings.daysBeforeExpiry === day && styles.sliderOptionSelected
                        ]}
                        onPress={() => updateSetting('daysBeforeExpiry', day)}
                      >
                        <Text style={[
                          styles.sliderOptionText,
                          settings.daysBeforeExpiry === day && styles.sliderOptionTextSelected
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderMinMax}>1 день</Text>
                    <Text style={styles.sliderMinMax}>7 дней</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Вы получите уведомление, когда до истечения срока годности продукта останется {settings.daysBeforeExpiry} {
                      settings.daysBeforeExpiry === 1 ? 'день' :
                      settings.daysBeforeExpiry < 5 ? 'дня' : 'дней'
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Daily Reminders */}
          {settings.enabled && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ежедневные напоминания</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Ежедневный обзор продуктов</Text>
                  <Switch
                    value={settings.dailyReminderEnabled}
                    onValueChange={(value) => updateSetting('dailyReminderEnabled', value)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.dailyReminderEnabled ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>

                {settings.dailyReminderEnabled && renderTimePicker()}
              </View>
            </View>
          )}

          {/* Expired Products Notifications */}
          {settings.enabled && (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Уведомления о просроченных продуктах</Text>
                    <Text style={styles.settingDescription}>
                      Напоминания о продуктах с истекшим сроком годности
                    </Text>
                  </View>
                  <Switch
                    value={settings.expiredNotificationsEnabled}
                    onValueChange={(value) => updateSetting('expiredNotificationsEnabled', value)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.expiredNotificationsEnabled ? '#3b82f6' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Test Notification */}
          {settings.enabled && (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Тестовое уведомление</Text>
                    <Text style={styles.settingDescription}>
                      Проверьте, как будут выглядеть уведомления
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.testButton}
                    onPress={sendTestNotification}
                  >
                    <Text style={styles.testButtonText}>Отправить тест</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Permission Status */}
          {settings.enabled && permissionStatus === 'granted' && (
            <View style={styles.successCard}>
              <View style={styles.successContent}>
                <CheckCircle />
                <View style={styles.successText}>
                  <Text style={styles.successTitle}>Уведомления настроены</Text>
                  <Text style={styles.successDescription}>
                    Вы будете получать своевременные напоминания о продуктах
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Save Button */}
          {hasChanges && (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveSettings}
            >
              <Settings />
              <Text style={styles.saveButtonText}>Сохранить настройки</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  sliderSection: {
    gap: 12,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  sliderOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  sliderOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  sliderOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  sliderOptionTextSelected: {
    color: 'white',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  timePicker: {
    gap: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  timeOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: 'white',
  },
  timeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  successCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#166534',
    marginBottom: 2,
  },
  successDescription: {
    fontSize: 14,
    color: '#166534',
  },
  saveButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});