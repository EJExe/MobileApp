import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Product } from '../components/ProductForm';
import { useApp } from '../context/AppContext';
import api from '../services/api';

// Иконки (замените на react-native-vector-icons)
const TrendingDown = () => <Text>📉</Text>;
const DollarSign = () => <Text>💰</Text>;

interface StatsScreenProps {
  products: Product[];
  archivedProducts: Product[];
}

interface StatPoint {
  date: string; // ISO date (day or month start)
  expired_count: number;
  cost?: number;
  consumed_count?: number;
}

interface CategoryStat {
  category: string;
  count: number;
  expired_count?: number;
}

interface StatsSummary {
  total_products: number;
  expired_count: number;
  expiring_7_days: number;
  consumed_count: number;
  discarded_count?: number;
}

interface StatsResponse {
  userId: string;
  from: string;
  to: string;
  granularity: 'day' | 'week' | 'month';
  summary: StatsSummary;
  series: StatPoint[];
  byCategory?: CategoryStat[];
}

export function StatsScreen({ products, archivedProducts }: StatsScreenProps) {
  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'expired' : diffDays <= 3 ? 'expiring' : 'fresh';
  };

  const { isLoading: appLoading } = useApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatsResponse | null>(null);

  const buildDefaultRange = () => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 5);
    from.setDate(1);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  };

  const loadStats = async (force = false) => {
    setError(null);
    setLoading(true);
    try {
      const range = buildDefaultRange();
      const res = await api.get<StatsResponse>('/stats', {
        params: {
          from: range.from,
          to: range.to,
          granularity: 'month'
        }
      });
      setStats(res.data);
    } catch (err: any) {
      console.warn('Failed to load stats from server, falling back to local computation', err?.message || err);
      setError('Не удалось загрузить статистику с сервера — используется локальная статистика');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Expired products: either archived with 'expired' reason OR active products past expiration date
  const isProductExpired = (expirationDate: string) => {
    const today = new Date().getTime();
    const expiry = new Date(expirationDate).getTime();
    return expiry < today;
  };

  const getExpiredProducts = () => {
    const archivedExpired = archivedProducts.filter(p => p.archiveReason === 'expired');
    const activeExpired = products.filter(p => p.expirationDate && isProductExpired(p.expirationDate));
    return [...archivedExpired, ...activeExpired];
  };


  // Все просроченные продукты (архив+активные)
  const allExpiredProducts = getExpiredProducts();

  // Текущий месяц
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Просроченные продукты только за текущий месяц
  const expiredThisMonthList = allExpiredProducts.filter(product => {
    const checkDate = product.archivedDate ? new Date(product.archivedDate) : (product.expirationDate ? new Date(product.expirationDate) : null);
    if (!checkDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (checkDate.getTime() >= today.getTime()) return false; // ignore today & future
    return checkDate.getMonth() === currentMonth && checkDate.getFullYear() === currentYear;
  });


  // Когда сервер возвращает статистику, она может быть пустой или устаревшей.
  // Если у сервера есть содержательная статистика (серия или ненулевой summary), используем её;
  // иначе — используем локальные вычисления.
  const serverHasUsefulSeries = Boolean(
    stats && Array.isArray(stats.series) && stats.series.some(s => (s.expired_count || 0) > 0 || (s.cost || 0) > 0)
  );

  const serverHasUsefulSummary = Boolean(
    stats && typeof stats.summary?.expired_count === 'number' && stats.summary.expired_count > 0
  );

  const serverHasUsefulStats = serverHasUsefulSeries || serverHasUsefulSummary;

  // Количество за месяц — предпочитаем сервер только когда он действительно содержит данные
  const expiredThisMonth = serverHasUsefulStats && typeof stats!.summary?.expired_count === 'number'
    ? stats!.summary.expired_count
    : expiredThisMonthList.length;

  // Потери за месяц: если есть stats.summary.cost — используем, иначе считаем локально
  // (добавьте поле cost в summary на сервере, если нужно)
  const expiredCostThisMonth =
    serverHasUsefulStats && typeof (stats!.summary as any)?.cost === 'number'
      ? (stats!.summary as any).cost
      : expiredThisMonthList.reduce((sum, p) => sum + (p.price || 0), 0);

  // Общие потери за всё время
  const totalExpiredCost = allExpiredProducts.reduce((sum, p) => sum + (p.price || 0), 0);

  const categoryData = stats && stats.byCategory && stats.byCategory.length > 0 ?
    stats.byCategory.map(c => ({ category: c.category, count: c.count }))
    : Object.entries(allExpiredProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>))
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);


  // Trend data for last 6 months
  const getTrendData = (expiredList: typeof allExpiredProducts) => {
    // Если есть stats.series и она не пуста — используем её
    if (serverHasUsefulSeries && stats && Array.isArray(stats.series) && stats.series.length > 0) {
      return stats.series.map(s => ({
        month: new Date(s.date).toLocaleDateString('ru-RU', { month: 'short' }),
        expired: s.expired_count || 0,
        cost: s.cost || 0,
      }));
    }

    // Fallback: строим по локальным данным
    const monthsData: { month: string; expired: number; cost: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i, 1);
      date.setHours(0,0,0,0);
      const month = date.getMonth();
      const year = date.getFullYear();

      const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
      const startOfNextMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);
      const today = new Date();
      today.setHours(0,0,0,0);

      // Для каждого продукта: если есть archivedDate — используем её, иначе expirationDate
      const expiredProducts = expiredList.filter(product => {
        let checkDate: Date | null = null;
        if (product.archivedDate) {
          checkDate = new Date(product.archivedDate);
        } else if (product.expirationDate) {
          checkDate = new Date(product.expirationDate);
        }
        if (!checkDate) return false;
        // Только если продукт реально просрочен (checkDate < сегодня)
        if (checkDate.getTime() >= today.getTime()) return false;
        return checkDate.getTime() >= startOfMonth.getTime() && checkDate.getTime() < startOfNextMonth.getTime();
      });

      const expiredCount = expiredProducts.length;
      const expiredCost = expiredProducts.reduce((sum, product) => sum + (product.price || 0), 0);

      monthsData.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        expired: expiredCount,
        cost: expiredCost
      });
    }
    return monthsData;
  };

  const trendData = getTrendData(allExpiredProducts);

  if (__DEV__) {
    console.log('[Stats] allExpiredProducts:', allExpiredProducts.length, allExpiredProducts);
    console.log('[Stats] expiredThisMonthList:', expiredThisMonthList.length, expiredThisMonthList);
    console.log('[Stats] trendData:', trendData);
  }

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
      data: trendData.map(data => data.expired).length > 0 ? trendData.map(data => data.expired) : [0],
      color: (opacity = 1) => `rgba(21, 101, 192, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const costTrendData = {
    labels: trendData.map(data => data.month).length > 0 ? trendData.map(data => data.month) : [''],
    datasets: [{
      data: trendData.map(data => data.cost).length > 0 ? trendData.map(data => data.cost) : [0],
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await loadStats(true);
            setRefreshing(false);
          }} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Статистика</Text>
          <Text style={styles.subtitle}>Анализ управления продуктами</Text>
          {/* Local stats indicator removed per UX request */}
        </View>

        { (appLoading || loading) && (
          <View style={{ padding: 16 }}>
            <ActivityIndicator size="large" />
          </View>
        ) }

        { error && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        ) }

        <View style={styles.content}>
          {/* Monthly Summary (текущий месяц) */}
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

          {/* Total Expenses Card (всё время) */}
          <View style={styles.totalCard}>
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>Общие потери от просрочки (всё время)</Text>
              <Text style={styles.totalAmount}>{totalExpiredCost.toFixed(2)} ₽</Text>
              <Text style={styles.totalDescription}>
                Всего просрочено: {allExpiredProducts.length} продуктов
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