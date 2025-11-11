import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { RecipeDetailScreen } from '../src/screens/RecipeDetailScreen';
import { Recipe } from '../src/utils/RecipeDatabase';

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const recipe = JSON.parse(params.recipe as string) as Recipe;

  const handleSaveRecipe = (recipe: Recipe) => {
    // Здесь можно добавить логику сохранения рецепта в избранное
    console.log('Сохранен рецепт:', recipe.name);
  };

  return (
    <RecipeDetailScreen
      recipe={recipe}
      onBack={() => router.back()}
      onSaveRecipe={handleSaveRecipe}
    />
  );
}