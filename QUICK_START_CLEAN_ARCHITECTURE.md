# Быстрый старт: Clean Architecture для C# Backend

## Краткая инструкция

### Шаг 1: Создание структуры проекта

#### Вариант A: Использование PowerShell скрипта (Windows)

```powershell
.\create-backend-structure.ps1
```

#### Вариант B: Ручное создание

Выполните команды из раздела "Шаг 1" в файле `CLEAN_ARCHITECTURE_GUIDE.md`

### Шаг 2: Создание файлов

Создайте файлы согласно структуре в `CLEAN_ARCHITECTURE_GUIDE.md`:

1. **Domain Layer** (`ProductExpirationTracker.Domain`):
   - `Entities/Product.cs`
   - `Entities/ArchiveReason.cs`
   - `Interfaces/IProductRepository.cs`

2. **Application Layer** (`ProductExpirationTracker.Application`):
   - `DTOs/CreateProductDto.cs`
   - `DTOs/UpdateProductDto.cs`
   - `DTOs/ProductDto.cs`
   - `Interfaces/IProductService.cs`
   - `Services/ProductService.cs`

3. **Infrastructure Layer** (`ProductExpirationTracker.Infrastructure`):
   - `Data/ApplicationDbContext.cs`
   - `Repositories/ProductRepository.cs`

4. **API Layer** (`ProductExpirationTracker`):
   - `Controllers/ProductsController.cs`
   - Обновите `Program.cs`

### Шаг 3: Миграции базы данных

```bash
cd ProductExpirationTracker.Backend

# Установите EF Core Tools (если еще не установлены)
dotnet tool install --global dotnet-ef

# Создайте миграцию
dotnet ef migrations add InitialCreate --project ProductExpirationTracker.Infrastructure --startup-project ProductExpirationTracker

# Примените миграцию
dotnet ef database update --project ProductExpirationTracker.Infrastructure --startup-project ProductExpirationTracker
```

### Шаг 4: Запуск проекта

```bash
cd ProductExpirationTracker
dotnet run
```

API будет доступен на:
- `https://localhost:5001`
- `http://localhost:5000`

Swagger UI: `https://localhost:5001/swagger`

## Структура проекта

```
ProductExpirationTracker.Backend/
├── ProductExpirationTracker.Domain/          # Доменный слой
│   ├── Entities/
│   └── Interfaces/
├── ProductExpirationTracker.Application/     # Слой приложения
│   ├── DTOs/
│   ├── Services/
│   └── Interfaces/
├── ProductExpirationTracker.Infrastructure/   # Инфраструктурный слой
│   ├── Data/
│   ├── Repositories/
│   └── Migrations/
├── ProductExpirationTracker/                 # Web API
│   ├── Controllers/
│   └── Program.cs
└── ProductExpirationTracker.Tests/          # Тесты
```

## Зависимости между слоями

```
ProductExpirationTracker (API)
    ↓
ProductExpirationTracker.Application
    ↓
ProductExpirationTracker.Domain
    ↑
ProductExpirationTracker.Infrastructure
```

## Основные Endpoints

- `GET /api/products` - получить все продукты (`?archived=true/false`)
- `GET /api/products/{id}` - получить продукт по ID
- `POST /api/products` - создать продукт
- `POST /api/products/batch` - создать несколько продуктов
- `PUT /api/products/{id}` - обновить продукт
- `DELETE /api/products/{id}` - удалить продукт
- `POST /api/products/{id}/mark-as-used` - отметить как использованный
- `DELETE /api/products/history` - очистить историю

## Интеграция с React Native

После создания backend, обновите `src/services/api.ts` в React Native проекте:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // или http://10.0.2.2:5000/api для Android
  : 'https://your-api-domain.com/api';
```

## Полезные команды

```bash
# Сборка всех проектов
dotnet build

# Запуск тестов
dotnet test

# Очистка проекта
dotnet clean

# Восстановление пакетов
dotnet restore
```

## Дополнительная информация

Полная документация с примерами кода находится в файле **CLEAN_ARCHITECTURE_GUIDE.md**

