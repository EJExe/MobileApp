import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Product } from '../src/components/ProductForm';
import { useApp } from '../src/context/AppContext';
import { ProductDetailScreen } from '../src/screens/ProductDetailScreen';
import { Recipe } from '../src/utils/RecipeDatabase'; // Добавьте этот импорт

export default function ProductDetail() {
  const { deleteProduct, markProductAsUsed } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const product = JSON.parse(params.product as string) as Product;

  const handleMarkAsUsed = async (id: string) => {
    try {
      await markProductAsUsed(id);
      router.replace('/main');
    } catch (error) {
      console.error('Error marking product as used:', error);
      // Можно показать уведомление об ошибке пользователю
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      router.replace('/main');
    } catch (error) {
      console.error('Error deleting product:', error);
      // Можно показать уведомление об ошибке пользователю
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // Навигация на экран детализации рецепта
    router.push({
      pathname: '/recipe-detail' as any, // Используем any чтобы обойти проверку типов
      params: { recipe: JSON.stringify(recipe) }
    });
  };

  return (
    <ProductDetailScreen
      product={product}
      onBack={() => router.back()}
      onMarkAsUsed={handleMarkAsUsed}
      onDelete={handleDelete}
      onRecipeClick={handleRecipeClick}
    />
  );
}