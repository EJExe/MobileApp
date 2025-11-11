import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ProductCard } from './ProductCard';
import { Product } from './ProductForm';

// Иконки (замените на react-native-vector-icons)
const Search = () => <Text>🔍</Text>;
const Filter = () => <Text>⚡</Text>;

interface ProductListProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
}

const categories = [
  'Все категории',
  'Молочные продукты',
  'Мясо и рыба',
  'Овощи',
  'Фрукты',
  'Хлеб и выпечка',
  'Консервы',
  'Напитки',
  'Заморозка',
  'Другое'
];

const statusFilters = [
  { value: 'all', label: 'Все продукты' },
  { value: 'fresh', label: 'Свежие' },
  { value: 'expiring', label: 'Истекают скоро' },
  { value: 'expired', label: 'Просроченные' }
];

export function ProductList({ products, onDeleteProduct }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Все категории');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

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

    if (remainingDays < 0) {
      return 'expired';
    } else if (remainingDays <= 3) {
      return 'expiring';
    } else {
      return 'fresh';
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Все категории' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || getExpirationStatus(product) === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aStatus = getExpirationStatus(a);
    const bStatus = getExpirationStatus(b);
    
    // Sort by expiration status priority: expired > expiring > fresh
    const statusPriority = { expired: 0, expiring: 1, fresh: 2 };
    const statusDiff = statusPriority[aStatus as keyof typeof statusPriority] - statusPriority[bStatus as keyof typeof statusPriority];
    
    if (statusDiff !== 0) return statusDiff;
    
    // If same status, sort by expiration date
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  const getStatusCounts = () => {
    const counts = { fresh: 0, expiring: 0, expired: 0 };
    products.forEach(product => {
      const status = getExpirationStatus(product);
      counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        categoryFilter === item && styles.selectedModalItem
      ]}
      onPress={() => {
        setCategoryFilter(item);
        setCategoryModalVisible(false);
      }}
    >
      <Text style={[
        styles.modalItemText,
        categoryFilter === item && styles.selectedModalItemText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusItem = ({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        statusFilter === item.value && styles.selectedModalItem
      ]}
      onPress={() => {
        setStatusFilter(item.value);
        setStatusModalVisible(false);
      }}
    >
      <Text style={[
        styles.modalItemText,
        statusFilter === item.value && styles.selectedModalItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>У вас пока нет добавленных продуктов</Text>
        <Text style={styles.emptySubtext}>Добавьте первый продукт, чтобы начать отслеживание</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.freshStat]}>
          <Text style={[styles.statNumber, styles.freshText]}>{statusCounts.fresh}</Text>
          <Text style={[styles.statLabel, styles.freshText]} numberOfLines={2}>Свежие продукты</Text>
        </View>
        <View style={[styles.statCard, styles.expiringStat]}>
          <Text style={[styles.statNumber, styles.expiringText]}>{statusCounts.expiring}</Text>
          <Text style={[styles.statLabel, styles.expiringText]} numberOfLines={2}>Истекают скоро</Text>
        </View>
        <View style={[styles.statCard, styles.expiredStat]}>
          <Text style={[styles.statNumber, styles.expiredText]}>{statusCounts.expired}</Text>
          <Text style={[styles.statLabel, styles.expiredText]} numberOfLines={2}>Просроченные</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Search Input */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Поиск продуктов</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
              <Search />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Категория</Text>
          <TouchableOpacity 
            style={styles.selectTrigger}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.selectValue}>{categoryFilter}</Text>
          </TouchableOpacity>

          <Modal
            visible={categoryModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Выберите категорию</Text>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item}
                />
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Status Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Статус</Text>
          <TouchableOpacity 
            style={styles.selectTrigger}
            onPress={() => setStatusModalVisible(true)}
          >
            <Text style={styles.selectValue}>
              {statusFilters.find(f => f.value === statusFilter)?.label || 'Все продукты'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={statusModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Выберите статус</Text>
                <FlatList
                  data={statusFilters}
                  renderItem={renderStatusItem}
                  keyExtractor={(item) => item.value}
                />
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setStatusModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>

      {/* Products List */}
      {sortedProducts.length === 0 ? (
        <View style={styles.noResults}>
          <Filter />
          <Text style={styles.noResultsText}>Продукты не найдены</Text>
          <Text style={styles.noResultsSubtext}>Попробуйте изменить фильтры поиска</Text>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onDelete={onDeleteProduct}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  freshStat: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    minHeight: 70,
  },
  expiringStat: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    minHeight: 70,
  },
  expiredStat: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    minHeight: 70,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 4,
    width: '100%',
    flexShrink: 1, 
    flexWrap: 'wrap',
  },
  freshText: {
    color: '#166534',
  },
  expiringText: {
    color: '#92400e',
  },
  expiredText: {
    color: '#991b1b',
  },
  filtersContainer: {
    gap: 16,
    marginBottom: 20,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  selectTrigger: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  selectValue: {
    fontSize: 16,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedModalItem: {
    backgroundColor: '#3b82f6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedModalItemText: {
    color: 'white',
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  productsList: {
    gap: 12,
    paddingBottom: 20,
  },
});