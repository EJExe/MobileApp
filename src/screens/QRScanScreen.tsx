import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Product } from '../components/ProductForm';

// Иконки (замените на react-native-vector-icons)
const ArrowLeft = () => <Text>⬅️</Text>;
const QrCode = () => <Text>📷</Text>;
const Camera = () => <Text>📸</Text>;
const FileText = () => <Text>📄</Text>;
const Check = () => <Text>✅</Text>;

interface QRScanScreenProps {
  onBack: () => void;
  onProductsScanned: (products: Omit<Product, 'id'>[]) => void;
}

// Демо данные для имитации результата сканирования
const mockScanResults: Omit<Product, 'id'>[] = [
  {
    name: 'Молоко 3.2%',
    category: 'Молочные продукты',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 89.50
  },
  {
    name: 'Хлеб черный',
    category: 'Хлеб и выпечка',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 45.00
  },
  {
    name: 'Яблоки красные',
    category: 'Фрукты',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 125.30
  }
];

export function QRScanScreen({ onBack, onProductsScanned }: QRScanScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Omit<Product, 'id'>[]>([]);
  const [isScanned, setIsScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Запрашиваем разрешение при монтировании
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleScan = () => {
    if (!permission?.granted) {
      Alert.alert(
        'Разрешение на камеру',
        'Для сканирования QR-кодов необходимо разрешение на использование камеры',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Запросить', onPress: requestPermission }
        ]
      );
      return;
    }
    
    setIsScanning(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScanning(false);
    
    // В реальном приложении здесь будет парсинг QR-кода чека
    // Сейчас используем демо данные
    try {
      // Имитация обработки данных QR-кода
      setTimeout(() => {
        setScannedProducts(mockScanResults);
        setIsScanned(true);
      }, 1000);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось распознать QR-код. Попробуйте еще раз.');
      setIsScanning(false);
    }
  };

  const handleManualScan = () => {
    // Альтернатива: имитация сканирования без камеры
    setIsScanning(true);
    setTimeout(() => {
      setScannedProducts(mockScanResults);
      setIsScanned(true);
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirm = () => {
    onProductsScanned(scannedProducts);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Молочные продукты': '🥛',
      'Мясо и рыба': '🥩',
      'Овощи': '🥬',
      'Фрукты': '🍎',
      'Хлеб и выпечка': '🍞',
      'Консервы': '🥫',
      'Напитки': '🥤',
      'Заморозка': '🧊',
    };
    return icons[category] || '📦';
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft />
          </TouchableOpacity>
          <Text style={styles.title}>Сканирование QR-кода</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Запрос разрешения камеры...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft />
          </TouchableOpacity>
          <Text style={styles.title}>Сканирование QR-кода</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.permissionText}>
            Для сканирования QR-кодов необходимо разрешение на использование камеры
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Запросить разрешение</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Сканирование QR-кода</Text>
            <Text style={styles.subtitle}>Наведите камеру на QR-код чека</Text>
          </View>
        </View>

        {!isScanned ? (
          <View style={styles.content}>
            {/* Scanner Area */}
            <View style={styles.scannerCard}>
              <View style={styles.scannerContent}>
                <View style={styles.scannerIcon}>
                  {isScanning ? (
                    <View style={styles.scanningAnimation}>
                      <Camera />
                      <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
                    </View>
                  ) : (
                    <QrCode />
                  )}
                </View>
                
                <Text style={styles.scannerTitle}>
                  {isScanning ? 'Сканирование...' : 'Готов к сканированию'}
                </Text>
                
                <Text style={styles.scannerDescription}>
                  {isScanning 
                    ? 'Обрабатываем данные чека' 
                    : 'Найдите QR-код на чеке и наведите камеру'
                  }
                </Text>
                
                {!isScanning && (
                  <View style={styles.scanButtons}>
                    <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                      <Text style={styles.scanButtonText}>Начать сканирование</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.manualButton} onPress={handleManualScan}>
                      <Text style={styles.manualButtonText}>Демо-сканирование</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Camera View for actual scanning */}
            {isScanning && permission.granted && (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                />
                <View style={styles.cameraOverlay}>
                  <Text style={styles.cameraOverlayText}>Наведите на QR-код</Text>
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructions}>
              <View style={styles.instructionsRow}>
                <FileText />
                <View style={styles.instructionsText}>
                  <Text style={styles.instructionsTitle}>Как найти QR-код</Text>
                  <Text style={styles.instructionsDescription}>
                    QR-код обычно находится в нижней части чека. Убедитесь, что код четко виден и хорошо освещен.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Success Message */}
            <View style={styles.successCard}>
              <View style={styles.successContent}>
                <View style={styles.successIcon}>
                  <Check />
                </View>
                <View style={styles.successText}>
                  <Text style={styles.successTitle}>Чек успешно отсканирован!</Text>
                  <Text style={styles.successDescription}>
                    Найдено {scannedProducts.length} продуктов
                  </Text>
                </View>
              </View>
            </View>

            {/* Scanned Products */}
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Найденные продукты</Text>
              <View style={styles.productsList}>
                {scannedProducts.map((product, index) => (
                  <View key={index} style={styles.productCard}>
                    <View style={styles.productContent}>
                      <View style={styles.productRow}>
                        <Text style={styles.productIcon}>
                          {getCategoryIcon(product.category)}
                        </Text>
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{product.name}</Text>
                          <Text style={styles.productCategory}>{product.category}</Text>
                          <Text style={styles.productDate}>
                            До: {new Date(product.expirationDate).toLocaleDateString('ru-RU')}
                          </Text>
                        </View>
                        {product.price && (
                          <View style={styles.productPrice}>
                            <Text style={styles.priceText}>{product.price.toFixed(2)} ₽</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Total */}
            <View style={styles.totalCard}>
              <View style={styles.totalContent}>
                <Text style={styles.totalLabel}>Общая стоимость:</Text>
                <Text style={styles.totalAmount}>
                  {scannedProducts.reduce((sum, product) => sum + (product.price || 0), 0).toFixed(2)} ₽
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsScanned(false)}
              >
                <Text style={styles.secondaryButtonText}>Сканировать заново</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.primaryButtonText}>Добавить продукты</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scannerContent: {
    padding: 32,
    alignItems: 'center',
  },
  scannerIcon: {
    width: 128,
    height: 128,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanningAnimation: {
    alignItems: 'center',
  },
  loader: {
    marginTop: 8,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  scannerDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButtons: {
    gap: 12,
    width: '100%',
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraOverlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 16,
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  instructionsDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  successCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  successIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#bbf7d0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#166534',
    marginBottom: 4,
  },
  successDescription: {
    fontSize: 14,
    color: '#166534',
  },
  productsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
  },
  productsList: {
    gap: 8,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productContent: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productIcon: {
    fontSize: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  productDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  productPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  totalContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});