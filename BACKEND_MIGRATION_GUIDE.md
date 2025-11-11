# Руководство по переносу Backend на C#

## Обзор

Это руководство описывает шаги для создания отдельного C# backend проекта и интеграции его с существующим React Native frontend.

## Текущая архитектура

- **Frontend**: React Native (Expo) - хранит данные локально в AsyncStorage
- **Backend**: Отсутствует (данные хранятся локально)
- **Данные**: Продукты (Product) с полями: id, name, category, purchaseDate, expirationDate, price, archivedDate, archiveReason

## Шаги для переноса

### 1. Создание C# Backend проекта

#### 1.1. Создайте новый ASP.NET Core Web API проект

```bash
# В отдельной директории (например, ProductExpirationTracker.Backend)
dotnet new webapi -n ProductExpirationTracker.API
cd ProductExpirationTracker.API
```

#### 1.2. Установите необходимые NuGet пакеты

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer  # или PostgreSQL, SQLite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Swashbuckle.AspNetCore  # для Swagger
dotnet add package Microsoft.AspNetCore.Cors  # для CORS
```

### 2. Структура проекта C#

```
ProductExpirationTracker.API/
├── Controllers/
│   └── ProductsController.cs
├── Models/
│   └── Product.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Services/
│   └── ProductService.cs
├── DTOs/
│   ├── ProductDto.cs
│   └── CreateProductDto.cs
└── Program.cs
```

### 3. Модель данных (Product.cs)

```csharp
using System.ComponentModel.DataAnnotations;

namespace ProductExpirationTracker.API.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Category { get; set; }
        
        public DateTime? PurchaseDate { get; set; }
        
        [Required]
        public DateTime ExpirationDate { get; set; }
        
        public decimal? Price { get; set; }
        
        public DateTime? ArchivedDate { get; set; }
        
        public string? ArchiveReason { get; set; } // "used" или "expired"
        
        public bool IsArchived => ArchivedDate != null;
    }
}
```

### 4. DbContext (ApplicationDbContext.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.API.Models;

namespace ProductExpirationTracker.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            });
        }
    }
}
```

### 5. DTOs

```csharp
// ProductDto.cs
namespace ProductExpirationTracker.API.DTOs
{
    public class ProductDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string? PurchaseDate { get; set; }
        public string ExpirationDate { get; set; }
        public decimal? Price { get; set; }
        public string? ArchivedDate { get; set; }
        public string? ArchiveReason { get; set; }
    }
}

// CreateProductDto.cs
namespace ProductExpirationTracker.API.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public string? PurchaseDate { get; set; }
        public string ExpirationDate { get; set; }
        public decimal? Price { get; set; }
    }
}
```

### 6. Controller (ProductsController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.API.Data;
using ProductExpirationTracker.API.DTOs;
using ProductExpirationTracker.API.Models;

namespace ProductExpirationTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] bool? archived)
        {
            var query = _context.Products.AsQueryable();
            
            if (archived.HasValue)
            {
                query = archived.Value 
                    ? query.Where(p => p.IsArchived) 
                    : query.Where(p => !p.IsArchived);
            }

            var products = await query.ToListAsync();
            return Ok(products.Select(MapToDto));
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            return Ok(MapToDto(product));
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Category = dto.Category,
                PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null,
                ExpirationDate = DateTime.Parse(dto.ExpirationDate),
                Price = dto.Price
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapToDto(product));
        }

        // POST: api/products/batch
        [HttpPost("batch")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> CreateProducts(IEnumerable<CreateProductDto> dtos)
        {
            var products = dtos.Select(dto => new Product
            {
                Name = dto.Name,
                Category = dto.Category,
                PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null,
                ExpirationDate = DateTime.Parse(dto.ExpirationDate),
                Price = dto.Price
            }).ToList();

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();

            return Ok(products.Select(MapToDto));
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(string id, CreateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.Name = dto.Name;
            product.Category = dto.Category;
            product.PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null;
            product.ExpirationDate = DateTime.Parse(dto.ExpirationDate);
            product.Price = dto.Price;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/products/{id}/mark-as-used
        [HttpPost("{id}/mark-as-used")]
        public async Task<ActionResult<ProductDto>> MarkProductAsUsed(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.ArchivedDate = DateTime.UtcNow;
            product.ArchiveReason = "used";

            await _context.SaveChangesAsync();
            return Ok(MapToDto(product));
        }

        // DELETE: api/products/history
        [HttpDelete("history")]
        public async Task<IActionResult> ClearHistory()
        {
            var archivedProducts = await _context.Products
                .Where(p => p.IsArchived)
                .ToListAsync();

            _context.Products.RemoveRange(archivedProducts);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Category = product.Category,
                PurchaseDate = product.PurchaseDate?.ToString("yyyy-MM-dd"),
                ExpirationDate = product.ExpirationDate.ToString("yyyy-MM-dd"),
                Price = product.Price,
                ArchivedDate = product.ArchivedDate?.ToString("yyyy-MM-dd"),
                ArchiveReason = product.ArchiveReason
            };
        }
    }
}
```

### 7. Настройка Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=products.db")); // или UseSqlServer для SQL Server

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNative", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactNative");
app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
```

### 8. Настройка appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=products.db"
  }
}
```

---

## Интеграция с React Native Frontend

### 1. Установка зависимостей

В вашем React Native проекте установите библиотеку для HTTP запросов:

```bash
npm install axios
# или
npm install @react-native-async-storage/async-storage  # уже установлен
```

### 2. Создание API сервиса

Создайте файл `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // для эмулятора/симулятора
  : 'https://your-api-domain.com/api';  // для продакшена

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface Product {
  id: string;
  name: string;
  category: string;
  purchaseDate?: string;
  expirationDate: string;
  price?: number;
  archivedDate?: string;
  archiveReason?: 'used' | 'expired';
}

export interface CreateProductDto {
  name: string;
  category: string;
  purchaseDate?: string;
  expirationDate: string;
  price?: number;
}

export const productApi = {
  // Получить все продукты
  getProducts: async (archived?: boolean): Promise<Product[]> => {
    const params = archived !== undefined ? { archived } : {};
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  // Получить продукт по ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Создать продукт
  createProduct: async (product: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  // Создать несколько продуктов
  createProducts: async (products: CreateProductDto[]): Promise<Product[]> => {
    const response = await api.post<Product[]>('/products/batch', products);
    return response.data;
  },

  // Обновить продукт
  updateProduct: async (id: string, product: CreateProductDto): Promise<void> => {
    await api.put(`/products/${id}`, product);
  },

  // Удалить продукт
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Отметить продукт как использованный
  markProductAsUsed: async (id: string): Promise<Product> => {
    const response = await api.post<Product>(`/products/${id}/mark-as-used`);
    return response.data;
  },

  // Очистить историю
  clearHistory: async (): Promise<void> => {
    await api.delete('/products/history');
  },
};

export default api;
```

### 3. Обновление AppContext.tsx

Замените локальное хранилище на API вызовы:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, productApi, CreateProductDto } from '../services/api';

const AppContext = createContext<{
  products: Product[];
  archivedProducts: Product[];
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  addProduct: (product: CreateProductDto) => Promise<void>;
  addMultipleProducts: (products: CreateProductDto[]) => Promise<void>;
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

  // Загрузка данных при запуске
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const [activeProducts, archived] = await Promise.all([
        productApi.getProducts(false),
        productApi.getProducts(true),
      ]);
      
      setProducts(activeProducts);
      setArchivedProducts(archived);
    } catch (error) {
      console.error('Error loading app data:', error);
      // Fallback на локальное хранилище при ошибке
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: CreateProductDto) => {
    try {
      const newProduct = await productApi.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const addMultipleProducts = async (productsData: CreateProductDto[]) => {
    try {
      const newProducts = await productApi.createProducts(productsData);
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
      const createDtos: CreateProductDto[] = importedProducts.map(p => ({
        name: p.name,
        category: p.category,
        purchaseDate: p.purchaseDate,
        expirationDate: p.expirationDate,
        price: p.price,
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
    // Можно также сохранить в AsyncStorage для офлайн режима
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
```

### 4. Настройка CORS для локальной разработки

Для Android эмулятора используйте `http://10.0.2.2:5000` вместо `localhost`.
Для iOS симулятора используйте `http://localhost:5000`.

Обновите `src/services/api.ts`:

```typescript
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';  // Android эмулятор
    } else {
      return 'http://localhost:5000/api';  // iOS симулятор
    }
  }
  return 'https://your-api-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();
```

---

## Запуск проекта

### Backend (C#)

```bash
cd ProductExpirationTracker.API
dotnet run
```

API будет доступен по адресу: `https://localhost:5001` или `http://localhost:5000`

### Frontend (React Native)

```bash
npm start
```

---

## Дополнительные рекомендации

### 1. Аутентификация (опционально)

Если нужна аутентификация пользователей, добавьте:
- JWT токены
- Identity или IdentityServer
- Endpoints для регистрации/входа

### 2. Офлайн режим

Для работы без интернета:
- Используйте AsyncStorage как кэш
- Синхронизируйте данные при подключении
- Реализуйте очередь операций

### 3. Обработка ошибок

Добавьте обработку ошибок в API сервисе:
```typescript
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    // Показать уведомление пользователю
    return Promise.reject(error);
  }
);
```

### 4. Миграции базы данных

Для продакшена используйте миграции:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Деплой

- Backend: Azure, AWS, или любой хостинг с поддержкой .NET
- Frontend: Expo EAS Build для мобильных приложений

---

## Чеклист миграции

- [ ] Создан C# Web API проект
- [ ] Настроена база данных (SQLite/SQL Server/PostgreSQL)
- [ ] Реализованы все endpoints
- [ ] Настроен CORS
- [ ] Создан API сервис в React Native
- [ ] Обновлен AppContext для использования API
- [ ] Протестирована интеграция
- [ ] Настроена обработка ошибок
- [ ] Добавлена аутентификация (если нужно)
- [ ] Настроен деплой

