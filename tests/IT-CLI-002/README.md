# IT-CLI-002: Test de Listado de Clientes con Filtros Avanzados

## Descripción
Test automatizado que valida el listado de clientes con todas sus columnas, filtros avanzados, búsqueda rápida, paginación y control de permisos según la HU-CLI-002.

## Objetivos del Test
1. ✅ Crear 25 clientes con datos realistas y variedad de estados
2. ✅ Verificar el listado con todas sus columnas (Nombre/Razón Social, Identificación, Teléfono, Email, Usuario Activo, Estado)
3. ✅ Aplicar filtros avanzados (estado: "Activo", usuario activo: "Sí")
4. ✅ Realizar búsqueda rápida por nombre/apellido ("Pérez")
5. ✅ Probar paginación operativa (siguiente/anterior, elementos por página: 10)
6. ✅ Validar control de permisos del usuario

## Precondiciones
- 25 clientes registrados con diferentes estados y tipos
- Usuario con permisos de consulta de clientes
- Sistema de filtros configurado

## Datos de Entrada
- **Filtro estado**: "Activo"
- **Filtro usuario activo**: "Sí"
- **Búsqueda rápida**: "Pérez"
- **Página**: 1, Elementos por página: 10

## Selectores Específicos
- **Siguiente página**: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'Next →')]`
- **Cantidad de datos por página**: `//select[@class='parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500']`
- **Atrás en página**: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'← Previous')]`

## Datos de Clientes Realistas
El test incluye 25 clientes con datos completamente realistas:
- Nombres y apellidos colombianos auténticos
- Direcciones reales de Bogotá
- Números de teléfono válidos
- Emails coherentes
- Identificaciones únicas

## Funcionalidades Validadas
- ✅ **Creación masiva de clientes** con datos realistas
- ✅ **Verificación de columnas** del listado
- ✅ **Filtros por estado** y usuario activo
- ✅ **Búsqueda rápida** por nombre/apellido
- ✅ **Navegación de paginación** (siguiente/anterior)
- ✅ **Control de elementos por página**
- ✅ **Validación de permisos** de usuario
- ✅ **Selectores robustos** con múltiples opciones de fallback

## Ejecución
```bash
python IT-CLI-002.py
```

## Resultado Esperado
Listado muestra columnas correctas, filtros aplicados correctamente, paginación operativa y acciones disponibles según permisos del usuario.

## Archivos del Proyecto
- `IT-CLI-002.py` - Test principal
- `requirements.txt` - Dependencias
- `README.md` - Documentación

## Dependencias
- Selenium WebDriver
- ChromeDriver
- Python 3.8+

## Notas Técnicas
- Basado en el flujo exitoso del IT-CLI-001
- Manejo robusto de errores y excepciones
- Selectores con múltiples opciones de fallback
- Datos de clientes completamente realistas
- Validación completa de funcionalidades de listado
