# Test IT-GUSU-007 (RF-075, RF-077): Interfaz de gestión de cuentas

## Descripción

Test automatizado para verificar la interfaz de gestión de cuentas de usuarios, validando que el listado se muestre correctamente, las acciones administrativas funcionen con confirmaciones apropiadas y se muestren notificaciones del resultado.

## ID del Test Case
- **ID:** IT-GUSU-007
- **Título:** Interfaz de gestión de cuentas
- **Requerimientos:** RF-075, RF-077

## Alcance

### Precondiciones
- Usuario administrador logueado en el sistema
- Al menos 10 usuarios registrados con diferentes estados
- Interfaz de gestión de usuarios accesible
- Sistema de notificaciones configurado
- Base de datos PostgreSQL accesible (opcional)

### Funcionalidades Probadas

1. **Navegación al módulo de gestión**
   - Acceso desde menú principal
   - Carga correcta de la interfaz

2. **Visualización del listado**
   - Tabla/lista de usuarios visible
   - Información básica mostrada (nombre, email, rol, estado)
   - Datos coherentes entre UI y BD

3. **Búsqueda y filtros**
   - Búsqueda por nombre de usuario
   - Filtros por estado (activo/inactivo)
   - Filtros por rol

4. **Acciones administrativas**
   - Activar usuarios
   - Desactivar usuarios  
   - Ver detalles de usuario
   - Confirmaciones obligatorias para acciones críticas

5. **Notificaciones del sistema**
   - Notificación de éxito tras acciones
   - Notificación de error si corresponde
   - Visibilidad apropiada de mensajes

## Configuración

### Prerrequisitos técnicos

1. **Python 3.8+** con dependencias:
   ```bash
   pip install selenium faker python-dotenv psycopg2-binary
   ```

2. **ChromeDriver** en `../chromedriver/driver.exe`

3. **Archivo .env** (copiar desde .env.example):
   ```bash
   cp .env.example .env
   # Editar .env con sus credenciales
   ```

4. **Servidor de aplicación** ejecutándose en `http://localhost:3000`

### Variables de entorno requeridas

- `EMAIL`: Email del usuario administrador
- `PASSWORD`: Contraseña del administrador  
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Credenciales PostgreSQL (opcional)

## Uso

### Comandos básicos

```bash
# Modo visual (recomendado para desarrollo)
python test_IT_GUSU_007_RF-075.py

# Modo headless (para CI/CD)
python test_IT_GUSU_007_RF-075.py --headless

# Múltiples iteraciones
python test_IT_GUSU_007_RF-075.py --iterations 5

# Sin verificación de BD
python test_IT_GUSU_007_RF-075.py --no-verify-db

# Verificar configuración
python test_IT_GUSU_007_RF-075.py --check-env

# Ayuda completa
python test_IT_GUSU_007_RF-075.py --help
```

### Opciones avanzadas

| Opción | Descripción | Default |
|--------|-------------|---------|
| `--headless` | Ejecutar sin interfaz gráfica | false |
| `--iterations N` | Número de iteraciones del test | 3 |
| `--no-verify-db` | Deshabilitar verificación PostgreSQL | false |
| `--check-env` | Solo verificar configuración | - |

## Datos del Test Case

El test utiliza estos datos específicos según IT-GUSU-007:

### Usuarios de prueba
- **Usuario 1:** Pedro López (activo, Usuario)
- **Usuario 2:** Ana García (inactivo, Administrador)  
- **Usuario 3:** Luis Martín (pendiente, Usuario)

### Acciones a probar
1. Desactivar Usuario 1 (Pedro López)
2. Activar Usuario 2 (Ana García)
3. Ver detalles Usuario 3 (Luis Martín)

### Filtros de búsqueda
- Búsqueda por nombre: "Pedro"
- Filtro por estado: "activo"
- Filtro por rol: "Administrador"

## Resultados del Test

### Criterios de éxito

- ✅ **EXITOSO**: ≥80% operaciones exitosas + precondiciones cumplidas
- ⚠️ **PARCIAL**: ≥60% operaciones exitosas  
- ❌ **FALLIDO**: <60% operaciones exitosas

### Métricas reportadas

1. **Ejecución básica**
   - Tiempo total de ejecución
   - Iteraciones completadas/exitosas
   - Tasa de éxito general

2. **Validaciones funcionales**
   - Operaciones UI exitosas/fallidas
   - Validaciones de interfaz exitosas/fallidas
   - Verificaciones de BD exitosas/fallidas (si está habilitada)

3. **Detección de bugs** ⭐
   - **Campo afectado**
   - **Dato problemático**  
   - **Descripción del problema**
   - **Impacto en el usuario**

4. **Auditoría y trazabilidad**
   - Registro en logs de auditoría
   - Precondiciones cumplidas
   - Errores técnicos encontrados

### Ejemplo de reporte de bug

```
🐛 BUGS DETECTADOS (2):
  1. CAMPO: busqueda_nombre
     DATO: Pedro
     PROBLEMA: Búsqueda por nombre no muestra resultados
     IMPACTO: Usuarios no pueden encontrar cuentas específicas
     
  2. CAMPO: confirmacion_desactivar
     DATO: sin_confirmacion
     PROBLEMA: No aparece confirmación para desactivar usuario
     IMPACTO: Usuarios pueden realizar cambios críticos sin confirmación
```

## Verificación de Base de Datos

Si está habilitada (`--verify-db`), el test:

1. **Conecta a PostgreSQL** usando las credenciales del .env
2. **Consulta usuarios** antes y después de las acciones
3. **Verifica cambios** de estado en la BD
4. **Registra auditoría** de la ejecución del test

### Tablas consultadas (auto-detectadas)
- `users`, `user_profiles`, `usuarios`
- `audit_logs`, `test_logs`, `logs`

## Estructura de Archivos

```
test_IT_GUSU_007_RF-075/
├── test_IT_GUSU_007_RF-075.py    # Archivo principal del test
├── .env.example                   # Plantilla de configuración
├── .env                          # Configuración local (crear manualmente)
└── README.md                     # Esta documentación
```

## Solución de Problemas

### Errores comunes

1. **ChromeDriver no encontrado**
   ```bash
   # Descargar desde https://chromedriver.chromium.org/
   # Colocar en ../chromedriver/driver.exe
   ```

2. **Credenciales incorrectas**
   ```bash
   # Verificar EMAIL y PASSWORD en .env
   # Comprobar que el usuario tiene permisos de administrador
   ```

3. **PostgreSQL inaccesible**
   ```bash
   # Usar --no-verify-db para deshabilitar
   # Verificar credenciales DB_* en .env
   ```

4. **Elementos UI no encontrados**
   ```bash
   # Verificar que la aplicación está ejecutándose
   # Comprobar URLs en .env
   # Usar modo visual para debugging
   ```

### Debugging

```bash
# Verificar configuración
python test_IT_GUSU_007_RF-075.py --check-env

# Ejecutar en modo visual para ver errores
python test_IT_GUSU_007_RF-075.py --iterations 1

# Deshabilitar BD si causa problemas
python test_IT_GUSU_007_RF-075.py --no-verify-db
```

## Integración Continua

Para usar en CI/CD:

```bash
# Jenkins/GitHub Actions/GitLab CI
python test_IT_GUSU_007_RF-075.py --headless --iterations 1 --no-verify-db
```

## Contribución

Para añadir nuevas validaciones:

1. Crear métodos `test_nueva_funcionalidad()` 
2. Agregar selectores CSS/XPath apropiados
3. Implementar detección de bugs específicos
4. Actualizar documentación

---

**Nota:** Este test sigue el estándar establecido para reportar validaciones fallidas como bugs, facilitando la identificación y resolución de problemas en la interfaz de gestión de usuarios.
