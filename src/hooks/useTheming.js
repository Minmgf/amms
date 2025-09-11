import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook personalizado que proporciona utilidades temáticas
 * para usar en cualquier componente de la aplicación
 */
export const useTheming = () => {
  const themeContext = useTheme();
  
  if (!themeContext) {
    throw new Error('useTheming debe ser usado dentro de un ThemeProvider');
  }

  const {
    currentTheme,
    getCurrentTheme,
    changeTheme,
    getAllThemes,
    getThemeNames,
    // Nuevas funciones para API
    loadThemesFromAPI,
    saveThemeToAPI,
    deleteThemeFromAPI
  } = themeContext;

  // Obtener valores específicos del tema actual
  const getThemeValue = (path) => {
    const theme = getCurrentTheme();
    return path.split('.').reduce((obj, key) => obj?.[key], theme);
  };

  // Generar clases CSS dinámicas basadas en el tema
  const getThemeClasses = (baseClasses = '') => {
    return `${baseClasses} bg-surface text-primary border-primary`.trim();
  };

  // Obtener estilos inline para casos específicos
  const getThemeStyles = (styleMap = {}) => {
    const theme = getCurrentTheme();
    const styles = {};
    
    Object.entries(styleMap).forEach(([cssProperty, themePath]) => {
      styles[cssProperty] = getThemeValue(themePath);
    });
    
    return styles;
  };

  // Verificar si es un tema oscuro (siempre false ahora que solo tenemos tema claro)
  const isDarkTheme = () => {
    return false;
  };

  // Obtener color contrastante
  const getContrastColor = (backgroundColor) => {
    const theme = getCurrentTheme();
    
    // Si el fondo es claro, devolver color oscuro
    return backgroundColor === theme?.colors?.background 
      ? theme?.colors?.text 
      : '#000000';
  };

  // Aplicar tema a un elemento específico
  const applyThemeToElement = (element, themeVars = {}) => {
    if (!element) return;
    
    const theme = getCurrentTheme();
    
    // Aplicar variables CSS personalizadas
    Object.entries(themeVars).forEach(([property, themePath]) => {
      const value = getThemeValue(themePath);
      if (value) {
        element.style.setProperty(property, value);
      }
    });
  };

  // Generar gradiente basado en los colores del tema
  const getThemeGradient = (direction = 'to right') => {
    const theme = getCurrentTheme();
    const primary = theme?.colors?.accent || '#3b82f6';
    const secondary = theme?.colors?.secondary || '#1f2937';
    
    return `linear-gradient(${direction}, ${primary}, ${secondary})`;
  };

  // Obtener clases CSS específicas para sidebar
  const getSidebarClasses = (isActive = false, isHover = false) => {
    if (isActive) {
      return 'nav-item-active sidebar-text-active';
    }
    if (isHover) {
      return 'nav-item-theme sidebar-text-primary';
    }
    return 'nav-item-theme sidebar-text-secondary';
  };

  // Función para cargar y aplicar temas dinámicos
  const loadDynamicThemes = async () => {
    try {
      const apiThemes = await loadThemesFromAPI();
      console.log('🎨 Temas dinámicos cargados:', Object.keys(apiThemes));
      return apiThemes;
    } catch (error) {
      console.error('❌ Error cargando temas dinámicos:', error);
      return {};
    }
  };

  // Función para crear y enviar tema personalizado
  const createAndSaveTheme = async (themeKey, themeData) => {
    try {
      const success = await saveThemeToAPI(themeKey, themeData);
      if (success) {
        console.log('✅ Tema creado y guardado exitosamente');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error creando tema:', error);
      return false;
    }
  };

  return {
    // Estado del tema
    currentTheme,
    isDark: isDarkTheme(),
    theme: getCurrentTheme(),
    
    // Funciones de tema
    changeTheme,
    getAllThemes,
    getThemeNames,
    
    // Funciones para temas dinámicos
    loadDynamicThemes,
    createAndSaveTheme,
    saveThemeToAPI,
    deleteThemeFromAPI,
    
    // Utilidades de estilo
    getThemeValue,
    getThemeClasses,
    getThemeStyles,
    getContrastColor,
    getThemeGradient,
    applyThemeToElement,
    getSidebarClasses,
    
    // Colores rápidos (para uso directo)
    colors: getCurrentTheme()?.colors || {},
    typography: getCurrentTheme()?.typography || {},
    spacing: getCurrentTheme()?.spacing || {},
    borderRadius: getCurrentTheme()?.borderRadius || {},
  };
};

export default useTheming;
