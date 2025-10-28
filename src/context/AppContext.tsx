import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../components/ProductForm';

const AppContext = createContext<{
  products: Product[];
  archivedProducts: Product[];
  hasCompletedOnboarding: boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addMultipleProducts: (products: Omit<Product, 'id'>[]) => void;
  deleteProduct: (id: string) => void;
  markProductAsUsed: (id: string) => void;
  clearHistory: () => void;
  importData: (products: Product[]) => void;
  completeOnboarding: () => void;
} | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных при запуске
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const [onboardingData, productsData, archivedData] = await Promise.all([
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('archivedProducts'),
      ]);

      if (onboardingData) {
        setHasCompletedOnboarding(JSON.parse(onboardingData));
      }

      if (productsData) {
        setProducts(JSON.parse(productsData));
      }

      if (archivedData) {
        setArchivedProducts(JSON.parse(archivedData));
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение данных с исправленными зависимостями
  useEffect(() => {
  if (!isLoading) {
    saveAppData();
  }
}, [products, archivedProducts, hasCompletedOnboarding]);

  const saveAppData = async () => {
  try {
    const dataToSave = {
      products: JSON.stringify(products),
      archivedProducts: JSON.stringify(archivedProducts),
      hasCompletedOnboarding: JSON.stringify(hasCompletedOnboarding)
    };
    
    await Promise.all([
      AsyncStorage.setItem('hasCompletedOnboarding', dataToSave.hasCompletedOnboarding),
      AsyncStorage.setItem('products', dataToSave.products),
      AsyncStorage.setItem('archivedProducts', dataToSave.archivedProducts),
    ]);
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving app data:', error);
  }
};

  // Управление продуктами
  const addProduct = (productData: Omit<Product, 'id'>) => {
    console.log('Adding product:', productData);
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addMultipleProducts = (productsData: Omit<Product, 'id'>[]) => {
    const newProducts: Product[] = productsData.map(productData => ({
      ...productData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const markProductAsUsed = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const archivedProduct: Product = {
        ...product,
        archivedDate: new Date().toISOString().split('T')[0],
        archiveReason: 'used' as const,
      };
      setArchivedProducts(prev => [...prev, archivedProduct]);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const clearHistory = () => {
    setArchivedProducts([]);
  };

  const importData = (importedProducts: Product[]) => {
    const productsWithNewIds = importedProducts.map(product => ({
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    setProducts(productsWithNewIds);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AppContext.Provider value={{
      products,
      archivedProducts,
      hasCompletedOnboarding,
      addProduct,
      addMultipleProducts,
      deleteProduct,
      markProductAsUsed,
      clearHistory,
      importData,
      completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
}