# IT-MAQ-002: Verificar validación de duplicados en número de serie

## Información General

**ID:** IT-MAQ-002
**Título:** Verificar validación de duplicados en número de serie
**Tipo:** Funcional - Automatizada
**Prioridad:** Alta
**Estado:** Automatizada

## Descripción

Validar que el sistema impida registrar maquinarias con números de serie duplicados. Este caso verifica que cuando se intenta registrar una maquinaria con un número de serie que ya existe en el sistema, se muestre un error de validación claro y no se permita continuar con el registro.

## Precondiciones

- Maquinaria con número serie "TB001-2023" ya existe (creada por IT-MAQ-001)
- Usuario con permisos de registro de maquinaria autenticado
- Formulario multipaso accesible desde módulo maquinaria

## Datos de Entrada

| Campo | Valor |
|-------|-------|
| Nombre | "Tractor Banano 002" |
| Número serie | "TB001-2023" (duplicado) |
| Tipo maquinaria | "Tractor" |
| Marca | "Deutz" |
| Modelo | Seleccionado automáticamente |
| País | "Colombia" |
| Región | "Antioquia" |
| Ciudad | "Medellín" |

## Pasos de Ejecución (AAA)

### Arrange
- Ejecutar IT-MAQ-001 para asegurar que existe maquinaria con serie "TB001-2023"
- Configurar usuario con permisos adecuados
- Verificar conectividad con la aplicación

### Act
1. Autenticar usuario en el sistema
2. Navegar al módulo de maquinaria
3. Abrir formulario de añadir maquinaria
4. Completar formulario con datos válidos pero número serie duplicado
5. Intentar enviar formulario y avanzar al siguiente paso

### Assert
- Verificar que se muestra error de validación
- Confirmar mensaje específico de duplicado
- Validar que no se permite avanzar al paso 2
- Verificar que el formulario permanece en el paso 1

## Resultado Esperado

- ❌ **Error de validación mostrado**: Mensaje claro indicando duplicado
- ❌ **No permite avanzar**: Botón "Siguiente" deshabilitado o sin efecto
- ❌ **Mensaje específico**: "Número de serie ya existe" o similar
- ❌ **Formulario permanece**: No avanza al paso 2 del formulario

## Resultado Obtenido

_[Pendiente - Primera ejecución]_

## Estado / Fecha / Ejecutor

**Estado:** Automatizada
**Fecha:** 27/09/2025
**Ejecutado por:** Automatización Selenium

## Archivos de Automatización

- `IT-MAQ-002.py`: Script principal de automatización
- `README.md`: Documentación del caso de prueba

## Dependencias

- Selenium WebDriver
- ChromeDriver
- Caso precedente: `IT-MAQ-001` (para crear maquinaria base)
- Flujos base: `selenium_login_flow.py`, `machinery_navigation.py`
- Archivo `.env` con credenciales válidas

## Ejecución

```bash
# Desde el directorio raíz del proyecto tests/
python "test case/IT-MAQ-002/IT-MAQ-002.py"
```

## Notas Técnicas

- **Dependencia de IT-MAQ-001**: Este caso requiere que IT-MAQ-001 se ejecute primero
- **Validación de errores**: Verifica mensajes de error específicos del sistema
- **SPA Navigation**: Manejo especial para aplicaciones de página única
- **Captura de HTML**: Genera captura del formulario para análisis de selectores
- **Logging detallado**: Incluye logging para debugging y verificación

## Estructura de Archivos

```
IT-MAQ-002/
├── __init__.py                 # Paquete Python
├── IT-MAQ-002.py              # Script principal
├── example_usage.py           # Ejemplos de uso
├── README.md                  # Esta documentación
└── modal_html_capture.html    # Captura HTML (generado)
```

## Ejemplos de Uso

### Ejecución Completa
```python
from test_case.IT_MAQ_002.IT_MAQ_002 import run_it_maq_002

success = run_it_maq_002(headless=False)
```

### Ejecución Paso a Paso
```python
from test_case.IT_MAQ_001.IT_MAQ_001 import setup_test_environment, run_it_maq_001_step1
from test_case.IT_MAQ_002.IT_MAQ_002 import run_it_maq_002_validation

# Preparar estado (asegurar maquinaria existente)
driver = setup_test_environment()
driver = run_it_maq_001_step1(driver)

# Ejecutar validación de duplicados
driver = run_it_maq_002_validation(driver)
```

---

**Versión**: 1.0.0
**Última actualización**: Septiembre 2025
**Estado**: Automatizada, pendiente primera ejecución