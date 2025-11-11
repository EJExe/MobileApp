import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddProductScreenProps {
  onBack: () => void;
  onSave: (product: any) => void;
}

const categories = [
  { name: 'Молочные', icon: '🥛', value: 'Молочные продукты' },
  { name: 'Мясо/Рыба', icon: '🥩', value: 'Мясо и рыба' },
  { name: 'Овощи', icon: '🥬', value: 'Овощи' },
  { name: 'Фрукты', icon: '🍎', value: 'Фрукты' },
  { name: 'Хлеб', icon: '🍞', value: 'Хлеб и выпечка' },
  { name: 'Напитки', icon: '🥤', value: 'Напитки' },
  { name: 'Готовые блюда', icon: '🍱', value: 'Готовые блюда' },
  { name: 'Соусы', icon: '🧂', value: 'Соусы/Приправы' },
  { name: 'Другое', icon: '🧂', value: 'Другое' },
];

export function AddProductScreen({ onBack, onSave }: AddProductScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    price: ''
  });

  const [step, setStep] = useState<'name' | 'category' | 'date' | 'price'>('name');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'purchaseDate' | 'expirationDate' | null>(null);

  console.log('AddProductScreen render');

  const handleSubmit = () => {
    try {
      if (formData.name && formData.category && formData.expirationDate) {
        const productData = {
          ...formData,
          purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
          price: formData.price ? parseFloat(formData.price) : undefined
        };
        
        console.log('Сохранение продукта:', productData);
        onSave(productData);
        
        // Сбрасываем форму
        setFormData({
          name: '',
          category: '',
          purchaseDate: '',
          expirationDate: '',
          price: ''
        });
        setStep('name');
      } else {
        Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      }
    } catch (error) {
      console.error('Ошибка при сохранении продукта:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при сохранении продукта');
    }
  };

  const showDatePicker = (field: 'purchaseDate' | 'expirationDate') => {
    setCurrentDateField(field);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(false);
    
    if (selectedDate && currentDateField) {
      setFormData({ 
        ...formData, 
        [currentDateField]: selectedDate.toISOString().split('T')[0] 
      });
    }
    
    setCurrentDateField(null);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      return dateString;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'name': return formData.name.trim().length > 0;
      case 'category': return formData.category.length > 0;
      case 'date': return formData.expirationDate.length > 0;
      case 'price': return true; // Цена не обязательна
      default: return false;
    }
  };

  const nextStep = () => {
    if (step === 'name') setStep('category');
    else if (step === 'category') setStep('date');
    else if (step === 'date') setStep('price');
  };

  const prevStep = () => {
    if (step === 'category') setStep('name');
    else if (step === 'date') setStep('category');
    else if (step === 'price') setStep('date');
    else onBack();
  };

  const getStepNumber = () => {
    switch (step) {
      case 'name': return 1;
      case 'category': return 2;
      case 'date': return 3;
      case 'price': return 4;
      default: return 1;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'name': return 'Название продукта';
      case 'category': return 'Выберите категорию';
      case 'date': return 'Срок годности';
      case 'price': return 'Стоимость продукта';
      default: return 'Добавить продукт';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'name': return 'Введите название продукта, который хотите отслеживать';
      case 'category': return 'Это поможет лучше организовать ваши продукты';
      case 'date': return 'Укажите дату, до которой продукт можно употреблять';
      case 'price': return 'Укажите стоимость продукта (необязательно)';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'name': return '📦';
      case 'category': return '🏷️';
      case 'date': return '📅';
      case 'price': return '💰';
      default: return '📦';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Добавить продукт</Text>
              <Text style={styles.subtitle}>
                Шаг {getStepNumber()} из 4
              </Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, step === 'name' && styles.progressBarActive]} />
            <View style={[styles.progressBar, (step === 'category' || step === 'date' || step === 'price') && styles.progressBarActive]} />
            <View style={[styles.progressBar, (step === 'date' || step === 'price') && styles.progressBarActive]} />
            <View style={[styles.progressBar, step === 'price' && styles.progressBarActive]} />
          </View>

          {/* Step 1: Product Name */}
          {step === 'name' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardIcon}>{getStepIcon()}</Text>
                  <Text style={styles.cardTitle}>{getStepTitle()}</Text>
                </View>
                <Text style={styles.cardDescription}>
                  {getStepDescription()}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Например: Молоко, Хлеб, Яблоки..."
                  placeholderTextColor="#666"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoFocus
                />
              </View>
            </View>
          )}

          {/* Step 2: Category */}
          {step === 'category' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{getStepTitle()}</Text>
                <Text style={styles.cardDescription}>
                  {getStepDescription()}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.categoriesGrid}>
                  {categories.map((categoryItem) => (
                    <TouchableOpacity
                      key={categoryItem.value}
                      style={[
                        styles.categoryButton,
                        formData.category === categoryItem.value && styles.categoryButtonSelected
                      ]}
                      onPress={() => setFormData({ ...formData, category: categoryItem.value })}
                    >
                      <Text style={styles.categoryIcon}>{categoryItem.icon}</Text>
                      <Text style={styles.categoryName}>{categoryItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Expiration Date */}
          {step === 'date' && (
            <View style={styles.stepContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>{getStepIcon()}</Text>
                    <Text style={styles.cardTitle}>{getStepTitle()}</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    {getStepDescription()}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateLabel}>Годен до *</Text>
                    <TouchableOpacity 
                      style={styles.dateInput}
                      onPress={() => showDatePicker('expirationDate')}
                    >
                      <Text style={formData.expirationDate ? styles.dateText : styles.datePlaceholder}>
                        {formData.expirationDate ? formatDisplayDate(formData.expirationDate) : 'Выберите дату'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateLabel}>Дата покупки (необязательно)</Text>
                    <TouchableOpacity 
                      style={styles.dateInput}
                      onPress={() => showDatePicker('purchaseDate')}
                    >
                      <Text style={formData.purchaseDate ? styles.dateText : styles.datePlaceholder}>
                        {formData.purchaseDate ? formatDisplayDate(formData.purchaseDate) : 'Выберите дату'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Product Preview */}
              {formData.name && (
                <View style={styles.previewCard}>
                  <View style={styles.previewContent}>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewIcon}>
                        {categories.find(c => c.value === formData.category)?.icon || '📦'}
                      </Text>
                      <View style={styles.previewText}>
                        <Text style={styles.previewName}>{formData.name}</Text>
                        <Text style={styles.previewCategory}>{formData.category}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Step 4: Price */}
          {step === 'price' && (
            <View style={styles.stepContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>{getStepIcon()}</Text>
                    <Text style={styles.cardTitle}>{getStepTitle()}</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    {getStepDescription()}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                  <Text style={styles.priceHint}>
                    Оставьте поле пустым, если не хотите указывать стоимость
                  </Text>
                </View>
              </View>

              {/* Product Preview */}
              {formData.name && (
                <View style={styles.previewCard}>
                  <View style={styles.previewContent}>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewIcon}>
                        {categories.find(c => c.value === formData.category)?.icon || '📦'}
                      </Text>
                      <View style={styles.previewText}>
                        <Text style={styles.previewName}>{formData.name}</Text>
                        <Text style={styles.previewCategory}>{formData.category}</Text>
                        {formData.expirationDate && (
                          <Text style={styles.previewExpiration}>
                            Годен до: {formatDisplayDate(formData.expirationDate)}
                          </Text>
                        )}
                        {formData.purchaseDate && (
                          <Text style={styles.previewPurchase}>
                            Куплен: {formatDisplayDate(formData.purchaseDate)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {step !== 'price' ? (
              <TouchableOpacity 
                style={[styles.button, !canProceed() && styles.buttonDisabled]}
                onPress={nextStep}
                disabled={!canProceed()}
              >
                <Text style={styles.buttonText}>Продолжить</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.button, !canProceed() && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!canProceed()}
              >
                <Text style={styles.buttonText}>Сохранить продукт</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Date Picker */}
        {datePickerVisible && (
          <DateTimePicker
            value={currentDateField && formData[currentDateField] 
              ? new Date(formData[currentDateField]) 
              : new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={styles.datePicker}
          />
        )}
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  headerPlaceholder: {
    width: 40,
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
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#3b82f6',
  },
  stepContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 0,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 8,
  },
  categoryButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  dateInputGroup: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#6b7280',
  },
  priceHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  previewContent: {
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewIcon: {
    fontSize: 20,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  previewCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  previewExpiration: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 2,
  },
  previewPurchase: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  actions: {
    marginTop: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: 'white',
  },
});