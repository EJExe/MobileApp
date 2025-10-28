import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DatePicker from 'react-native-date-picker';

// Иконки (замените на react-native-vector-icons)
const Plus = () => <Text>➕</Text>;

export interface Product {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  price?: number;
  archivedDate?: string;
  archiveReason?: 'used' | 'expired';
}

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const categories = [
  'Молочные продукты',
  'Мясо и рыба',
  'Овощи',
  'Фрукты',
  'Хлеб и выпечка',
  'Консервы',
  'Напитки',
  'Заморозка',
  'Другое'
];

export function ProductForm({ onAddProduct }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    price: ''
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'purchaseDate' | 'expirationDate' | null>(null);

  const handleSubmit = () => {
    if (formData.name && formData.category && formData.expirationDate) {
      const productData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined
      };
      onAddProduct(productData);
      setFormData({
        name: '',
        category: '',
        purchaseDate: '',
        expirationDate: '',
        price: ''
      });
      Alert.alert('Успех', 'Продукт успешно добавлен!');
    } else {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
    }
  };

  // Функция для открытия DatePicker
  const showDatePicker = (field: 'purchaseDate' | 'expirationDate') => {
    setCurrentDateField(field);
    setDatePickerVisible(true);
  };

  // Функция подтверждения выбора даты
  const handleDateConfirm = (date: Date) => {
    if (currentDateField) {
      setFormData({ 
        ...formData, 
        [currentDateField]: date.toISOString().split('T')[0] 
      });
    }
    setDatePickerVisible(false);
    setCurrentDateField(null);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        formData.category === item && styles.selectedModalItem
      ]}
      onPress={() => {
        setFormData({ ...formData, category: item });
        setCategoryModalVisible(false);
      }}
    >
      <Text style={[
        styles.modalItemText,
        formData.category === item && styles.selectedModalItemText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Plus />
              <Text style={styles.cardTitle}>Добавить продукт</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Название продукта *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Молоко, хлеб, яблоки..."
                placeholderTextColor="#666"
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Категория *</Text>
              <TouchableOpacity 
                style={styles.selectTrigger}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={formData.category ? styles.selectValue : styles.selectPlaceholder}>
                  {formData.category || 'Выберите категорию'}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={categoryModalVisible}
                animationType="slide"
                transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите категорию</Text>
                    <FlatList
                      data={categories}
                      renderItem={renderCategoryItem}
                      keyExtractor={(item) => item}
                    />
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setCategoryModalVisible(false)}
                    >
                      <Text style={styles.modalCloseText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            {/* Purchase Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Дата покупки (необязательно)</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePicker('purchaseDate')}
              >
                <Text style={formData.purchaseDate ? styles.dateText : styles.datePlaceholder}>
                  {formData.purchaseDate || 'Выберите дату'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expiration Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Срок годности до *</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePicker('expirationDate')}
              >
                <Text style={formData.expirationDate ? styles.dateText : styles.datePlaceholder}>
                  {formData.expirationDate || 'Выберите дату'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Стоимость (необязательно)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Добавить продукт</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={datePickerVisible}
        date={new Date()}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setDatePickerVisible(false);
          setCurrentDateField(null);
        }}
        title="Выберите дату"
        confirmText="Выбрать"
        cancelText="Отмена"
      />
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
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardContent: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectTrigger: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedModalItem: {
    backgroundColor: '#3b82f6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedModalItemText: {
    color: 'white',
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});