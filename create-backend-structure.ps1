# PowerShell скрипт для создания структуры Clean Architecture проекта
# Запустите: .\create-backend-structure.ps1

Write-Host "Создание структуры Clean Architecture проекта..." -ForegroundColor Green

# Создайте директорию для backend (в родительской директории)
$backendPath = "..\ProductExpirationTracker.Backend"
if (Test-Path $backendPath) {
    Write-Host "Директория $backendPath уже существует!" -ForegroundColor Yellow
    $response = Read-Host "Удалить и создать заново? (y/n)"
    if ($response -eq "y") {
        Remove-Item -Path $backendPath -Recurse -Force
    } else {
        Write-Host "Отмена создания проекта" -ForegroundColor Red
        exit
    }
}

New-Item -ItemType Directory -Path $backendPath -Force | Out-Null
Set-Location $backendPath

Write-Host "Создание Solution..." -ForegroundColor Cyan
dotnet new sln -n ProductExpirationTracker

Write-Host "Создание проектов..." -ForegroundColor Cyan
dotnet new classlib -n ProductExpirationTracker.Domain
dotnet new classlib -n ProductExpirationTracker.Application
dotnet new classlib -n ProductExpirationTracker.Infrastructure
dotnet new webapi -n ProductExpirationTracker
dotnet new xunit -n ProductExpirationTracker.Tests

Write-Host "Добавление проектов в Solution..." -ForegroundColor Cyan
dotnet sln add ProductExpirationTracker.Domain/ProductExpirationTracker.Domain.csproj
dotnet sln add ProductExpirationTracker.Application/ProductExpirationTracker.Application.csproj
dotnet sln add ProductExpirationTracker.Infrastructure/ProductExpirationTracker.Infrastructure.csproj
dotnet sln add ProductExpirationTracker/ProductExpirationTracker.csproj
dotnet sln add ProductExpirationTracker.Tests/ProductExpirationTracker.Tests.csproj

Write-Host "Настройка зависимостей между проектами..." -ForegroundColor Cyan
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

Write-Host "Установка NuGet пакетов..." -ForegroundColor Cyan

# Infrastructure
Set-Location ProductExpirationTracker.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Tools
Set-Location ..

# Application
Set-Location ProductExpirationTracker.Application
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
Set-Location ..

# API
Set-Location ProductExpirationTracker
dotnet add package Swashbuckle.AspNetCore
Set-Location ..

# Tests
Set-Location ProductExpirationTracker.Tests
dotnet add package Moq
dotnet add package FluentAssertions
dotnet add package Microsoft.EntityFrameworkCore.InMemory
Set-Location ..

Write-Host "`nСтруктура проекта успешно создана!" -ForegroundColor Green
Write-Host "`nСледующие шаги:" -ForegroundColor Yellow
Write-Host "1. Создайте файлы согласно CLEAN_ARCHITECTURE_GUIDE.md" -ForegroundColor White
Write-Host "2. Перейдите в ProductExpirationTracker.Backend" -ForegroundColor White
Write-Host "3. Создайте миграции: dotnet ef migrations add InitialCreate --project ProductExpirationTracker.Infrastructure --startup-project ProductExpirationTracker" -ForegroundColor White
Write-Host "4. Запустите проект: cd ProductExpirationTracker && dotnet run" -ForegroundColor White

Set-Location ..

