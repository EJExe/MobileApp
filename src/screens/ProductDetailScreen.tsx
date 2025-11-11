import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from '../components/ProductForm';
import { RecipeSuggestions } from '../components/RecipeSuggestions';
import { getRecipesByProductCategory, Recipe } from '../utils/RecipeDatabase';

// Иконки (замените на react-native-vector-icons)
const ArrowLeft = () => <Text>⬅️</Text>;
const CheckCircle = () => <Text>✅</Text>;
const Trash2 = () => <Text>🗑️</Text>;
const Calendar = () => <Text>📅</Text>;
const ShoppingCart = () => <Text>🛒</Text>;
const DollarSign = () => <Text>💰</Text>;

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onMarkAsUsed: (id: string) => void;
  onDelete: (id: string) => void;
  onRecipeClick: (recipe: Recipe) => void;
  
}

export function ProductDetailScreen({ product, onBack, onMarkAsUsed, onDelete, onRecipeClick }: ProductDetailScreenProps) {
  const getExpirationInfo = (product: Product) => {
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
    const percentage = totalDays > 0 ? Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100)) : 0;

    if (remainingDays < 0) {
      return { 
        status: 'expired', 
        days: Math.abs(remainingDays), 
        percentage: 100,
        message: `Просрочен на ${Math.abs(remainingDays)} дн.`,
        color: '#ef4444',
        totalDays,
        elapsedDays
      };
    } else if (remainingDays <= 3) {
      return { 
        status: 'expiring', 
        days: remainingDays, 
        percentage,
        message: remainingDays === 0 ? 'Истекает сегодня' : `Осталось ${remainingDays} дн.`,
        color: '#f59e0b',
        totalDays,
        elapsedDays
      };
    } else {
      return { 
        status: 'fresh', 
        days: remainingDays, 
        percentage,
        message: `Осталось ${remainingDays} дн.`,
        color: '#22c55e',
        totalDays,
        elapsedDays
      };
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleMarkAsUsed = () => {
    Alert.alert(
      'Подтверждение',
      `Отметить "${product.name}" как использованный?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Подтвердить', onPress: () => onMarkAsUsed(product.id) }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Удаление продукта',
      `Вы уверены, что хотите удалить "${product.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => onDelete(product.id) }
      ]
    );
  };

  const expInfo = getExpirationInfo(product);

  // Get recipe suggestions if product is expiring soon (3 days or less)
  const shouldShowRecipes = expInfo.days <= 3 && expInfo.status !== 'expired';
  const recipeSuggestions = shouldShowRecipes ? getRecipesByProductCategory(product.category) : [];

  const getProgressColor = () => {
    switch (expInfo.status) {
      case 'expired': return '#ef4444';
      case 'expiring': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
          >
            <ArrowLeft />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Детали продукта</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Product Header */}
          <View style={styles.card}>
            <View style={styles.productHeader}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(product.category)}
              </Text>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
            </View>
          </View>

          {/* Circular Progress */}
          <View style={styles.card}>
            <View style={styles.progressContainer}>
              {/* Circular Progress Visualization */}
              <View style={styles.circleProgress}>
                <View style={styles.circleBackground} />
                <View 
                  style={[
                    styles.circleProgressFill,
                    { 
                      backgroundColor: getProgressColor(),
                      height: `${expInfo.percentage}%`
                    }
                  ]} 
                />
                <View style={styles.circleContent}>
                  <Text style={[styles.daysText, { color: expInfo.color }]}>
                    {expInfo.days}
                  </Text>
                  <Text style={styles.daysLabel}>
                    {expInfo.days === 1 ? 'день' : expInfo.days < 5 ? 'дня' : 'дней'}
                  </Text>
                  <Text style={styles.percentageText}>
                    {Math.round(expInfo.percentage)}%
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.statusMessage, { color: expInfo.color }]}>
                {expInfo.message}
              </Text>
              
              {/* Дополнительная информация о сроке годности */}
              {product.purchaseDate && expInfo.totalDays > 0 && (
                <Text style={styles.additionalInfo}>
                  Общий срок: {expInfo.totalDays} дн. ({expInfo.elapsedDays} дн. прошло)
                </Text>
              )}
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.card}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Calendar />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Срок годности до</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(product.expirationDate)}
                  </Text>
                </View>
              </View>

              {product.purchaseDate && (
                <View style={styles.detailRow}>
                  <ShoppingCart />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Дата покупки</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(product.purchaseDate)}
                    </Text>
                  </View>
                </View>
              )}

              {product.price && (
                <View style={styles.detailRow}>
                  <DollarSign />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Стоимость</Text>
                    <Text style={styles.detailValue}>
                      {product.price.toFixed(2)} ₽
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Recipe Suggestions - only show if product is expiring soon */}
          {shouldShowRecipes && recipeSuggestions.length > 0 && (
            <View style={styles.recipeWarning}>
              <Text style={styles.recipeWarningTitle}>⚠️ Срок годности подходит к концу!</Text>
              <Text style={styles.recipeWarningText}>
                Попробуйте приготовить что-нибудь вкусное с этим продуктом
              </Text>
              <RecipeSuggestions 
                recipes={recipeSuggestions} 
                onRecipeClick={onRecipeClick}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.useButton]}
              onPress={handleMarkAsUsed}
            >
              <CheckCircle />
              <Text style={styles.useButtonText}>Продукт использован</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Trash2 />
              <Text style={styles.deleteButtonText}>Удалить продукт</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
  productHeader: {
    padding: 24,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  progressContainer: {
    padding: 32,
    alignItems: 'center',
  },
  circleProgress: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f9fafb',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  circleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  circleProgressFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  circleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  daysLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  additionalInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 24,
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  recipeWarning: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  recipeWarningTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
    marginBottom: 4,
  },
  recipeWarningText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  useButton: {
    backgroundColor: '#16a34a',
  },
  useButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});