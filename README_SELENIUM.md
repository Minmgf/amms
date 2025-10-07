# Proyecto Selenium - Automatización Web

Este proyecto contiene scripts de automatización web usando Selenium WebDriver para interactuar con aplicaciones web, incluyendo pruebas de integración para el sistema AMMS.

## Archivos incluidos:

### Scripts de Ejemplo
- `main.py` - Script principal que requiere chromedriver.exe
- `main_improved.py` - Script mejorado que descarga automáticamente el driver

### Pruebas de Integración AMMS
- `test_hu_gm_003_update_maintenance.py` - Prueba básica HU-GM-003 (Actualizar Mantenimiento)
- `test_hu_gm_003_improved.py` - Prueba mejorada HU-GM-003 con reportes
- `setup_hu_gm_003_test.py` - Configuración automática del entorno
- `run_hu_gm_003_test.py` - Ejecutor principal de pruebas
- `test_config_example.py` - Configuración de ejemplo
- `README_HU_GM_003.md` - Documentación específica de la prueba

### Configuración
- `requirements.txt` - Dependencias del proyecto
- `README_SELENIUM.md` - Este archivo de instrucciones

## Instalación:

### Para Scripts de Ejemplo
```bash
pip install -r requirements.txt
python main_improved.py
```

### Para Pruebas de Integración AMMS (HU-GM-003)

#### Configuración Automática (Recomendado)
```bash
# 1. Configurar entorno automáticamente
python setup_hu_gm_003_test.py

# 2. Ejecutar prueba
python run_hu_gm_003_test.py
```

#### Configuración Manual
```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Descargar ChromeDriver
python download_chromedriver.py

# 3. Configurar test_config.py (copiar desde test_config_example.py)
cp test_config_example.py test_config.py
# Editar test_config.py con tus credenciales

# 4. Ejecutar prueba
python test_hu_gm_003_improved.py
```

## Características:

### Scripts de Ejemplo
- Navegación automática a MercadoLibre Colombia
- Búsqueda inteligente del botón "Ingresa"
- Múltiples selectores de respaldo
- Screenshots automáticos
- Manejo de errores robusto
- Configuración anti-detección

### Pruebas de Integración AMMS
- **HU-GM-003: Actualizar Mantenimiento**
  - Validación de todos los criterios de aceptación
  - Pruebas de campos obligatorios
  - Validación de nombres duplicados
  - Reportes detallados con screenshots
  - Configuración flexible por entorno
  - Integración con CI/CD

## Requisitos:

- Python 3.7+
- Google Chrome instalado
- Conexión a internet
- Para pruebas AMMS: Aplicación AMMS ejecutándose

## Documentación Específica:

- **README_HU_GM_003.md** - Documentación completa de la prueba de integración HU-GM-003
- **test_config_example.py** - Configuración de ejemplo para personalizar las pruebas

## Notas:

- Los scripts toman screenshots para verificar el funcionamiento
- Usan selectores múltiples para mayor robustez
- Incluyen configuraciones para evitar detección como bot
- Las pruebas de integración generan reportes detallados en JSON


