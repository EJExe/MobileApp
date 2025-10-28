import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from "react-native";
import { useApp } from '../src/context/AppContext';
import { AddProductScreen } from '../src/screens/AddProductScreen';

export default function AddProduct() {
  const { addProduct } = useApp();
  const router = useRouter();

  const handleSave = async (productData: any) => {
    try {
      console.log('Начало сохранения продукта...');
      addProduct(productData);
      console.log('Продукт сохранен, переход назад...');
      
      // Простая навигация назад
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/main'); // fallback если нельзя вернуться назад
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить продукт');
    }
  };

  const handleBack = () => {
    console.log('Back pressed');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/main');
    }
  };

  return (
    <AddProductScreen
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}