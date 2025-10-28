import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from '../components/ProductForm';

// Иконки (замените на react-native-vector-icons)
const Archive = () => <Text>📁</Text>;
const CheckCircle = () => <Text>✅</Text>;
const XCircle = () => <Text>❌</Text>;
const Trash2 = () => <Text>🗑️</Text>;
const TrendingUp = () => <Text>📈</Text>;
const Clock = () => <Text>⏰</Text>;

interface HistoryScreenProps {
  products: Product[];
  archivedProducts: Product[];
  onClearHistory: () => void;
}

export function HistoryScreen({ products, archivedProducts, onClearHistory }: HistoryScreenProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Молочные продукты': '🥛',
      'Мясо и рыба': '🥩',
      'Овощи': '🥬',
      'Фрукты': '🍎',
      'Хлеб и выпечка': '🍞',
      'Консервы': '🥫',
      'Напитки': '🥤',
      'Заморозка': '🧊',
      'Готовые блюда': '🍱',
      'Соусы/Приправы': '🧂',
    };
    return icons[category] || '📦';
  };

  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'expired' : diffDays <= 3 ? 'expiring' : 'fresh';
  };

  // Sort archived products by archive date (newest first)
  const sortedArchivedProducts = [...archivedProducts].sort((a, b) => {
    const aDate = new Date(a.archivedDate || 0);
    const bDate = new Date(b.archivedDate || 0);
    return bDate.getTime() - aDate.getTime();
  });

  // Calculate statistics
  const stats = {
    totalArchived: archivedProducts.length,
    used: archivedProducts.filter(p => p.archiveReason === 'used').length,
    expired: archivedProducts.filter(p => p.archiveReason === 'expired').length,
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Очистить историю?',
      `Это действие нельзя отменить. Будут удалены все записи из архива (${archivedProducts.length} продуктов).`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Очистить', 
          style: 'destructive',
          onPress: () => {
            onClearHistory();
            // Здесь можно добавить toast уведомление
            Alert.alert('Успех', 'История очищена');
          }
        }
      ]
    );
  };

  const renderEmptyState = (type: 'active' | 'archive') => (
    <View style={styles.emptyState}>
      <Archive />
      <Text style={styles.emptyTitle}>
        {type === 'active' ? 'Нет активных продуктов' : 'Архив пуст'}
      </Text>
      <Text style={styles.emptyDescription}>
        {type === 'active' 
          ? 'Добавьте продукты для отслеживания их сроков годности'
          : 'Здесь будут отображаться использованные и просроченные продукты'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>История</Text>
          <Text style={styles.subtitle}>Архив и активные продукты</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Активные ({products.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'archive' && styles.activeTab]}
            onPress={() => setActiveTab('archive')}
          >
            <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>
              Архив ({archivedProducts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Products Tab */}
        {activeTab === 'active' && (
          <View style={styles.tabContent}>
            {products.length === 0 ? (
              renderEmptyState('active')
            ) : (
              <View style={styles.productsList}>
                {products.map((product) => {
                  const status = getExpirationStatus(product.expirationDate);
                  const isExpired = status === 'expired';
                  const isExpiring = status === 'expiring';

                  return (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productContent}>
                        <View style={styles.productRow}>
                          <Text style={styles.productIcon}>
                            {getCategoryIcon(product.category)}
                          </Text>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productCategory}>{product.category}</Text>
                            <Text style={styles.productDate}>
                              До: {formatDate(product.expirationDate)}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            isExpired ? styles.expiredBadge :
                            isExpiring ? styles.expiringBadge :
                            styles.freshBadge
                          ]}>
                            <Text style={[
                              styles.statusBadgeText,
                              isExpired ? styles.expiredBadgeText :
                              isExpiring ? styles.expiringBadgeText :
                              styles.freshBadgeText
                            ]}>
                              {isExpired ? 'Просрочен' : isExpiring ? 'Скоро истекает' : 'Свежий'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <View style={styles.tabContent}>
            {/* Archive Statistics */}
            {archivedProducts.length > 0 && (
              <View style={styles.statsCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <TrendingUp />
                    <Text style={styles.cardTitle}>Статистика архива</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{stats.totalArchived}</Text>
                      <Text style={styles.statLabel}>Всего</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, styles.usedStat]}>
                        {stats.used}
                      </Text>
                      <Text style={styles.statLabel}>Использовано</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, styles.expiredStat]}>
                        {stats.expired}
                      </Text>
                      <Text style={styles.statLabel}>Просрочено</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Archive List */}
            <View style={styles.archiveList}>
              {sortedArchivedProducts.length === 0 ? (
                renderEmptyState('archive')
              ) : (
                <View style={styles.productsList}>
                  {sortedArchivedProducts.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productContent}>
                        <View style={styles.productRow}>
                          <Text style={styles.productIcon}>
                            {getCategoryIcon(product.category)}
                          </Text>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productCategory}>{product.category}</Text>
                            <View style={styles.archiveDate}>
                              <Clock />
                              <Text style={styles.archiveDateText}>
                                Архивировано {formatDate(product.archivedDate || '')}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.archiveInfo}>
                            <View style={[
                              styles.archiveBadge,
                              product.archiveReason === 'used' ? styles.usedBadge : styles.expiredArchiveBadge
                            ]}>
                              <Text style={[
                                styles.archiveBadgeText,
                                product.archiveReason === 'used' ? styles.usedBadgeText : styles.expiredArchiveBadgeText
                              ]}>
                                {product.archiveReason === 'used' ? (
                                  <>
                                    <CheckCircle /> Использован
                                  </>
                                ) : (
                                  <>
                                    <XCircle /> Просрочен
                                  </>
                                )}
                              </Text>
                            </View>
                            <Text style={styles.archiveExpiry}>
                              До: {formatDate(product.expirationDate)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Clear History Button */}
            {archivedProducts.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearHistory}
              >
                <Trash2 />
                <Text style={styles.clearButtonText}>Очистить историю</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    margin: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#1f2937',
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productContent: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productIcon: {
    fontSize: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  productDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expiredBadge: {
    backgroundColor: '#fee2e2',
  },
  expiredBadgeText: {
    color: '#dc2626',
  },
  expiringBadge: {
    backgroundColor: '#fef3c7',
  },
  expiringBadgeText: {
    color: '#92400e',
  },
  freshBadge: {
    backgroundColor: '#dcfce7',
  },
  freshBadgeText: {
    color: '#166534',
  },
  statsCard: {
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
    color: '#1f2937',
    marginBottom: 4,
  },
  usedStat: {
    color: '#16a34a',
  },
  expiredStat: {
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  archiveList: {
    gap: 16,
  },
  archiveDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  archiveDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  archiveInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  archiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  archiveBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  usedBadge: {
    backgroundColor: '#dcfce7',
  },
  usedBadgeText: {
    color: '#166534',
  },
  expiredArchiveBadge: {
    backgroundColor: '#fee2e2',
  },
  expiredArchiveBadgeText: {
    color: '#dc2626',
  },
  archiveExpiry: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'white',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});