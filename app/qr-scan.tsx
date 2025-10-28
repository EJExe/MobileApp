import { useRouter } from 'expo-router';
import React from 'react';
import { useApp } from '../src/context/AppContext';
import { QRScanScreen } from '../src/screens/QRScanScreen';

export default function QRScan() {
  const router = useRouter();
  const { addMultipleProducts } = useApp();

  const handleProductsScanned = (products: any[]) => {
    addMultipleProducts(products);
    router.replace('/main'); // Переход на главную после добавления продуктов
  };

  return (
    <QRScanScreen
      onBack={() => router.back()}
      onProductsScanned={handleProductsScanned}
    />
  );
}