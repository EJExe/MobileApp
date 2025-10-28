import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Recipe } from '../utils/RecipeDatabase';

// Иконки (замените на react-native-vector-icons)
const ArrowLeft = () => <Text>⬅️</Text>;
const Clock = () => <Text>⏰</Text>;
const Users = () => <Text>👥</Text>;
const ChefHat = () => <Text>👨‍🍳</Text>;
const CheckCircle2 = () => <Text>✅</Text>;

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
}

export function RecipeDetailScreen({ recipe, onBack }: RecipeDetailScreenProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Легко': return styles.easyBadge;
      case 'Средне': return styles.mediumBadge;
      case 'Сложно': return styles.hardBadge;
      default: return styles.defaultBadge;
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Легко': return styles.easyBadgeText;
      case 'Средне': return styles.mediumBadgeText;
      case 'Сложно': return styles.hardBadgeText;
      default: return styles.defaultBadgeText;
    }
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Image */}
        <View style={[styles.headerImage, { height: screenWidth * 0.7 }]}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <ArrowLeft />
          </TouchableOpacity>

          {/* Title Overlay */}
          <View style={styles.titleOverlay}>
            <View style={styles.badgesRow}>
              <View style={[styles.badge, getDifficultyColor(recipe.difficulty)]}>
                <Text style={[styles.badgeText, getDifficultyTextColor(recipe.difficulty)]}>
                  {recipe.difficulty}
                </Text>
              </View>
              <View style={[styles.badge, styles.categoryBadge]}>
                <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
              </View>
            </View>
            <Text style={styles.recipeTitle}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <View style={styles.infoIcon}>
                  <Clock />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Время</Text>
                  <Text style={styles.infoValue}>{recipe.cookingTime} мин</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <View style={styles.infoIcon}>
                  <Users />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Порций</Text>
                  <Text style={styles.infoValue}>{recipe.servings}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <ChefHat />
                <Text style={styles.cardTitle}>Ингредиенты</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet}>
                      <View style={styles.ingredientDot} />
                    </View>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <CheckCircle2 />
                <Text style={styles.cardTitle}>Инструкция по приготовлению</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.instructionsList}>
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.instructionText}>
                      <Text style={styles.instructionContent}>{instruction}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsText}>
              <Text style={styles.tipsTitle}>💡 Совет шефа:</Text> Используйте свежие продукты для лучшего вкуса. 
              Если у продукта скоро истекает срок годности, это отличный способ его использовать!
            </Text>
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
  headerImage: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  easyBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  easyBadgeText: {
    color: '#166534',
  },
  mediumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  mediumBadgeText: {
    color: '#92400e',
  },
  hardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  hardBadgeText: {
    color: '#991b1b',
  },
  defaultBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  defaultBadgeText: {
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  recipeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
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
  ingredientsList: {
    gap: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ingredientBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  instructionsList: {
    gap: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    paddingTop: 4,
  },
  instructionContent: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  tipsText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  tipsTitle: {
    fontWeight: '600',
  },
});