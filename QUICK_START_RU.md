# Быстрый старт: Перенос Backend на C#

## Краткая инструкция

### Шаг 1: Создание C# Backend проекта

1. Откройте терминал в **отдельной директории** (не в текущем React Native проекте)
2. Создайте новый ASP.NET Core Web API проект:

```bash
dotnet new webapi -n ProductExpirationTracker.API
cd ProductExpirationTracker.API
```

3. Установите необходимые пакеты:

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Swashbuckle.AspNetCore
```

### Шаг 2: Настройка структуры проекта

Создайте следующие файлы в проекте C#:

- `Models/Product.cs` - модель данных
- `Data/ApplicationDbContext.cs` - контекст базы данных
- `DTOs/ProductDto.cs` и `DTOs/CreateProductDto.cs` - DTO для API
- `Controllers/ProductsController.cs` - контроллер с endpoints

**Подробные примеры кода смотрите в файле `BACKEND_MIGRATION_GUIDE.md`**

### Шаг 3: Настройка Program.cs

Добавьте:
- Настройку DbContext
- Настройку CORS (важно для React Native!)
- Swagger для тестирования API

### Шаг 4: Интеграция с React Native

1. Установите axios в React Native проекте:

```bash
npm install axios
```

2. Создайте файл `src/services/api.ts` (используйте пример из `src/services/api.ts.example`)

3. Обновите `src/context/AppContext.tsx`:
   - Замените AsyncStorage на API вызовы
   - Используйте функции из `productApi`

### Шаг 5: Настройка URL для локальной разработки

**Важно!** Для Android эмулятора используйте `http://10.0.2.2:5000` вместо `localhost`.
Для iOS симулятора можно использовать `http://localhost:5000`.

### Шаг 6: Запуск

1. **Backend (C#):**
```bash
cd ProductExpirationTracker.API
dotnet run
```
API будет доступен на `http://localhost:5000` или `https://localhost:5001`

2. **Frontend (React Native):**
```bash
npm start
```

## Основные Endpoints API

- `GET /api/products` - получить все продукты (можно фильтровать по `?archived=true/false`)
- `GET /api/products/{id}` - получить продукт по ID
- `POST /api/products` - создать продукт
- `POST /api/products/batch` - создать несколько продуктов
- `PUT /api/products/{id}` - обновить продукт
- `DELETE /api/products/{id}` - удалить продукт
- `POST /api/products/{id}/mark-as-used` - отметить как использованный
- `DELETE /api/products/history` - очистить историю

## Важные моменты

1. **CORS** - обязательно настройте CORS в C# проекте для работы с React Native
2. **Формат дат** - используйте формат `yyyy-MM-dd` для дат
3. **Обработка ошибок** - добавьте обработку ошибок в React Native приложении
4. **Офлайн режим** - можно оставить AsyncStorage как fallback для офлайн работы

## Полная документация

Смотрите файл `BACKEND_MIGRATION_GUIDE.md` для подробной информации и примеров кода.

