import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Recipe } from '../utils/RecipeDatabase';

// Иконки
const ArrowLeft = () => <Text>⬅️</Text>;
const Clock = () => <Text>⏰</Text>;
const Users = () => <Text>👥</Text>;
const ChefHat = () => <Text>👨‍🍳</Text>;
const ShareIcon = () => <Text>📤</Text>;
const Bookmark = () => <Text>🔖</Text>;

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onSaveRecipe?: (recipe: Recipe) => void;
}

export function RecipeDetailScreen({ recipe, onBack, onSaveRecipe }: RecipeDetailScreenProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Попробуй этот рецепт: ${recipe.name}\n\nИнгредиенты:\n${recipe.ingredients.join('\n')}\n\nИнструкции:\n${recipe.instructions.join('\n')}`,
        title: recipe.name
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться рецептом');
    }
  };

  const handleSaveRecipe = () => {
    if (onSaveRecipe) {
      onSaveRecipe(recipe);
      Alert.alert('Успех', 'Рецепт сохранен в избранное!');
    }
  };

  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'Легко': return '#22c55e';
      case 'Средне': return '#f59e0b';
      case 'Сложно': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft />
          </TouchableOpacity>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSaveRecipe}>
              <Bookmark />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <ShareIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipe Content */}
        <View style={styles.content}>
          
          {/* Recipe Header */}
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            
            <View style={styles.recipeMeta}>
              <View style={styles.metaItem}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
                  <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                </View>
              </View>
              <View style={styles.metaItem}>
                <Clock />
                <Text style={styles.metaText}>{recipe.cookingTime} мин</Text>
              </View>
              <View style={styles.metaItem}>
                <Users />
                <Text style={styles.metaText}>{recipe.servings} порций</Text>
              </View>
              <View style={styles.metaItem}>
                <ChefHat />
                <Text style={styles.metaText}>{recipe.category}</Text>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ингредиенты</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Инструкция приготовления</Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Советы</Text>
            <Text style={styles.tipsText}>
              • Можно заменить ингредиенты на аналогичные по вашему вкусу{'\n'}
              • Время приготовления может варьироваться в зависимости от плиты{'\n'}
              • Не бойтесь экспериментировать со специями!
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
    paddingBottom: 32,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  recipeHeader: {
    gap: 12,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  recipeDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ingredientsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  tipsSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
});