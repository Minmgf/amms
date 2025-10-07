# Título
Verificar funcionalidad de filtrado y búsqueda en módulo de Mantenimiento

## Descripción
Validar la funcionalidad completa del módulo de Mantenimiento, incluyendo búsqueda por texto, filtros de calendario y filtros avanzados combinados (tipo, técnico y estado).

## Precondiciones
- Usuario autenticado en el sistema AMMS
- Acceso al módulo de Mantenimiento habilitado
- Registros de mantenimiento existentes en la base de datos
- Parámetros de filtrado configurados (tipos de mantenimiento, técnicos, estados)

## Datos de Entrada

### Búsquedas de Texto
- Término 1: "jacko"
- Término 2: "tractor"
- Término 3: "5649416"

### Filtros de Calendario
- Filtro Accent (botón azul)
- Filtro Success (botón verde)
- Filtro Warning (botón amarillo)

### Filtros Avanzados
- **Tipo de Mantenimiento**: Preventivo, Correctivo
- **Técnicos**: David, Linda Valentina, Luigy, Manuel, Alejandro
- **Estados**: Programado, Realizado, Cancelado

## Pasos (AAA)

### Arrange
1. Configurar credenciales de acceso (email/password desde .env)
2. Inicializar ChromeDriver y navegador
3. Realizar login en http://localhost:3000/sigma/
4. Navegar al módulo "Mantenimiento"
5. Esperar 5 segundos para carga completa del módulo

### Act
1. **Prueba de Búsqueda por Texto**:
   - Ingresar "jacko" en el campo de búsqueda
   - Esperar 5 segundos para visualizar resultados
   - Limpiar filtros con botón "Limpiar todos los filtros"
   - Repetir proceso con "tractor" y "5649416"

2. **Prueba de Filtros de Calendario**:
   - Hacer clic en botón de filtro Accent
   - Esperar 3 segundos
   - Hacer clic en botón de filtro Success
   - Esperar 3 segundos
   - Hacer clic en botón de filtro Warning
   - Esperar 3 segundos
   - Limpiar todos los filtros

3. **Prueba de Filtros Avanzados** (5 iteraciones):
   - Abrir modal "Filtros Avanzados"
   - Seleccionar aleatoriamente valores para:
     - Tipo de Mantenimiento (select 1)
     - Técnico (select 2)
     - Estado (select 3)
   - Aplicar filtros
   - Verificar resultados en tabla
   - Reabrir modal
   - Limpiar filtros avanzados
   - Aplicar limpieza
   - Repetir 5 veces

### Assert
- ✅ Login exitoso y navegación al módulo de Mantenimiento
- ✅ Búsqueda por cada término muestra resultados filtrados
- ✅ Botón "Limpiar todos los filtros" restaura la vista completa
- ✅ Cada filtro de calendario se aplica correctamente
- ✅ Modal de filtros avanzados se abre sin errores
- ✅ Los 3 selects (tipo, técnico, estado) permiten selección
- ✅ Filtros combinados generan resultados válidos o mensaje "sin resultados"
- ✅ Sistema maneja correctamente opciones con espacios en blanco
- ✅ 5 iteraciones completas de filtrado avanzado ejecutadas exitosamente

## Resultado Esperado
- Búsqueda de texto funcional con 3 términos diferentes
- Filtros de calendario aplicables individualmente
- Filtros avanzados combinables en múltiples configuraciones
- Sistema responde correctamente con resultados filtrados o mensaje apropiado
- Limpieza de filtros restaura estado inicial
- Todas las combinaciones de filtros ejecutan sin errores

## Resultado Obtenido
✅ **Búsqueda de texto**: 3/3 términos probados exitosamente (jacko, tractor, 5649416)

✅ **Filtros de calendario**: 3/3 filtros aplicados correctamente (Accent, Success, Warning)

✅ **Filtros avanzados**: 5/5 iteraciones completadas con combinaciones:
1. Correctivo + David + Programado (1 resultado)
2. Correctivo + Alejandro + Programado (1 resultado)
3. Preventivo + David + Realizado (1 resultado)
4. Preventivo + Luigy + Programado (1 resultado)
5. Preventivo + Manuel + Realizado (1 resultado)

✅ **Validaciones técnicas**:
- Selección por índice de elementos funcionando correctamente
- Coincidencia parcial de texto implementada para manejar espacios
- Scroll automático para evitar interceptación de clics
- Sistema robusto ante variaciones en valores de opciones

## Observaciones Técnicas
- Se implementó coincidencia parcial de texto (partial match) para manejar opciones con espacios finales ("Alejandro ", "Luigy ")
- Los 3 selects se identifican por clase CSS común y se mapean por índice [0=tipo, 1=técnico, 2=estado]
- Se utiliza `scrollIntoView` antes de hacer clic en "Filtros Avanzados" para evitar interceptación
- Logs del navegador guardados en: `tests/logs/IT-PM-002_browser_console.log`

## Estado / Fecha / Ejecutor
**Estado**: ✅ APROBADO

**Fecha**: 01/10/2025

**Ejecutado por**: David Lozano

---

## Información Técnica
- **Framework**: Selenium WebDriver + Python 3.13
- **Navegador**: Google Chrome 140.0.7339.208
- **Archivo de prueba**: `tests/test_case/IT-PM-002/IT-PM-002.py`
- **Servidor**: http://localhost:3000/sigma/
- **Código de salida**: 0 (éxito)
