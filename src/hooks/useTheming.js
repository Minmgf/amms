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

  // Verificar si es un tema oscuro
  const isDarkTheme = () => {
    const theme = getCurrentTheme();
    // Considerar oscuro si el fondo es más oscuro que el texto
    const bg = theme?.colors?.background || '#ffffff';
    const text = theme?.colors?.text || '#000000';
    
    // Convertir hex a RGB y calcular luminancia
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    
    return getLuminance(bg) < getLuminance(text);
  };

  // Obtener color contrastante
  const getContrastColor = (backgroundColor) => {
    const theme = getCurrentTheme();
    const isDark = isDarkTheme();
    
    // Si el fondo es claro, devolver color oscuro y viceversa
    return backgroundColor === theme?.colors?.background 
      ? theme?.colors?.text 
      : isDark 
        ? '#ffffff' 
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
