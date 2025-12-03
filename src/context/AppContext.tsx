import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../components/ProductForm';
import { CreateProductDto, productApi } from '../services/api';

const AppContext = createContext<{
  products: Product[];
  archivedProducts: Product[];
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addMultipleProducts: (products: Omit<Product, 'id'>[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  markProductAsUsed: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  importData: (products: Product[]) => Promise<void>;
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

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (onboardingData) {
        setHasCompletedOnboarding(JSON.parse(onboardingData));
      }

      const [activeProducts, archived] = await Promise.all([
        productApi.getProducts(false),
        productApi.getProducts(true),
      ]);
      
      setProducts(activeProducts);
      setArchivedProducts(archived);
    } catch (error) {
      console.error('Error loading app data:', error);
      try {
        const productsData = await AsyncStorage.getItem('products');
        const archivedData = await AsyncStorage.getItem('archivedProducts');
        
        if (productsData) {
          setProducts(JSON.parse(productsData));
        }
        if (archivedData) {
          setArchivedProducts(JSON.parse(archivedData));
        }
      } catch (fallbackError) {
        console.error('Error loading from local storage:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('hasCompletedOnboarding', JSON.stringify(hasCompletedOnboarding));
    }
  }, [hasCompletedOnboarding, isLoading]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const createDto: CreateProductDto = {
        name: productData.name,
        category: productData.category,
        purchaseDate: productData.purchaseDate,  // Уже может быть undefined
        expirationDate: productData.expirationDate,
        price: productData.price,
      };
      
      const newProduct = await productApi.createProduct(createDto);
      setProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const addMultipleProducts = async (productsData: Omit<Product, 'id'>[]) => {
    try {
      const createDtos: CreateProductDto[] = productsData.map(productData => ({
        name: productData.name,
        category: productData.category,
        purchaseDate: productData.purchaseDate,
        expirationDate: productData.expirationDate,
        price: productData.price,
      }));
      
      const newProducts = await productApi.createProducts(createDtos);
      setProducts(prev => [...prev, ...newProducts]);
    } catch (error) {
      console.error('Error adding products:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const markProductAsUsed = async (id: string) => {
    try {
      const archivedProduct = await productApi.markProductAsUsed(id);
      setArchivedProducts(prev => [...prev, archivedProduct]);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error marking product as used:', error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await productApi.clearHistory();
      setArchivedProducts([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  };

  const importData = async (importedProducts: Product[]) => {
    try {
      const createDtos: CreateProductDto[] = importedProducts.map(product => ({
        name: product.name,
        category: product.category,
        purchaseDate: product.purchaseDate,
        expirationDate: product.expirationDate,
        price: product.price,
      }));
      
      const newProducts = await productApi.createProducts(createDtos);
      setProducts(newProducts);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
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
      isLoading,
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