# IT-GM-004: Eliminar Mantenimiento - Documentación Detallada

## 📋 Información General
- **ID**: IT-GM-004
- **Título**: Eliminar Mantenimiento
- **Historia de Usuario**: HU-GM-004
- **Fecha de Creación**: 29/09/2025
- **Estado**: En Desarrollo

## 🎯 Objetivo
Validar el flujo completo de eliminación de mantenimientos, incluyendo:
- Selección del mantenimiento a eliminar
- Confirmación de la acción
- Manejo de casos con y sin asociaciones
- Verificación del resultado

## 🔧 Configuración Técnica

### Prerrequisitos
- Aplicación AMMS ejecutándose en localhost:3000
- Usuario con permisos de eliminación
- ChromeDriver configurado
- Python 3.8+

### Credenciales de Prueba
```json
{
  "email": "diegosamboni2001@gmail.com",
  "password": "Juandiego19!"
}
```

## 🚀 Flujo de la Prueba

### 1. **Login**
- Navegar a `/sigma/login`
- Ingresar credenciales
- Verificar login exitoso

### 2. **Navegación**
- Acceder a `/sigma/maintenance/maintenanceManagement`
- Verificar carga del módulo

### 3. **Verificación de Lista**
- Confirmar existencia de mantenimientos
- Mostrar primeros 3 elementos

### 4. **Selección para Eliminación**
- Hacer hover sobre la primera fila
- Hacer clic en botón "Eliminar mantenimiento"
- Verificar apertura del modal

### 5. **Confirmación**
- Leer mensaje de confirmación
- Hacer clic en botón de confirmación
- Esperar procesamiento

### 6. **Verificación de Resultado**
- Buscar mensajes de éxito/error
- Verificar eliminación de la lista
- Confirmar operación

## 📊 Casos de Prueba

### Caso 1: Eliminación Exitosa
- **Condición**: Mantenimiento sin asociaciones
- **Resultado Esperado**: Eliminación definitiva
- **Verificación**: Mantenimiento removido de la lista

### Caso 2: Inactivación por Asociaciones
- **Condición**: Mantenimiento con asociaciones
- **Resultado Esperado**: Mensaje de inactivación
- **Verificación**: Mantenimiento marcado como inactivo

## 🔍 Elementos de Interfaz

### Selectores Utilizados
```python
# Botón de eliminar
"//button[@title='Eliminar mantenimiento']"

# Modal de confirmación
"//div[contains(@class, 'DialogContent')]"

# Botones de confirmación
"//button[contains(text(), 'Eliminar')]"
"//button[contains(text(), 'Confirmar')]"
```

## 📈 Métricas de Éxito
- **Tasa de Éxito**: >95%
- **Tiempo de Ejecución**: <2 minutos
- **Cobertura**: 100% de criterios de aceptación

## 🐛 Manejo de Errores
- Timeout en elementos no encontrados
- Fallos en confirmación
- Errores de navegación
- Problemas de permisos

## 📝 Reportes
- **Formato**: JSON
- **Ubicación**: `reports/IT_GM_004_Report_<timestamp>.json`
- **Contenido**: Resultados detallados por paso

## 🔄 Mantenimiento
- Actualizar selectores si cambia la UI
- Revisar credenciales periódicamente
- Verificar compatibilidad con nuevas versiones



