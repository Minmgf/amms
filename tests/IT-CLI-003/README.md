# IT-CLI-003: Test de Vista Detallada Completa del Cliente

## Descripción
Test automatizado que valida la vista de detalle del cliente con todas las secciones organizadas: información general, contacto, estado y historial de solicitudes.

## Relacionado
- **HU-CLI-003**: Verificar vista detallada completa del cliente

## Objetivos del Test
1. ✅ Buscar y filtrar cliente existente por número de identificación
2. ✅ Acceder al detalle desde el listado
3. ✅ Verificar todas las secciones mostradas:
   - Información general
   - Datos de contacto
   - Estado del cliente
   - Historial de solicitudes organizado correctamente

## Precondiciones
- Cliente completo registrado con número de identificación **1075322278**
- Cliente con historial de solicitudes (opcional, pero recomendado)
- Usuario con permisos de consulta detallada

## Datos de Entrada
- **Número de identificación**: 1075322278 (cliente existente)

## Pasos (AAA)

### Arrange: Buscar y filtrar cliente existente
- Navegar al listado de clientes
- Buscar cliente por número de identificación: **1075322278**
- Verificar que el cliente aparece en los resultados filtrados

### Act: Acceder al detalle desde el listado
- Localizar el cliente en la tabla filtrada
- Hacer click en el botón "Ver detalles" del cliente encontrado
- Selector utilizado: `//tbody/tr[1]/td[7]/div[1]/button[1]` (o la fila correspondiente al cliente encontrado)

### Assert: Verificar todas las secciones mostradas
- Verificar sección de información general
- Verificar sección de datos de contacto
- Verificar sección de estado del cliente
- Verificar sección de historial de solicitudes organizado correctamente

## Resultado Esperado
Vista detallada muestra información general, datos contacto, estado del cliente y historial solicitudes organizado correctamente.

## Selectores Específicos
- **Botón Ver detalles**: `//tbody/tr[1]/td[7]/div[1]/button[1]`

## Funcionalidades Validadas
- ✅ Búsqueda de cliente existente por número de identificación
- ✅ Filtrado de resultados en el listado
- ✅ Acceso al detalle desde el listado de clientes
- ✅ Verificación de sección de información general
- ✅ Verificación de sección de datos de contacto
- ✅ Verificación de sección de estado del cliente
- ✅ Verificación de historial de solicitudes organizado
- ✅ Navegación correcta en la vista detallada
- ✅ Selectores robustos con múltiples opciones de fallback

## Ejecución
```bash
python IT-CLI-003.py
```

## Archivos del Proyecto
- `IT-CLI-003.py` - Test principal
- `requirements.txt` - Dependencias
- `README.md` - Documentación
- `chromedriver.exe` - Driver de Chrome (opcional, puede usar el de carpetas padre)

## Dependencias
- Selenium WebDriver
- ChromeDriver
- Python 3.8+

## Notas Técnicas
- Basado en el flujo exitoso del IT-CLI-001 e IT-CLI-002
- Manejo robusto de errores y excepciones
- Selectores con múltiples opciones de fallback
- Verificación flexible de secciones (continúa aunque no se encuentren elementos específicos)
- Compatible con diferentes estructuras de la vista detallada

