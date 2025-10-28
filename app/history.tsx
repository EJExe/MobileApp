import React from 'react';
import { useApp } from '../src/context/AppContext';
import { HistoryScreen } from '../src/screens/HistoryScreen';

export default function History() {
  const { products, archivedProducts, clearHistory } = useApp();

  return (
    <HistoryScreen
      products={products}
      archivedProducts={archivedProducts}
      onClearHistory={clearHistory}
    />
  );
}