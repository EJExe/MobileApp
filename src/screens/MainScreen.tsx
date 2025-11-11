import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from '../components/ProductForm';

// Иконки (замените на react-native-vector-icons)
const Search = () => <Text>🔍</Text>;
const Plus = () => <Text>➕</Text>;
const Clock = () => <Text>⏰</Text>;
const AlertTriangle = () => <Text>⚠️</Text>;
const CheckCircle = () => <Text>✅</Text>;
const Package = () => <Text>📦</Text>;

interface MainScreenProps {
  products: Product[];
  onAddProduct: () => void;
  onProductClick: (product: Product) => void;
  onMarkAsUsed: (id: string) => void;
}

export function MainScreen({ products, onAddProduct, onProductClick, onMarkAsUsed }: MainScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring' | 'expired'>('all');

  const getExpirationStatus = (product: Product) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(product.expirationDate);
    expiry.setHours(0, 0, 0, 0);
    
    // Используем дату покупки как точку отсчета, если она указана
    const startDate = product.purchaseDate ? new Date(product.purchaseDate) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Общее количество дней срока годности
    const totalDays = Math.ceil((expiry.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Оставшееся количество дней от сегодняшнего дня
    const remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Прогресс в процентах (сколько дней прошло от общего срока)
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = totalDays > 0 ? Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100)) : 0;

    return { 
      status: remainingDays < 0 ? 'expired' : remainingDays <= 3 ? 'expiring' : 'fresh', 
      days: remainingDays, 
      progress,
      totalDays,
      elapsedDays
    };
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getExpirationStatus(product).status;
    
    let matchesFilter = true;
    if (activeFilter === 'expiring') matchesFilter = status === 'expiring';
    if (activeFilter === 'expired') matchesFilter = status === 'expired';
    
    return matchesSearch && matchesFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aStatus = getExpirationStatus(a);
    const bStatus = getExpirationStatus(b);
    
    const statusPriority = { expired: 0, expiring: 1, fresh: 2 };
    const statusDiff = statusPriority[aStatus.status as keyof typeof statusPriority] - 
                      statusPriority[bStatus.status as keyof typeof statusPriority];
    
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  const counts = {
    all: products.length,
    expiring: products.filter(p => getExpirationStatus(p).status === 'expiring').length,
    expired: products.filter(p => getExpirationStatus(p).status === 'expired').length
  };

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const expInfo = getExpirationStatus(product);
    const isExpired = expInfo.status === 'expired';
    const isExpiring = expInfo.status === 'expiring';
    
    const getProgressBarColor = () => {
      if (isExpired) return '#ef4444';
      if (isExpiring) return '#f59e0b';
      return '#22c55e';
    };

    const getBadgeStyle = () => {
      if (isExpired) return styles.expiredBadge;
      if (isExpiring) return styles.expiringBadge;
      return styles.freshBadge;
    };

    const getBadgeTextStyle = () => {
      if (isExpired) return styles.expiredBadgeText;
      if (isExpiring) return styles.expiringBadgeText;
      return styles.freshBadgeText;
    };

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => onProductClick(product)}
      >
        <View style={styles.productContent}>
          <View style={styles.productRow}>
            {/* Category Icon */}
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(product.category)}
            </Text>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productCategory}>
                {product.category}
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${expInfo.progress}%`,
                        backgroundColor: getProgressBarColor()
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.dateText}>
                    {new Date(product.expirationDate).toLocaleDateString('ru-RU')}
                  </Text>
                  <View style={[styles.badge, getBadgeStyle()]}>
                    <Text style={[styles.badgeText, getBadgeTextStyle()]}>
                      {isExpired ? `Просрочен на ${expInfo.days} дн.` :
                       isExpiring ? `${expInfo.days} дн.` :
                       `${expInfo.days} дн.`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Status Icon */}
            <View style={styles.statusIcon}>
              {isExpired ? (
                <AlertTriangle />
              ) : isExpiring ? (
                <Clock />
              ) : (
                <CheckCircle />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package />
      <Text style={styles.emptyTitle}>
        {searchTerm ? 'Продукты не найдены' : 'Нет продуктов'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchTerm 
          ? 'Попробуйте изменить поисковый запрос' 
          : 'Добавьте первый продукт для отслеживания'
        }
      </Text>
      {!searchTerm && (
        <TouchableOpacity style={styles.addButton} onPress={onAddProduct}>
          <Text style={styles.addButtonText}>Добавить продукт</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Мои продукты</Text>
          <Text style={styles.subtitle}>Управляйте продуктами дома</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по продуктам..."
            placeholderTextColor="#666"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]} numberOfLines={1} ellipsizeMode="tail">
              Все ({counts.all})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'expiring' && styles.filterTabExpiring]}
            onPress={() => setActiveFilter('expiring')}
          >
            <Text style={[styles.filterText, activeFilter === 'expiring' && styles.filterTextExpiring]} numberOfLines={1} ellipsizeMode="tail">
              Скоро ({counts.expiring})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'expired' && styles.filterTabExpired]}
            onPress={() => setActiveFilter('expired')}
          >
            <Text style={[styles.filterText, activeFilter === 'expired' && styles.filterTextExpired]} numberOfLines={1} ellipsizeMode="tail">
              Просрочено ({counts.expired})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Products List */}
        <FlatList
          data={sortedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={onAddProduct}
      >
        <Plus />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
    
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'white',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 100, 
    maxWidth: 140,
    minHeight: 50,
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabExpiring: {
    backgroundColor: '#fef3c7',
  },
  filterTabExpired: {
    backgroundColor: '#fee2e2',
  },
  filterText: {
    fontSize: 13, 
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center', 
    lineHeight: 16,
  },
  filterTextActive: {
    color: 'white',
  },
  filterTextExpiring: {
    color: '#92400e',
  },
  filterTextExpired: {
    color: '#991b1b',
  },
  productsList: {
    flexGrow: 1,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
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
  categoryIcon: {
    fontSize: 24,
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
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
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
  statusIcon: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});