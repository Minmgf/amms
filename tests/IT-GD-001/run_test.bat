@echo off
REM Script para ejecutar el test IT-GD-001
REM Windows PowerShell / CMD

echo ========================================
echo   IT-GD-001 - Test de Automatizacion
echo ========================================
echo.

REM Verificar que Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor instala Python desde https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Verificar que existe el archivo .env
if not exist "..\..\.env" (
    echo ERROR: Archivo .env no encontrado en la raiz del proyecto
    echo Por favor configura tus credenciales en el archivo .env
    pause
    exit /b 1
)

echo [OK] Archivo .env encontrado
echo.

REM Instalar dependencias si es necesario
echo Verificando dependencias...
pip show selenium >nul 2>&1
if errorlevel 1 (
    echo Instalando selenium...
    pip install selenium
)

pip show python-dotenv >nul 2>&1
if errorlevel 1 (
    echo Instalando python-dotenv...
    pip install python-dotenv
)

echo [OK] Dependencias verificadas
echo.

REM Ejecutar el test
echo ========================================
echo   Ejecutando IT-GD-001.py
echo ========================================
echo.

python IT-GD-001.py

echo.
echo ========================================
echo   Ejecucion completada
echo ========================================
echo.

REM Preguntar si abrir la carpeta de reportes
set /p open_reports="Deseas abrir la carpeta de reportes? (S/N): "
if /i "%open_reports%"=="S" (
    start "" "reports"
)

set /p open_screenshots="Deseas abrir la carpeta de screenshots? (S/N): "
if /i "%open_screenshots%"=="S" (
    start "" "screenshots"
)

echo.
echo Presiona cualquier tecla para salir...
pause >nul
