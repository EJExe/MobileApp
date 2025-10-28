import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from './ProductForm';

// Иконки (замените на react-native-vector-icons)
const Trash2 = () => <Text>🗑️</Text>;
const Download = () => <Text>📥</Text>;
const Upload = () => <Text>📤</Text>;
const RefreshCw = () => <Text>🔄</Text>;
const AlertTriangle = () => <Text>⚠️</Text>;

interface QuickActionsProps {
  products: Product[];
  onDeleteExpired: () => void;
  onExportData: () => void;
  onImportData: (data: Product[]) => void;
}

export function QuickActions({ products, onDeleteExpired, onExportData, onImportData }: QuickActionsProps) {
  const [isImporting, setIsImporting] = useState(false);

  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'expired' : diffDays <= 3 ? 'expiring' : 'fresh';
  };

  const expiredCount = products.filter(p => getExpirationStatus(p.expirationDate) === 'expired').length;
  const expiringCount = products.filter(p => getExpirationStatus(p.expirationDate) === 'expiring').length;
  const freshCount = products.filter(p => getExpirationStatus(p.expirationDate) === 'fresh').length;

  const handleDeleteExpired = () => {
    Alert.alert(
      'Удалить просроченные продукты?',
      `Это действие нельзя отменить. Будут удалены ${expiredCount} просроченных продукта(ов).`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: onDeleteExpired
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      if (products.length === 0) {
        Alert.alert('Внимание', 'Нет данных для экспорта');
        return;
      }

      const data = JSON.stringify(products, null, 2);
      
      if (Platform.OS === 'web') {
        // Для web используем Blob API
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_export_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Успех', 'Данные экспортированы и начата загрузка файла');
      } else {
        // Для мобильных устройств - просто показываем данные для копирования
        Alert.alert(
          'Экспорт данных',
          'Скопируйте данные вручную:',
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Скопировать JSON', 
              onPress: () => {
                // Здесь можно добавить логику копирования в буфер обмена
                Alert.alert('Успех', 'Данные готовы для копирования');
                console.log('Export data:', data);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Для чтения файла используем FileReader для web или expo-file-system для мобильных
      if (Platform.OS === 'web') {
        const fileContent = await readFileAsText(file);
        const data = JSON.parse(fileContent);

        if (Array.isArray(data) && data.length > 0) {
          Alert.alert(
            'Импорт данных',
            `Найдено ${data.length} продуктов. Заменить текущие данные?`,
            [
              { text: 'Отмена', style: 'cancel' },
              { 
                text: 'Импортировать', 
                onPress: () => onImportData(data)
              }
            ]
          );
        } else {
          Alert.alert('Ошибка', 'Неверный формат файла. Ожидается массив продуктов.');
        }
      } else {
        // Для мобильных устройств
        Alert.alert(
          'Импорт данных',
          'Функция импорта доступна в веб-версии приложения',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Ошибка', 'Не удалось импортировать данные. Проверьте формат файла.');
    } finally {
      setIsImporting(false);
    }
  };

  // Вспомогательная функция для чтения файла в web
  const readFileAsText = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Удалить просроченные', 'Экспорт данных', 'Импорт данных'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              handleDeleteExpired();
              break;
            case 2:
              handleExportData();
              break;
            case 3:
              handleImportData();
              break;
          }
        }
      );
    } else {
      Alert.alert(
        'Быстрые действия',
        'Выберите действие',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить просроченные', onPress: handleDeleteExpired },
          { text: 'Экспорт данных', onPress: handleExportData },
          { text: 'Импорт данных', onPress: handleImportData },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <RefreshCw />
          <Text style={styles.title}>Быстрые действия</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton, expiredCount === 0 && styles.disabledButton]}
            onPress={handleDeleteExpired}
            disabled={expiredCount === 0}
          >
            <Trash2 />
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              Удалить просроченные
            </Text>
            {expiredCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{expiredCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.exportButton, products.length === 0 && styles.disabledButton]}
            onPress={handleExportData}
            disabled={products.length === 0}
          >
            <Download />
            <Text style={styles.buttonText}>Экспорт данных</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.importButton, isImporting && styles.disabledButton]}
            onPress={handleImportData}
            disabled={isImporting}
          >
            <Upload />
            <Text style={styles.buttonText}>
              {isImporting ? 'Импорт...' : 'Импорт данных'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.quickMenuButton]}
            onPress={showActionSheet}
          >
            <RefreshCw />
            <Text style={styles.buttonText}>Все действия</Text>
          </TouchableOpacity>
        </View>

        {expiringCount > 0 && (
          <View style={styles.warningBanner}>
            <AlertTriangle />
            <Text style={styles.warningText}>
              У вас есть {expiringCount} продукт(ов), которые истекают в ближайшие дни
            </Text>
          </View>
        )}

        {products.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Статистика продуктов</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.freshStat]}>{freshCount}</Text>
                <Text style={styles.statLabel}>Свежих</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.expiringStat]}>{expiringCount}</Text>
                <Text style={styles.statLabel}>Истекают</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.expiredStat]}>{expiredCount}</Text>
                <Text style={styles.statLabel}>Просрочены</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  exportButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  importButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  quickMenuButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  badge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  freshStat: {
    color: '#16a34a',
  },
  expiringStat: {
    color: '#f59e0b',
  },
  expiredStat: {
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});