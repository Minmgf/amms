# IT-SER-001: Registro de Servicios

**Fecha:** 2025-10-21 14:40:44

---

## Secuencia de Selectores

1. `//span[normalize-space()='Solicitudes']` - Menu Solicitudes
2. `//a[normalize-space()='Servicios']` - Submenu Servicios
3. `//button[normalize-space()='Nuevo Servicio']` - Botón nuevo
4. `//input[@id='service_name']` - Nombre servicio
5. `//textarea[@id='description']` - Descripción
6. `//select[@id='service_type']` - Tipo servicio
7. `//input[@id='base_price']` - Precio base
8. `//select[@id='price_unit']` - Unidad precio
9. `//select[@id='applicable_tax']` - Impuesto
10. `//input[@id='tax_rate']` - Tasa impuesto
11. `//input[@name='is_vat_exempt']` - Checkbox exento
12. `//button[normalize-space()='Registrar']` - Botón registrar

## Servicios de Prueba

### 1. Mantenimiento Preventivo Básico
- **Precio**: $150000 COP
- **Impuesto**: 19 (IVA 19%)

### 2. Reparación Sistema Hidráulico
- **Precio**: $250000 COP
- **Impuesto**: 19 (IVA 19%)

### 3. Calibración de Equipos
- **Precio**: $180000 COP
- **Impuesto**: 5 (IVA 5%)

### 4. Servicio Emergencia 24h
- **Precio**: $350000 COP
- **Impuesto**: 19 (IVA 19%)

### 5. Inspección Técnica Anual
- **Precio**: $120000 COP
- **Impuesto**: 0 (Exento)

## Resultados

- **Total**: 5
- **Exitosos**: 5
- **Fallidos**: 0

## Log Completo

```
[2025-10-21 14:37:46] [INFO] ================================================================================
[2025-10-21 14:37:46] [INFO] IT-SER-001: REGISTRO DE SERVICIOS
[2025-10-21 14:37:46] [INFO] ================================================================================
[2025-10-21 14:37:46] [INFO] Configurando driver Chrome...
[2025-10-21 14:37:47] [SUCCESS] Driver configurado
[2025-10-21 14:37:47] [INFO] === LOGIN ===
[2025-10-21 14:37:50] [INFO] Email: juandalozano07@gmail.com
[2025-10-21 14:37:50] [INFO] Contraseña ingresada
[2025-10-21 14:37:50] [INFO] Click en 'Iniciar sesión'
[2025-10-21 14:37:53] [SUCCESS] Login exitoso
[2025-10-21 14:37:53] [INFO] 
[2025-10-21 14:37:53] [INFO] ================================================================================
[2025-10-21 14:37:53] [INFO] === SERVICIO 1/5: Mantenimiento Preventivo Básico ===
[2025-10-21 14:37:53] [INFO] PASO 1: Click menú Solicitudes
[2025-10-21 14:37:56] [INFO] PASO 2: Click submenú Servicios
[2025-10-21 14:37:59] [INFO] PASO 3: Click botón 'Nuevo Servicio'
[2025-10-21 14:38:03] [INFO] PASO 4: Ingresando nombre servicio
[2025-10-21 14:38:03] [INFO]    → Mantenimiento Preventivo Básico
[2025-10-21 14:38:05] [INFO] PASO 5: Ingresando descripción
[2025-10-21 14:38:05] [INFO]    → 118 caracteres
[2025-10-21 14:38:07] [INFO] PASO 6: Seleccionando tipo de servicio
[2025-10-21 14:38:08] [INFO]    → value='42' (Mantenieminetos)
[2025-10-21 14:38:10] [INFO] PASO 7: Ingresando precio base
[2025-10-21 14:38:10] [INFO]    → $150000
[2025-10-21 14:38:12] [INFO] PASO 8: Seleccionando unidad de precio
[2025-10-21 14:38:12] [INFO]    → value='19' (Pesos Colombianos)
[2025-10-21 14:38:14] [INFO] PASO 9: Seleccionando impuesto aplicable
[2025-10-21 14:38:14] [INFO]    → value='19' (IVA 19%)
[2025-10-21 14:38:16] [INFO] PASO 10: Ingresando tasa de impuesto
[2025-10-21 14:38:16] [INFO]    → 19%
[2025-10-21 14:38:18] [INFO] PASO 11: Checkbox exento de IVA
[2025-10-21 14:38:18] [INFO]    → Servicio no exento, sin marcar
[2025-10-21 14:38:20] [INFO] PASO 12: Click en 'Registrar'
[2025-10-21 14:38:25] [SUCCESS] Servicio 1 registrado exitosamente
[2025-10-21 14:38:25] [INFO] ================================================================================
[2025-10-21 14:38:28] [INFO] 
[2025-10-21 14:38:28] [INFO] ================================================================================
[2025-10-21 14:38:28] [INFO] === SERVICIO 2/5: Reparación Sistema Hidráulico ===
[2025-10-21 14:38:28] [INFO] PASO 1: Click menú Solicitudes
[2025-10-21 14:38:31] [INFO] PASO 2: Click submenú Servicios
[2025-10-21 14:38:34] [INFO] PASO 3: Click botón 'Nuevo Servicio'
[2025-10-21 14:38:37] [INFO] PASO 4: Ingresando nombre servicio
[2025-10-21 14:38:37] [INFO]    → Reparación Sistema Hidráulico
[2025-10-21 14:38:39] [INFO] PASO 5: Ingresando descripción
[2025-10-21 14:38:40] [INFO]    → 77 caracteres
[2025-10-21 14:38:42] [INFO] PASO 6: Seleccionando tipo de servicio
[2025-10-21 14:38:42] [INFO]    → value='42' (Mantenieminetos)
[2025-10-21 14:38:44] [INFO] PASO 7: Ingresando precio base
[2025-10-21 14:38:44] [INFO]    → $250000
[2025-10-21 14:38:46] [INFO] PASO 8: Seleccionando unidad de precio
[2025-10-21 14:38:46] [INFO]    → value='19' (Pesos Colombianos)
[2025-10-21 14:38:48] [INFO] PASO 9: Seleccionando impuesto aplicable
[2025-10-21 14:38:48] [INFO]    → value='19' (IVA 19%)
[2025-10-21 14:38:50] [INFO] PASO 10: Ingresando tasa de impuesto
[2025-10-21 14:38:51] [INFO]    → 19%
[2025-10-21 14:38:53] [INFO] PASO 11: Checkbox exento de IVA
[2025-10-21 14:38:53] [INFO]    → Servicio no exento, sin marcar
[2025-10-21 14:38:55] [INFO] PASO 12: Click en 'Registrar'
[2025-10-21 14:38:59] [SUCCESS] Servicio 2 registrado exitosamente
[2025-10-21 14:38:59] [INFO] ================================================================================
[2025-10-21 14:39:02] [INFO] 
[2025-10-21 14:39:02] [INFO] ================================================================================
[2025-10-21 14:39:02] [INFO] === SERVICIO 3/5: Calibración de Equipos ===
[2025-10-21 14:39:02] [INFO] PASO 1: Click menú Solicitudes
[2025-10-21 14:39:05] [INFO] PASO 2: Click submenú Servicios
[2025-10-21 14:39:08] [INFO] PASO 3: Click botón 'Nuevo Servicio'
[2025-10-21 14:39:12] [INFO] PASO 4: Ingresando nombre servicio
[2025-10-21 14:39:12] [INFO]    → Calibración de Equipos
[2025-10-21 14:39:14] [INFO] PASO 5: Ingresando descripción
[2025-10-21 14:39:14] [INFO]    → 71 caracteres
[2025-10-21 14:39:16] [INFO] PASO 6: Seleccionando tipo de servicio
[2025-10-21 14:39:17] [INFO]    → value='42' (Mantenieminetos)
[2025-10-21 14:39:19] [INFO] PASO 7: Ingresando precio base
[2025-10-21 14:39:19] [INFO]    → $180000
[2025-10-21 14:39:21] [INFO] PASO 8: Seleccionando unidad de precio
[2025-10-21 14:39:21] [INFO]    → value='19' (Pesos Colombianos)
[2025-10-21 14:39:23] [INFO] PASO 9: Seleccionando impuesto aplicable
[2025-10-21 14:39:23] [INFO]    → value='5' (IVA 5%)
[2025-10-21 14:39:25] [INFO] PASO 10: Ingresando tasa de impuesto
[2025-10-21 14:39:25] [INFO]    → 5%
[2025-10-21 14:39:27] [INFO] PASO 11: Checkbox exento de IVA
[2025-10-21 14:39:27] [INFO]    → Servicio no exento, sin marcar
[2025-10-21 14:39:29] [INFO] PASO 12: Click en 'Registrar'
[2025-10-21 14:39:33] [SUCCESS] Servicio 3 registrado exitosamente
[2025-10-21 14:39:33] [INFO] ================================================================================
[2025-10-21 14:39:36] [INFO] 
[2025-10-21 14:39:36] [INFO] ================================================================================
[2025-10-21 14:39:36] [INFO] === SERVICIO 4/5: Servicio Emergencia 24h ===
[2025-10-21 14:39:36] [INFO] PASO 1: Click menú Solicitudes
[2025-10-21 14:39:40] [INFO] PASO 2: Click submenú Servicios
[2025-10-21 14:39:43] [INFO] PASO 3: Click botón 'Nuevo Servicio'
[2025-10-21 14:39:46] [INFO] PASO 4: Ingresando nombre servicio
[2025-10-21 14:39:46] [INFO]    → Servicio Emergencia 24h
[2025-10-21 14:39:48] [INFO] PASO 5: Ingresando descripción
[2025-10-21 14:39:49] [INFO]    → 82 caracteres
[2025-10-21 14:39:51] [INFO] PASO 6: Seleccionando tipo de servicio
[2025-10-21 14:39:51] [INFO]    → value='42' (Mantenieminetos)
[2025-10-21 14:39:53] [INFO] PASO 7: Ingresando precio base
[2025-10-21 14:39:53] [INFO]    → $350000
[2025-10-21 14:39:55] [INFO] PASO 8: Seleccionando unidad de precio
[2025-10-21 14:39:55] [INFO]    → value='19' (Pesos Colombianos)
[2025-10-21 14:39:57] [INFO] PASO 9: Seleccionando impuesto aplicable
[2025-10-21 14:39:57] [INFO]    → value='19' (IVA 19%)
[2025-10-21 14:39:59] [INFO] PASO 10: Ingresando tasa de impuesto
[2025-10-21 14:40:00] [INFO]    → 19%
[2025-10-21 14:40:02] [INFO] PASO 11: Checkbox exento de IVA
[2025-10-21 14:40:02] [INFO]    → Servicio no exento, sin marcar
[2025-10-21 14:40:04] [INFO] PASO 12: Click en 'Registrar'
[2025-10-21 14:40:08] [SUCCESS] Servicio 4 registrado exitosamente
[2025-10-21 14:40:08] [INFO] ================================================================================
[2025-10-21 14:40:11] [INFO] 
[2025-10-21 14:40:11] [INFO] ================================================================================
[2025-10-21 14:40:11] [INFO] === SERVICIO 5/5: Inspección Técnica Anual ===
[2025-10-21 14:40:11] [INFO] PASO 1: Click menú Solicitudes
[2025-10-21 14:40:14] [INFO] PASO 2: Click submenú Servicios
[2025-10-21 14:40:17] [INFO] PASO 3: Click botón 'Nuevo Servicio'
[2025-10-21 14:40:20] [INFO] PASO 4: Ingresando nombre servicio
[2025-10-21 14:40:20] [INFO]    → Inspección Técnica Anual
[2025-10-21 14:40:22] [INFO] PASO 5: Ingresando descripción
[2025-10-21 14:40:23] [INFO]    → 76 caracteres
[2025-10-21 14:40:25] [INFO] PASO 6: Seleccionando tipo de servicio
[2025-10-21 14:40:25] [INFO]    → value='42' (Mantenieminetos)
[2025-10-21 14:40:27] [INFO] PASO 7: Ingresando precio base
[2025-10-21 14:40:27] [INFO]    → $120000
[2025-10-21 14:40:29] [INFO] PASO 8: Seleccionando unidad de precio
[2025-10-21 14:40:29] [INFO]    → value='19' (Pesos Colombianos)
[2025-10-21 14:40:31] [INFO] PASO 9: Seleccionando impuesto aplicable
[2025-10-21 14:40:31] [INFO]    → value='0' (Exento)
[2025-10-21 14:40:33] [INFO] PASO 10: Ingresando tasa de impuesto
[2025-10-21 14:40:33] [INFO]    → 0%
[2025-10-21 14:40:35] [INFO] PASO 11: Checkbox exento de IVA
[2025-10-21 14:40:35] [INFO]    → Ya estaba marcado
[2025-10-21 14:40:37] [INFO] PASO 12: Click en 'Registrar'
[2025-10-21 14:40:41] [SUCCESS] Servicio 5 registrado exitosamente
[2025-10-21 14:40:41] [INFO] ================================================================================
[2025-10-21 14:40:41] [INFO] 
[2025-10-21 14:40:41] [INFO] ================================================================================
[2025-10-21 14:40:41] [INFO] RESUMEN FINAL
[2025-10-21 14:40:41] [INFO] ================================================================================
[2025-10-21 14:40:41] [INFO] Total servicios: 5
[2025-10-21 14:40:41] [SUCCESS] Exitosos: 5
[2025-10-21 14:40:41] [INFO] ================================================================================
```

---
