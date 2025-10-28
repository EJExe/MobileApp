import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Иконки (замените на react-native-vector-icons)
const ArrowLeft = () => <Text>⬅️</Text>;
const Plus = () => <Text>➕</Text>;
const QrCode = () => <Text>📷</Text>;
const ShoppingCart = () => <Text>🛒</Text>;
const Users = () => <Text>👥</Text>;

interface AddMethodSelectionScreenProps {
  onBack: () => void;
  onManualAdd: () => void;
  onQRScan: () => void;
}

export function AddMethodSelectionScreen({ onBack, onManualAdd, onQRScan }: AddMethodSelectionScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Добавить продукты</Text>
            <Text style={styles.subtitle}>Выберите способ добавления</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Manual Add */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={onManualAdd}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Plus />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Добавить вручную</Text>
                <Text style={styles.optionDescription}>
                  Введите информацию о продукте самостоятельно
                </Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* QR Scanner */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.qrOptionCard]}
            onPress={onQRScan}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIcon, styles.qrOptionIcon]}>
                <QrCode />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Сканировать QR-код</Text>
                <Text style={styles.optionDescription}>
                  Отсканируйте чек для быстрого добавления покупок
                </Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <ShoppingCart />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Быстрое добавление</Text>
                <Text style={styles.infoDescription}>
                  QR-код позволяет добавить все покупки за раз
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Users />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Контроль расходов</Text>
                <Text style={styles.infoDescription}>
                  Отслеживайте стоимость продуктов и экономьте на просрочке
                </Text>
              </View>
            </View>
          </View>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  options: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrOptionCard: {
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  optionContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrOptionIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  optionArrow: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoSection: {
    padding: 16,
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
});