import { useRouter } from 'expo-router';
import React from 'react';
import { useApp } from '../src/context/AppContext';
import { QRScanScreen } from '../src/screens/QRScanScreen';

export default function QRScan() {
  const router = useRouter();
  const { addMultipleProducts } = useApp();

  const handleProductsScanned = async (products: any[]) => {
    try {
      await addMultipleProducts(products);
      router.replace('/main'); // Переход на главную после добавления продуктов
    } catch (error) {
      console.error('Error adding products:', error);
      // Можно показать уведомление об ошибке пользователю
    }
  };

  return (
    <QRScanScreen
      onBack={() => router.back()}
      onProductsScanned={handleProductsScanned}
    />
  );
}