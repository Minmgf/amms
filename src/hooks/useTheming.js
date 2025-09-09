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
    getThemeNames
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

  return {
    // Estado del tema
    currentTheme,
    isDark: isDarkTheme(),
    theme: getCurrentTheme(),
    
    // Funciones de tema
    changeTheme,
    getAllThemes,
    getThemeNames,
    
    // Utilidades de estilo
    getThemeValue,
    getThemeClasses,
    getThemeStyles,
    getContrastColor,
    getThemeGradient,
    applyThemeToElement,
    
    // Colores rápidos (para uso directo)
    colors: getCurrentTheme()?.colors || {},
    typography: getCurrentTheme()?.typography || {},
    spacing: getCurrentTheme()?.spacing || {},
    borderRadius: getCurrentTheme()?.borderRadius || {},
  };
};

export default useTheming;
