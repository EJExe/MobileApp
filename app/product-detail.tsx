import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Product } from '../src/components/ProductForm';
import { useApp } from '../src/context/AppContext';
import { ProductDetailScreen } from '../src/screens/ProductDetailScreen';

export default function ProductDetail() {
  const { deleteProduct, markProductAsUsed } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const product = JSON.parse(params.product as string) as Product;

  // Обертки для функций с навигацией
  const handleMarkAsUsed = (id: string) => {
    markProductAsUsed(id);
    router.replace('/main'); // Переход на главную после отметки как использованного
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    router.replace('/main'); // Переход на главную после удаления
  };

  return (
    <ProductDetailScreen
      product={product}
      onBack={() => router.back()}
      onMarkAsUsed={handleMarkAsUsed}
      onDelete={handleDelete}
    />
  );
}