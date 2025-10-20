# IT-SOL-001: Automatización de Gestión de Solicitudes

## 🚀 Ejecución Rápida

```powershell
python tests\IT-SOL-001\IT-SOL-001.py
```

## 📋 ¿Qué hace?

Automatiza el flujo completo de creación de solicitudes:

1. **Login** automático con credenciales del `.env`
2. **Navega** a Solicitudes → Gestión de solicitudes
3. **Paso 1**: Ingresa ID de usuario (ejemplo: 1075262391) y verifica si existe
4. **Paso 2**: Completa descripción y fechas
5. **Paso 3**: Selecciona ubicación (país, departamento, ciudad) y datos de finca
6. **Guarda** y continúa
7. **Verifica** notificaciones

## 📊 Resultados

- **Screenshots**: `screenshots/` con capturas de cada paso
- **Reporte**: `IT-SOL-001-reporte.md` con logs completos

## 👥 Usuarios de Prueba

- 1075262391 (principal)
- 10046573
- 1076501058
- 26570831

## ⚙️ Configuración

Usa credenciales del archivo `.env` en la raíz:
- `EMAIL`
- `PASSWORD`

## ⏱️ Tiempos

- Esperas de 2-3 segundos entre acciones
- Timeout de 15 segundos para elementos
