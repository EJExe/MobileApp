import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useApp } from '../src/context/AppContext';
import { MainScreen } from '../src/screens/MainScreen';

export default function Main() {
  const { products, markProductAsUsed } = useApp();
  const router = useRouter();

  const handleMarkAsUsed = async (id: string) => {
    try {
      await markProductAsUsed(id);
    } catch (error) {
      console.error('Error marking product as used:', error);
      // Можно показать уведомление об ошибке пользователю
    }
  };

  return (
    <MainScreen
      products={products}
      onAddProduct={() => router.push('/add-method-selection')}
      onProductClick={(product) => router.push({
        pathname: '/product-detail',
        params: { product: JSON.stringify(product) }
      })}
      onMarkAsUsed={handleMarkAsUsed}
    />
  );
}