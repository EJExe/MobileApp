# Руководство по созданию Clean Architecture для C# Backend

## Обзор архитектуры

Проект будет состоять из следующих слоев (Clean Architecture / Onion Architecture):

1. **ProductExpirationTracker** - Web API проект (Controllers, Images, Program.cs)
2. **ProductExpirationTracker.Application** - Слой приложения (DTOs, Services, Mappings)
3. **ProductExpirationTracker.Domain** - Доменный слой (Entities, Interfaces, Value Objects)
4. **ProductExpirationTracker.Infrastructure** - Инфраструктурный слой (Data, Migrations, Repositories)
5. **ProductExpirationTracker.Tests** - Тесты

## Зависимости между слоями

```
ProductExpirationTracker (API)
    ↓ зависит от
ProductExpirationTracker.Application
    ↓ зависит от
ProductExpirationTracker.Domain
    ↑ зависит от
ProductExpirationTracker.Infrastructure
```

**Важно**: Domain не зависит ни от чего, Application зависит только от Domain, Infrastructure зависит от Domain и Application, API зависит от всех.

---

## Шаг 1: Создание структуры решения (Solution)

### 1.1. Создайте Solution и проекты

```bash
# Создайте новую директорию для backend
mkdir ProductExpirationTracker.Backend
cd ProductExpirationTracker.Backend

# Создайте Solution
dotnet new sln -n ProductExpirationTracker

# Создайте проекты
dotnet new classlib -n ProductExpirationTracker.Domain
dotnet new classlib -n ProductExpirationTracker.Application
dotnet new classlib -n ProductExpirationTracker.Infrastructure
dotnet new webapi -n ProductExpirationTracker
dotnet new xunit -n ProductExpirationTracker.Tests

# Добавьте проекты в Solution
dotnet sln add ProductExpirationTracker.Domain/ProductExpirationTracker.Domain.csproj
dotnet sln add ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj
dotnet sln add ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj
dotnet sln add ProductExpirationTracker/ProductExpirationTracker.csproj
dotnet sln add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj
```

### 1.2. Настройте зависимости между проектами

```bash
# Application зависит от Domain
dotnet add ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj reference ProductExpirationTracker.Domain/ProductExpirationTracker.Domain.csproj

# Infrastructure зависит от Domain и Application
dotnet add ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj reference ProductExpirationTracker.Domain/ProductExpirationTracker.Domain.csproj
dotnet add ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj reference ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj

# API зависит от Application и Infrastructure
dotnet add ProductExpirationTracker/ProductExpirationTracker.csproj reference ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj
dotnet add ProductExpirationTracker/ProductExpirationTracker.csproj reference ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj

# Tests зависит от всех проектов
dotnet add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj reference ProductExpirationTracker.Domain/ProductExpirationTracker.Domain.csproj
dotnet add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj reference ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj
dotnet add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj reference ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj
dotnet add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj reference ProductExpirationTracker/ProductExpirationTracker.csproj
```

### 1.3. Установите необходимые NuGet пакеты

```bash
# Infrastructure - Entity Framework
cd ProductExpirationTracker.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Tools

# Application - AutoMapper (опционально, для маппинга)
cd ../ProductExpirationTracker.Application
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection

# API - Swagger, CORS
cd ../ProductExpirationTracker
dotnet add package Swashbuckle.AspNetCore

# Tests
cd ../ProductExpirationTracker.Tests
dotnet add package Moq
dotnet add package FluentAssertions
dotnet add package Microsoft.EntityFrameworkCore.InMemory
```

---

## Шаг 2: Domain Layer (ProductExpirationTracker.Domain)

### Структура папок:
```
ProductExpirationTracker.Domain/
├── Entities/
│   └── Product.cs
├── Interfaces/
│   └── IProductRepository.cs
└── Enums/
    └── ArchiveReason.cs
```

### 2.1. Entity (Product.cs)

```csharp
namespace ProductExpirationTracker.Domain.Entities;

public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public string Name { get; set; } = string.Empty;
    
    public string Category { get; set; } = string.Empty;
    
    public DateTime? PurchaseDate { get; set; }
    
    public DateTime ExpirationDate { get; set; }
    
    public decimal? Price { get; set; }
    
    public DateTime? ArchivedDate { get; set; }
    
    public ArchiveReason? ArchiveReason { get; set; }
    
    public bool IsArchived => ArchivedDate != null;
    
    public bool IsExpired => DateTime.UtcNow.Date > ExpirationDate.Date;
    
    public int DaysUntilExpiration => (ExpirationDate.Date - DateTime.UtcNow.Date).Days;
}
```

### 2.2. Enum (ArchiveReason.cs)

```csharp
namespace ProductExpirationTracker.Domain.Entities;

public enum ArchiveReason
{
    Used,
    Expired
}
```

### 2.3. Interface (IProductRepository.cs)

```csharp
using ProductExpirationTracker.Domain.Entities;

namespace ProductExpirationTracker.Domain.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetArchivedAsync(CancellationToken cancellationToken = default);
    Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> CreateRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken = default);
    Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task DeleteArchivedAsync(CancellationToken cancellationToken = default);
    Task<Product> MarkAsUsedAsync(string id, CancellationToken cancellationToken = default);
}
```

---

## Шаг 3: Application Layer (ProductExpirationTracker.Application)

### Структура папок:
```
ProductExpirationTracker.Application/
├── DTOs/
│   ├── ProductDto.cs
│   ├── CreateProductDto.cs
│   └── UpdateProductDto.cs
├── Services/
│   └── IProductService.cs
│   └── ProductService.cs
├── Mappings/
│   └── ProductMappingProfile.cs (если используете AutoMapper)
└── Interfaces/
    └── IProductService.cs
```

### 3.1. DTOs

#### CreateProductDto.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace ProductExpirationTracker.Application.DTOs;

public class CreateProductDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public string? PurchaseDate { get; set; }
    
    [Required]
    public string ExpirationDate { get; set; } = string.Empty;
    
    public decimal? Price { get; set; }
}
```

#### UpdateProductDto.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace ProductExpirationTracker.Application.DTOs;

public class UpdateProductDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public string? PurchaseDate { get; set; }
    
    [Required]
    public string ExpirationDate { get; set; } = string.Empty;
    
    public decimal? Price { get; set; }
}
```

#### ProductDto.cs
```csharp
namespace ProductExpirationTracker.Application.DTOs;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? PurchaseDate { get; set; }
    public string ExpirationDate { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? ArchivedDate { get; set; }
    public string? ArchiveReason { get; set; }
    public bool IsArchived { get; set; }
    public bool IsExpired { get; set; }
    public int DaysUntilExpiration { get; set; }
}
```

### 3.2. Service Interface (IProductService.cs)

```csharp
using ProductExpirationTracker.Application.DTOs;

namespace ProductExpirationTracker.Application.Interfaces;

public interface IProductService
{
    Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductDto>> GetAllAsync(bool? archived = null, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductDto>> CreateRangeAsync(IEnumerable<CreateProductDto> dtos, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(string id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<ProductDto> MarkAsUsedAsync(string id, CancellationToken cancellationToken = default);
    Task ClearHistoryAsync(CancellationToken cancellationToken = default);
}
```

### 3.3. Service Implementation (ProductService.cs)

```csharp
using ProductExpirationTracker.Application.DTOs;
using ProductExpirationTracker.Application.Interfaces;
using ProductExpirationTracker.Domain.Entities;
using ProductExpirationTracker.Domain.Interfaces;

namespace ProductExpirationTracker.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken);
        return product != null ? MapToDto(product) : null;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(bool? archived = null, CancellationToken cancellationToken = default)
    {
        IEnumerable<Product> products;
        
        if (archived == true)
            products = await _repository.GetArchivedAsync(cancellationToken);
        else if (archived == false)
            products = await _repository.GetActiveAsync(cancellationToken);
        else
            products = await _repository.GetAllAsync(cancellationToken);

        return products.Select(MapToDto);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            Name = dto.Name,
            Category = dto.Category,
            PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null,
            ExpirationDate = DateTime.Parse(dto.ExpirationDate),
            Price = dto.Price
        };

        var createdProduct = await _repository.CreateAsync(product, cancellationToken);
        return MapToDto(createdProduct);
    }

    public async Task<IEnumerable<ProductDto>> CreateRangeAsync(IEnumerable<CreateProductDto> dtos, CancellationToken cancellationToken = default)
    {
        var products = dtos.Select(dto => new Product
        {
            Name = dto.Name,
            Category = dto.Category,
            PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null,
            ExpirationDate = DateTime.Parse(dto.ExpirationDate),
            Price = dto.Price
        }).ToList();

        var createdProducts = await _repository.CreateRangeAsync(products, cancellationToken);
        return createdProducts.Select(MapToDto);
    }

    public async Task<ProductDto> UpdateAsync(string id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {id} not found");

        product.Name = dto.Name;
        product.Category = dto.Category;
        product.PurchaseDate = dto.PurchaseDate != null ? DateTime.Parse(dto.PurchaseDate) : null;
        product.ExpirationDate = DateTime.Parse(dto.ExpirationDate);
        product.Price = dto.Price;

        var updatedProduct = await _repository.UpdateAsync(product, cancellationToken);
        return MapToDto(updatedProduct);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    public async Task<ProductDto> MarkAsUsedAsync(string id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.MarkAsUsedAsync(id, cancellationToken);
        return MapToDto(product);
    }

    public async Task ClearHistoryAsync(CancellationToken cancellationToken = default)
    {
        await _repository.DeleteArchivedAsync(cancellationToken);
    }

    private static ProductDto MapToDto(Product product)
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
            ArchiveReason = product.ArchiveReason?.ToString().ToLower(),
            IsArchived = product.IsArchived,
            IsExpired = product.IsExpired,
            DaysUntilExpiration = product.DaysUntilExpiration
        };
    }
}
```

---

## Шаг 4: Infrastructure Layer (ProductExpirationTracker.Infrastructure)

### Структура папок:
```
ProductExpirationTracker.Infrastructure/
├── Data/
│   └── ApplicationDbContext.cs
├── Repositories/
│   └── ProductRepository.cs
└── Migrations/
    └── (создаются автоматически)
```

### 4.1. DbContext (ApplicationDbContext.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.Domain.Entities;

namespace ProductExpirationTracker.Infrastructure.Data;

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
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.Price)
                .HasPrecision(18, 2);
            
            entity.Property(e => e.ArchiveReason)
                .HasConversion<string>();
        });
    }
}
```

### 4.2. Repository (ProductRepository.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.Domain.Entities;
using ProductExpirationTracker.Domain.Interfaces;
using ProductExpirationTracker.Infrastructure.Data;

namespace ProductExpirationTracker.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _context.Products.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Where(p => !p.IsArchived)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetArchivedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Where(p => p.IsArchived)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<IEnumerable<Product>> CreateRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken = default)
    {
        var productList = products.ToList();
        _context.Products.AddRange(productList);
        await _context.SaveChangesAsync(cancellationToken);
        return productList;
    }

    public async Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var product = await GetByIdAsync(id, cancellationToken);
        if (product != null)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteArchivedAsync(CancellationToken cancellationToken = default)
    {
        var archivedProducts = await GetArchivedAsync(cancellationToken);
        _context.Products.RemoveRange(archivedProducts);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Product> MarkAsUsedAsync(string id, CancellationToken cancellationToken = default)
    {
        var product = await GetByIdAsync(id, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {id} not found");

        product.ArchivedDate = DateTime.UtcNow;
        product.ArchiveReason = ArchiveReason.Used;

        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }
}
```

---

## Шаг 5: API Layer (ProductExpirationTracker)

### Структура папок:
```
ProductExpirationTracker/
├── Controllers/
│   └── ProductsController.cs
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

### 5.1. Controller (ProductsController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using ProductExpirationTracker.Application.DTOs;
using ProductExpirationTracker.Application.Interfaces;

namespace ProductExpirationTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] bool? archived, CancellationToken cancellationToken)
    {
        var products = await _productService.GetAllAsync(archived, cancellationToken);
        return Ok(products);
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(string id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // POST: api/products/batch
    [HttpPost("batch")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> CreateProducts(IEnumerable<CreateProductDto> dtos, CancellationToken cancellationToken)
    {
        var products = await _productService.CreateRangeAsync(dtos, cancellationToken);
        return Ok(products);
    }

    // PUT: api/products/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(string id, UpdateProductDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _productService.UpdateAsync(id, dto, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(string id, CancellationToken cancellationToken)
    {
        try
        {
            await _productService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // POST: api/products/{id}/mark-as-used
    [HttpPost("{id}/mark-as-used")]
    public async Task<ActionResult<ProductDto>> MarkProductAsUsed(string id, CancellationToken cancellationToken)
    {
        try
        {
            var product = await _productService.MarkAsUsedAsync(id, cancellationToken);
            return Ok(product);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // DELETE: api/products/history
    [HttpDelete("history")]
    public async Task<IActionResult> ClearHistory(CancellationToken cancellationToken)
    {
        await _productService.ClearHistoryAsync(cancellationToken);
        return NoContent();
    }
}
```

### 5.2. Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using ProductExpirationTracker.Application.Interfaces;
using ProductExpirationTracker.Application.Services;
using ProductExpirationTracker.Domain.Interfaces;
using ProductExpirationTracker.Infrastructure.Data;
using ProductExpirationTracker.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=products.db"));

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Services
builder.Services.AddScoped<IProductService, ProductService>();

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

// Ensure database is created and migrations applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
```

### 5.3. appsettings.json

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

## Шаг 6: Миграции базы данных

```bash
# Установите EF Core Tools глобально (если еще не установлены)
dotnet tool install --global dotnet-ef

# Создайте миграцию
cd ProductExpirationTracker.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../ProductExpirationTracker

# Примените миграцию
dotnet ef database update --startup-project ../ProductExpirationTracker
```

---

## Шаг 7: Тесты (ProductExpirationTracker.Tests)

### Пример теста для Service

```csharp
using FluentAssertions;
using Moq;
using ProductExpirationTracker.Application.DTOs;
using ProductExpirationTracker.Application.Services;
using ProductExpirationTracker.Domain.Entities;
using ProductExpirationTracker.Domain.Interfaces;
using Xunit;

namespace ProductExpirationTracker.Tests.Services;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _service = new ProductService(_repositoryMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnProductDto()
    {
        // Arrange
        var dto = new CreateProductDto
        {
            Name = "Молоко",
            Category = "Молочные продукты",
            ExpirationDate = "2024-12-31",
            Price = 100
        };

        var product = new Product
        {
            Id = Guid.NewGuid().ToString(),
            Name = dto.Name,
            Category = dto.Category,
            ExpirationDate = DateTime.Parse(dto.ExpirationDate),
            Price = dto.Price
        };

        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(dto.Name);
        result.Category.Should().Be(dto.Category);
    }
}
```

---

## Запуск проекта

```bash
# Запустите API проект
cd ProductExpirationTracker
dotnet run

# API будет доступен на:
# https://localhost:5001 или http://localhost:5000
```

---

## Чеклист

- [ ] Создана структура Solution с 5 проектами
- [ ] Настроены зависимости между проектами
- [ ] Реализован Domain слой (Entities, Interfaces)
- [ ] Реализован Application слой (DTOs, Services)
- [ ] Реализован Infrastructure слой (DbContext, Repositories)
- [ ] Реализован API слой (Controllers)
- [ ] Настроен Program.cs с DI
- [ ] Созданы и применены миграции
- [ ] Настроен CORS
- [ ] Написаны тесты
- [ ] Протестирована интеграция с React Native

---

## Дополнительные рекомендации

1. **AutoMapper**: Используйте AutoMapper для автоматического маппинга между Entity и DTO
2. **FluentValidation**: Добавьте валидацию для DTOs
3. **MediatR**: Используйте MediatR для CQRS паттерна (опционально)
4. **Logging**: Добавьте логирование через ILogger
5. **Exception Handling**: Создайте middleware для обработки исключений
6. **Unit of Work**: Реализуйте паттерн Unit of Work для транзакций

