@echo off
REM Script para ejecutar el test IT-GD-003

echo ========================================
echo   IT-GD-003 - Test de Automatizacion
echo ========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

if not exist "..\.env" (
    echo ERROR: Archivo .env no encontrado
    pause
    exit /b 1
)

echo [OK] Archivo .env encontrado
echo.

echo ========================================
echo   Ejecutando IT-GD-003.py
echo ========================================
echo.

python IT-GD-003.py

echo.
echo ========================================
echo   Ejecucion completada
echo ========================================
echo.

set /p open_reports="Deseas abrir la carpeta de reportes? (S/N): "
if /i "%open_reports%"=="S" (
    start "" "reports"
)

set /p open_screenshots="Deseas abrir la carpeta de screenshots? (S/N): "
if /i "%open_screenshots%"=="S" (
    start "" "screenshots"
)

pause
