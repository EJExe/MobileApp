import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Recipe } from '../utils/RecipeDatabase';

// Иконки (замените на react-native-vector-icons)
const Clock = () => <Text>⏰</Text>;
const Users = () => <Text>👥</Text>;
const ChefHat = () => <Text>👨‍🍳</Text>;

interface RecipeSuggestionsProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
}

export function RecipeSuggestions({ recipes, onRecipeClick }: RecipeSuggestionsProps) {
  if (recipes.length === 0) {
    return null;
  }

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ChefHat />
          <Text style={styles.title}>Рецепты с этим продуктом</Text>
        </View>
        <View style={styles.recipeCount}>
          <Text style={styles.recipeCountText}>{recipes.length}</Text>
        </View>
      </View>
      
      {/* Recipes List */}
      <View style={styles.recipesList}>
        {recipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => onRecipeClick(recipe)}
            activeOpacity={0.7}
          >
            <View style={styles.recipeContent}>
              {/* Recipe Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                <View style={styles.difficultyBadge}>
                  <View style={[styles.badge, getDifficultyColor(recipe.difficulty)]}>
                    <Text style={[styles.badgeText, getDifficultyTextColor(recipe.difficulty)]}>
                      {recipe.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Recipe Info */}
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName} numberOfLines={1}>
                  {recipe.name}
                </Text>
                <Text style={styles.recipeDescription} numberOfLines={1}>
                  {recipe.description}
                </Text>
                
                <View style={styles.recipeMeta}>
                  <View style={styles.metaItem}>
                    <Clock />
                    <Text style={styles.metaText}>{recipe.cookingTime} мин</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Users />
                    <Text style={styles.metaText}>{recipe.servings} порций</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tip */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 <Text style={styles.tipBold}>Совет:</Text> Нажмите на рецепт, чтобы увидеть подробную инструкцию приготовления
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  recipeCount: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  recipesList: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 96,
    height: 96,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
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
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tipContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  tipText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
  },
});