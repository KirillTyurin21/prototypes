# Скрипт сборки Flutter Web → интеграция с Angular dist
# Использование: .\scripts\build-flutter.ps1

$ErrorActionPreference = "Stop"

$flutterProject = "flutter-apps\kso"
$outputDir = "src\assets\flutter"

Write-Host "=== Сборка Flutter Web ===" -ForegroundColor Cyan
Write-Host "Проект: $flutterProject"
Write-Host "Выход:  $outputDir"
Write-Host ""

# Проверяем Flutter
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\flutter\bin\flutter.bat") {
        $env:Path += ";C:\flutter\bin"
    } else {
        Write-Host "ОШИБКА: Flutter SDK не найден" -ForegroundColor Red
        exit 1
    }
}

# Переходим в проект
Push-Location $flutterProject

try {
    # Получаем зависимости
    Write-Host ">> flutter pub get" -ForegroundColor Yellow
    flutter pub get
    if ($LASTEXITCODE -ne 0) { throw "flutter pub get failed" }

    # Сборка web
    Write-Host ">> flutter build web --release --base-href /flutter/" -ForegroundColor Yellow
    flutter build web --release --base-href "/flutter/"
    if ($LASTEXITCODE -ne 0) { throw "flutter build web failed" }

    Write-Host ""
    Write-Host "Сборка успешна!" -ForegroundColor Green
} finally {
    Pop-Location
}

# Копируем в assets Angular-проекта
$source = "$flutterProject\build\web\*"
$destination = $outputDir

if (Test-Path $destination) {
    Remove-Item -Recurse -Force $destination
}
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -Recurse -Force $source $destination

Write-Host "Скопировано в: $destination" -ForegroundColor Green
Write-Host ""
Write-Host "=== Готово ===" -ForegroundColor Cyan
Write-Host "Flutter-приложение будет доступно по пути /flutter/ после сборки Angular"
