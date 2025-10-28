import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from './ProductForm';

// Иконки (замените на react-native-vector-icons)
const Trash2 = () => <Text>🗑️</Text>;
const Calendar = () => <Text>📅</Text>;
const ShoppingCart = () => <Text>🛒</Text>;

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
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
      return { status: 'expired', label: 'Просрочен', color: 'destructive', days: Math.abs(remainingDays) };
    } else if (remainingDays === 0) {
      return { status: 'today', label: 'Истекает сегодня', color: 'destructive', days: 0 };
    } else if (remainingDays <= 3) {
      return { status: 'expiring', label: `${remainingDays} дн.`, color: 'secondary', days: remainingDays };
    } else {
      return { status: 'fresh', label: `${remainingDays} дн.`, color: 'default', days: remainingDays };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить продукт',
      `Вы уверены, что хотите удалить "${product.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => onDelete(product.id) }
      ]
    );
  };

  const expirationInfo = getExpirationStatus(product);

  const getBorderColor = () => {
    switch (expirationInfo.status) {
      case 'expired': return '#ef4444';
      case 'today': return '#ef4444';
      case 'expiring': return '#f59e0b';
      default: return '#e5e5e5';
    }
  };

  const getBadgeStyle = () => {
    switch (expirationInfo.color) {
      case 'destructive': return styles.destructiveBadge;
      case 'secondary': return styles.secondaryBadge;
      default: return styles.defaultBadge;
    }
  };

  const getBadgeTextStyle = () => {
    switch (expirationInfo.color) {
      case 'destructive': return styles.destructiveBadgeText;
      case 'secondary': return styles.secondaryBadgeText;
      default: return styles.defaultBadgeText;
    }
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.badge, getBadgeStyle()]}>
              <Text style={[styles.badgeText, getBadgeTextStyle()]}>
                {expirationInfo.label}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Trash2 />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailsContainer}>
          {product.purchaseDate && (
            <View style={styles.detailRow}>
              <ShoppingCart />
              <Text style={styles.detailText}>
                Куплено: {formatDate(product.purchaseDate)}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Calendar />
            <Text style={styles.detailText}>
              До: {formatDate(product.expirationDate)}
            </Text>
          </View>
          {expirationInfo.status === 'expired' && (
            <Text style={styles.expiredText}>
              Просрочен на {expirationInfo.days} дн.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
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
  defaultBadge: {
    backgroundColor: '#f3f4f6',
  },
  defaultBadgeText: {
    color: '#374151',
  },
  secondaryBadge: {
    backgroundColor: '#fef3c7',
  },
  secondaryBadgeText: {
    color: '#92400e',
  },
  destructiveBadge: {
    backgroundColor: '#fee2e2',
  },
  destructiveBadgeText: {
    color: '#dc2626',
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  expiredText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
});