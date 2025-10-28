import React from 'react';
import { useApp } from '../src/context/AppContext';
import { StatsScreen } from '../src/screens/StatsScreen';

export default function Stats() {
  const { products, archivedProducts } = useApp();

  return (
    <StatsScreen
      products={products}
      archivedProducts={archivedProducts}
    />
  );
}