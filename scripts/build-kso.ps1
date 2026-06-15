# ============================================================
# build-kso.ps1 — сборка Flutter КСО для standalone-деплоя
# ============================================================
# Результат: kso-new-web/ (готово к деплою на GitHub Pages /kso-new/)
#
# Использование:
#   powershell -ExecutionPolicy Bypass -File scripts/build-kso.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$projectDir = "$PSScriptRoot\..\flutter-apps\kso-new"
$outputDir = "$PSScriptRoot\..\kso-new-web"

Write-Host "[kso-new] Building Flutter web..." -ForegroundColor Green

Push-Location $projectDir
try {
    # Сборка с base-href /kso-new/
    flutter build web --base-href /kso-new/ --no-tree-shake-icons

    if ($LASTEXITCODE -ne 0) {
        # flutter build web возвращает exit code 1 даже при успехе из-за wasm warning
        # Проверяем, что build/web создан
        if (-not (Test-Path "build\web\main.dart.js")) {
            throw "Flutter build failed - main.dart.js not found"
        }
    }

    Write-Host "[kso-new] Copying to $outputDir ..." -ForegroundColor Green

    # Очищаем выходную папку
    if (Test-Path $outputDir) {
        Get-ChildItem $outputDir -Recurse | Remove-Item -Recurse -Force
    } else {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
    }

    # Копируем файлы билда
    Copy-Item -Path "build\web\*" -Destination $outputDir -Recurse -Force

    Write-Host "[kso-new] Done! Output: $outputDir" -ForegroundColor Green
    Write-Host "         Base href: /kso-new/" -ForegroundColor Gray
}
finally {
    Pop-Location
}
