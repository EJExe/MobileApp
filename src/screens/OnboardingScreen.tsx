import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Иконки (замените на react-native-vector-icons)
const Package = () => <Text style={styles.iconText}>📦</Text>;
const Calendar = () => <Text style={styles.iconText}>📅</Text>;
const CheckCircle = () => <Text style={styles.iconText}>✅</Text>;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { minHeight: screenHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <View style={styles.heroImageBackground}>
              <View style={styles.heroImageContent}>
                <View style={styles.heroIcons}>
                  <View style={styles.mainIcon}>
                    <Package />
                  </View>
                  <View style={styles.floatingIcon}>
                    <Calendar />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.textContent}>
            <Text style={styles.title}>
              Ничего не забыть.{'\n'}
              Ничего не испортить.
            </Text>
            <Text style={styles.subtitle}>
              Отслеживайте сроки годности продуктов и экономьте деньги, избегая пищевых отходов
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <CheckCircle />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Умные уведомления</Text>
                <Text style={styles.featureDescription}>Напомним до истечения срока</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Package />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Простое управление</Text>
                <Text style={styles.featureDescription}>Добавляйте продукты за секунды</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Calendar />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Аналитика</Text>
                <Text style={styles.featureDescription}>Отслеживайте экономию</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={onComplete}
          >
            <Text style={styles.ctaButtonText}>Начать использование</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Присоединяйтесь к тысячам пользователей, которые экономят деньги
          </Text>
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
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: 256,
    height: 256,
  },
  heroImageBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f9ff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroImageContent: {
    width: '85%',
    height: '85%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcons: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIcon: {
    // fontSize moved to iconText style
  },
  floatingIcon: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentSection: {
    paddingHorizontal: 24,
    gap: 32,
  },
  textContent: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  featuresSection: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Новый стиль для иконок
  iconText: {
    fontSize: 20, // Размер для обычных иконок
  },
});