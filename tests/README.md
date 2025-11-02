# Pruebas de Integración AMMS

## 📁 Estructura de Pruebas

```
tests/
├── README.md                    # Este archivo
├── IT-GM-003/                  # Prueba de Actualizar Mantenimiento
│   ├── README.md
│   ├── test_IT_GM_003_update_maintenance.py
│   ├── test_config.py
│   ├── setup_IT_GM_003_test.py
│   ├── run_IT_GM_003_test.py
│   ├── results/
│   ├── screenshots/
│   └── reports/
├── flows/                      # Flujos de navegación
│   ├── auth/
│   └── navigation/
└── test_case/                  # Casos de prueba específicos
    ├── IT-GUSU-006/
    ├── IT-GUSU-007/
    ├── IT-MAQ-001/
    ├── IT-MAQ-002/
    ├── IT-MAQ-003/
    └── IT-MAQ-004/
```

## 🚀 Pruebas Disponibles

### IT-GM-003: Actualizar Mantenimiento
- **Ubicación:** `tests/IT-GM-003/`
- **Descripción:** Prueba de integración para actualizar mantenimientos
- **Estado:** ⚠️ Funcionalidad no implementada en la aplicación
- **Ejecutar:** `cd tests/IT-GM-003 && python run_IT_GM_003_test.py`

## 📋 Casos de Prueba Existentes

### IT-GUSU-006: Gestión de Usuarios
- **Ubicación:** `tests/test_case/IT-GUSU-006/`
- **Descripción:** Pruebas de gestión de usuarios

### IT-GUSU-007: Gestión de Usuarios Avanzada
- **Ubicación:** `tests/test_case/IT-GUSU-007/`
- **Descripción:** Pruebas avanzadas de gestión de usuarios

### IT-MAQ-001 a IT-MAQ-004: Gestión de Maquinaria
- **Ubicación:** `tests/test_case/IT-MAQ-XXX/`
- **Descripción:** Pruebas de gestión de maquinaria

## 🔧 Configuración General

### Requisitos del Sistema
- Python 3.7+
- ChromeDriver
- Aplicación AMMS ejecutándose
- Credenciales de usuario válidas

### Instalación de Dependencias
```bash
pip install selenium requests
```

### Configuración de ChromeDriver
```bash
# Para IT-GM-003
cd tests/IT-GM-003
python setup_IT_GM_003_test.py
```

## 📊 Reportes y Resultados

Cada prueba genera:
- **Reportes JSON:** Análisis detallado de ejecución
- **Screenshots:** Capturas de pantalla de cada paso
- **Logs:** Registro detallado de actividades
- **Métricas:** Tiempo de ejecución y tasa de éxito

## 🛠️ Troubleshooting

### Problemas Comunes
1. **ChromeDriver no encontrado:** Ejecutar script de configuración
2. **Error de login:** Verificar credenciales y URL
3. **Aplicación no accesible:** Verificar que esté ejecutándose
4. **Funcionalidad no implementada:** Revisar estado de implementación

## 📚 Documentación

- [README_SELENIUM.md](../README_SELENIUM.md) - Documentación general
- [IT-GM-003/README.md](IT-GM-003/README.md) - Documentación específica
- [IT-GM-003/README_IT_GM_003.md](IT-GM-003/README_IT_GM_003.md) - Documentación detallada

## 🎯 Próximos Pasos

1. **Implementar funcionalidades faltantes** en la aplicación AMMS
2. **Completar pruebas de integración** una vez implementadas
3. **Integrar con CI/CD** para ejecución automática
4. **Expandir cobertura de pruebas** para otros módulos

## 📞 Soporte

Para problemas o preguntas:
1. Revisar documentación específica de cada prueba
2. Verificar logs de ejecución
3. Comprobar configuración del entorno
4. Verificar estado de implementación de funcionalidades



