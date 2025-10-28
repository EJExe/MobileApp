import { useRouter } from 'expo-router';
import React from 'react';
import { useApp } from '../src/context/AppContext';
import { MainScreen } from '../src/screens/MainScreen';

export default function Main() {
  const { products, markProductAsUsed } = useApp();
  const router = useRouter();

  return (
    <MainScreen
      products={products}
      onAddProduct={() => router.push('/add-method-selection')}
      onProductClick={(product) => router.push({
        pathname: '/product-detail',
        params: { product: JSON.stringify(product) }
      })}
      onMarkAsUsed={markProductAsUsed}
    />
  );
}