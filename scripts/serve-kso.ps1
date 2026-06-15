# ============================================================
# serve-kso.ps1 — локальный запуск Flutter КСО (standalone)
# ============================================================
# Без Angular! Чистый Flutter на http://localhost:3000
#
# Режимы:
#   -dev     : flutter run -d web-server (hot-reload, порт 3000)
#   -chrome  : flutter run -d chrome (отдельное окно Chrome)
#   (без флага): раздаёт статику из kso-new-web/ через HTTP-сервер
#
# Использование:
#   powershell -ExecutionPolicy Bypass -File scripts/serve-kso.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/serve-kso.ps1 -dev
# ============================================================

param(
    [switch]$dev,
    [switch]$chrome
)

$ErrorActionPreference = "Stop"
$projectDir = "$PSScriptRoot\..\flutter-apps\kso-new"

if ($dev) {
    Write-Host "[kso-new] Starting Flutter dev server with hot-reload..." -ForegroundColor Green
    Push-Location $projectDir
    try {
        flutter run -d web-server --web-port 3000 --web-hostname localhost
    }
    finally {
        Pop-Location
    }
    return
}

if ($chrome) {
    Write-Host "[kso-new] Starting Flutter in Chrome..." -ForegroundColor Green
    Push-Location $projectDir
    try {
        flutter run -d chrome --web-port 3000
    }
    finally {
        Pop-Location
    }
    return
}

# Статический режим: раздаём собранный билд
$serveDir = "$PSScriptRoot\..\kso-new-web"

if (-not (Test-Path "$serveDir\index.html")) {
    Write-Host "[kso-new] Build not found. Run scripts/build-kso.ps1 first." -ForegroundColor Red
    Write-Host "         Or use -dev flag: scripts/serve-kso.ps1 -dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "[kso-new] Serving static files from kso-new-web/ on http://localhost:3000" -ForegroundColor Green

# Проверяем доступные HTTP-серверы
$server = $null

# Предпочитаем npx http-server
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "         Using: npx http-server" -ForegroundColor Gray
    Push-Location $serveDir
    try {
        npx http-server -p 3000 -c-1 --push-state
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "[kso-new] Install Node.js or use: flutter run -d web-server" -ForegroundColor Yellow
    Write-Host "         cd flutter-apps\kso-new && flutter run -d web-server --web-port 3000" -ForegroundColor Gray
    exit 1
}
