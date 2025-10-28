import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Product } from '../components/ProductForm';

// Иконки (замените на react-native-vector-icons)
const TrendingDown = () => <Text>📉</Text>;
const DollarSign = () => <Text>💰</Text>;

interface StatsScreenProps {
  products: Product[];
  archivedProducts: Product[];
}

export function StatsScreen({ products, archivedProducts }: StatsScreenProps) {
  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'expired' : diffDays <= 3 ? 'expiring' : 'fresh';
  };

  // Current month expired products and cost
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const expiredThisMonthProducts = archivedProducts.filter(product => {
    if (!product.archivedDate) return false;
    const archivedDate = new Date(product.archivedDate);
    return archivedDate.getMonth() === currentMonth && 
           archivedDate.getFullYear() === currentYear &&
           product.archiveReason === 'expired';
  });
  
  const expiredThisMonth = expiredThisMonthProducts.length;
  const expiredCostThisMonth = expiredThisMonthProducts.reduce((sum, product) => sum + (product.price || 0), 0);
  
  // Total cost of all expired products
  const totalExpiredCost = archivedProducts
    .filter(p => p.archiveReason === 'expired')
    .reduce((sum, product) => sum + (product.price || 0), 0);

  // Category breakdown of expired products
  const expiredByCategory = archivedProducts
    .filter(p => p.archiveReason === 'expired')
    .reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expiredByCategory)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Trend data for last 6 months
  const getTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const expiredProducts = archivedProducts.filter(product => {
        if (!product.archivedDate) return false;
        const archivedDate = new Date(product.archivedDate);
        return archivedDate.getMonth() === month && 
               archivedDate.getFullYear() === year &&
               product.archiveReason === 'expired';
      });

      const expiredCount = expiredProducts.length;
      const expiredCost = expiredProducts.reduce((sum, product) => sum + (product.price || 0), 0);

      months.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        expired: expiredCount,
        cost: expiredCost
      });
    }
    return months;
  };

  const trendData = getTrendData();

  const pieColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECCA7', '#DDA0DD'];

  // Prepare data for charts
  const pieChartData = categoryData.map((item, index) => ({
    name: item.category,
    population: item.count,
    color: pieColors[index % pieColors.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const expiredTrendData = {
    labels: trendData.map(data => data.month),
    datasets: [{
      data: trendData.map(data => data.expired),
      color: (opacity = 1) => `rgba(21, 101, 192, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const costTrendData = {
    labels: trendData.map(data => data.month),
    datasets: [{
      data: trendData.map(data => data.cost),
      color: (opacity = 1) => `rgba(255, 109, 0, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const screenWidth = Dimensions.get('window').width - 32;
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Статистика</Text>
          <Text style={styles.subtitle}>Анализ управления продуктами</Text>
        </View>

        <View style={styles.content}>
          {/* Monthly Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryIcon}>
                  <TrendingDown />
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>В этом месяце просрочено</Text>
                  <Text style={[styles.summaryValue, styles.expiredValue]}>{expiredThisMonth} продуктов</Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryIcon}>
                  <DollarSign />
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Потери за месяц</Text>
                  <Text style={[styles.summaryValue, styles.costValue]}>{expiredCostThisMonth.toFixed(2)} ₽</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Total Expenses Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>Общие потери от просрочки</Text>
              <Text style={styles.totalAmount}>{totalExpiredCost.toFixed(2)} ₽</Text>
              <Text style={styles.totalDescription}>
                Всего просрочено: {archivedProducts.filter(p => p.archiveReason === 'expired').length} продуктов
              </Text>
            </View>
          </View>

          {/* What Expires Most Often */}
          {categoryData.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Что портится чаще всего</Text>
              </View>
              <View style={styles.cardContent}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={pieChartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.categoryList}>
                  {categoryData.slice(0, 3).map((item, index) => (
                    <View key={item.category} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <View 
                          style={[styles.categoryColor, { backgroundColor: pieColors[index] }]} 
                        />
                        <Text style={styles.categoryName}>{item.category}</Text>
                      </View>
                      <Text style={styles.categoryCount}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Trend Chart - Products */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Динамика просрочки за 6 месяцев</Text>
            </View>
            <View style={styles.cardContent}>
              <LineChart
                data={expiredTrendData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
              <Text style={styles.trendComment}>
                {trendData.length >= 2 && trendData[trendData.length - 1]?.expired < trendData[trendData.length - 2]?.expired ? 
                  '📈 Отличная работа! Количество просроченных продуктов снижается' : 
                  '📊 Продолжайте отслеживать сроки для лучших результатов'
                }
              </Text>
            </View>
          </View>

          {/* Financial Losses Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Финансовые потери по месяцам</Text>
            </View>
            <View style={styles.cardContent}>
              <LineChart
                data={costTrendData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
              <View style={styles.financialStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Средние потери</Text>
                  <Text style={styles.statValue}>
                    {(trendData.reduce((sum, data) => sum + data.cost, 0) / trendData.length).toFixed(2)} ₽
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Максимум за месяц</Text>
                  <Text style={[styles.statValue, styles.maxValue]}>
                    {Math.max(...trendData.map(data => data.cost)).toFixed(2)} ₽
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Всего за 6 месяцев</Text>
                  <Text style={styles.statValue}>
                    {trendData.reduce((sum, data) => sum + data.cost, 0).toFixed(2)} ₽
                  </Text>
                </View>
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
    paddingBottom: 32,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expiredValue: {
    color: '#ef4444',
  },
  costValue: {
    color: '#f59e0b',
  },
  totalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  totalContent: {
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  totalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardContent: {
    padding: 20,
  },
  chart: {
    borderRadius: 16,
  },
  categoryList: {
    marginTop: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  trendComment: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  financialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  maxValue: {
    color: '#ef4444',
  },
});