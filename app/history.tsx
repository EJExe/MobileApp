import React from 'react';
import { useApp } from '../src/context/AppContext';
import { HistoryScreen } from '../src/screens/HistoryScreen';

export default function History() {
  const { products, archivedProducts, clearHistory } = useApp();

  const handleClearHistory = async () => {
    try {
      await clearHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
      // Можно показать уведомление об ошибке пользователю
    }
  };

  return (
    <HistoryScreen
      products={products}
      archivedProducts={archivedProducts}
      onClearHistory={handleClearHistory}
    />
  );
}