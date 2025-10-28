import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Product } from '../components/ProductForm';

// Иконки (нужно будет установить react-native-vector-icons)
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DashboardProps {
  products?: Product[];
}

// Временные иконки (замените на реальные из react-native-vector-icons)
const TrendingUp = () => <Text>📈</Text>;
const AlertTriangle = () => <Text>⚠️</Text>;
const CheckCircle = () => <Text>✅</Text>;
const Clock = () => <Text>⏰</Text>;
const Calendar = () => <Text>📅</Text>;
const Lightbulb = () => <Text>💡</Text>;
const Package = () => <Text>📦</Text>;

export function Dashboard({ products = [] }: DashboardProps) {
  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring';
    return 'fresh';
  };

  const getStats = () => {
    const stats = { fresh: 0, expiring: 0, expired: 0 };
    products.forEach(product => {
      const status = getExpirationStatus(product.expirationDate);
      stats[status as keyof typeof stats]++;
    });
    return stats;
  };

  const getCategoryStats = () => {
    const categoryStats: { [key: string]: number } = {};
    products.forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });
    return Object.entries(categoryStats).map(([category, count]) => ({
      category,
      count
    }));
  };

  const getUpcomingExpirations = () => {
    const upcoming = products
      .filter(product => {
        const status = getExpirationStatus(product.expirationDate);
        return status === 'expiring' || status === 'expired';
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      .slice(0, 5);
    
    return upcoming;
  };

  const stats = getStats();
  const categoryData = getCategoryStats();
  const upcomingExpirations = getUpcomingExpirations();

  const pieData = [
    { name: 'Свежие', population: stats.fresh, color: '#22c55e', legendFontColor: '#7F7F7F' },
    { name: 'Истекают скоро', population: stats.expiring, color: '#f59e0b', legendFontColor: '#7F7F7F' },
    { name: 'Просроченные', population: stats.expired, color: '#ef4444', legendFontColor: '#7F7F7F' }
  ];

  const barData = {
    labels: categoryData.map(item => item.category),
    datasets: [{
      data: categoryData.map(item => item.count)
    }]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };

  const tips = [
    {
      icon: <Lightbulb />,
      title: "Молочные продукты",
      tip: "Храните в самой холодной части холодильника (не в дверце)"
    },
    {
      icon: <Lightbulb />,
      title: "Хлеб",
      tip: "Замораживайте излишки хлеба - размороженный хлеб сохраняет свежесть"
    },
    {
      icon: <Lightbulb />,
      title: "Овощи и фрукты",
      tip: "Храните отдельно - некоторые фрукты ускоряют созревание овощей"
    }
  ];

  if (products.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.emptyState}>
          <TrendingUp />
          <Text style={styles.emptyTitle}>Добро пожаловать в трекер продуктов!</Text>
          <Text style={styles.emptySubtitle}>Добавьте ваши первые продукты, чтобы увидеть аналитику</Text>
        </View>

        {/* Tips for empty state */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Lightbulb />
              <Text style={styles.cardTitle}>Полезные советы по хранению</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.tipsContainer}>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipIcon}>{tip.icon}</View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>Всего продуктов</Text>
              <Text style={styles.statValue}>{products.length}</Text>
            </View>
            <Package />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>Свежие</Text>
              <Text style={[styles.statValue, styles.freshText]}>{stats.fresh}</Text>
            </View>
            <CheckCircle />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>Истекают скоро</Text>
              <Text style={[styles.statValue, styles.expiringText]}>{stats.expiring}</Text>
            </View>
            <Clock />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>Просроченные</Text>
              <Text style={[styles.statValue, styles.expiredText]}>{stats.expired}</Text>
            </View>
            <AlertTriangle />
          </View>
        </View>
      </View>

      <View style={styles.chartsRow}>
        {/* Status Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Распределение по статусу</Text>
          </View>
          <View style={styles.cardContent}>
            <PieChart
              data={pieData}
              width={Dimensions.get('window').width - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Продукты по категориям</Text>
          </View>
          <View style={styles.cardContent}>
            <BarChart
              data={barData}
              width={Dimensions.get('window').width - 80}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={-45}
              fromZero={true}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        {/* Upcoming Expirations */}
        <View style={styles.halfCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Calendar />
              <Text style={styles.cardTitle}>Ближайшие истечения сроков</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            {upcomingExpirations.length === 0 ? (
              <Text style={styles.noDataText}>Нет продуктов, требующих внимания</Text>
            ) : (
              <View style={styles.expirationsList}>
                {upcomingExpirations.map((product) => {
                  const status = getExpirationStatus(product.expirationDate);
                  const isExpired = status === 'expired';
                  return (
                    <View key={product.id} style={styles.expirationItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productCategory}>{product.category}</Text>
                      </View>
                      <View style={[
                        styles.dateBadge,
                        isExpired ? styles.expiredBadge : styles.expiringBadge
                      ]}>
                        <Text style={styles.dateText}>
                          {new Date(product.expirationDate).toLocaleDateString('ru-RU')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.halfCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Lightbulb />
              <Text style={styles.cardTitle}>Полезные советы</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.tipsContainer}>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipIcon}>{tip.icon}</View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  freshText: {
    color: '#22c55e',
  },
  expiringText: {
    color: '#f59e0b',
  },
  expiredText: {
    color: '#ef4444',
  },
  chartsRow: {
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomRow: {
    marginBottom: 16,
  },
  halfCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
    gap: 12,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 16,
  },
  expirationsList: {
    gap: 12,
  },
  expirationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expiredBadge: {
    backgroundColor: '#fee2e2',
  },
  expiringBadge: {
    backgroundColor: '#f3f4f6',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
});