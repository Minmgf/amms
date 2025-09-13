"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import themeApiService from '@/services/themeService';

// Tema por defecto como fallback
const DEFAULT_THEME = {
  name: 'Tema por Defecto',
  colors: {
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#3B82F6',
    background: '#ffffff',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    hover: '#d2d4d6',
    error: '#DC2626',
    success: '#059669',
    warning: '#D97706'
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  }
};

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Provider del tema
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [themes, setThemes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar temas desde la API al inicializar
  useEffect(() => {
    console.log('🔄 ThemeProvider: Inicializando con API...');
    initializeThemes();
  }, []);

  const initializeThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar temas desde la API
      const apiThemes = await themeApiService.getAllThemes();
      console.log('📡 Temas obtenidos de la API:', apiThemes);

      // Convertir temas de la API al formato interno
      const convertedThemes = {};
      apiThemes.forEach(apiTheme => {
        const themeKey = `api_${apiTheme.id_visual_parameterization}`;
        convertedThemes[themeKey] = themeApiService.mapApiThemeToInternal(apiTheme);
      });

      console.log('🎨 Temas convertidos:', Object.keys(convertedThemes));

      // Si no hay temas en la API, usar el tema por defecto
      if (Object.keys(convertedThemes).length === 0) {
        console.log('⚠️ No hay temas en la API, usando tema por defecto');
        convertedThemes['default'] = DEFAULT_THEME;
      }

      setThemes(convertedThemes);

      // Obtener tema guardado del localStorage
      const savedTheme = localStorage.getItem('app-theme');
      console.log('💾 Tema guardado en localStorage:', savedTheme);

      // Establecer el tema actual
      if (savedTheme && convertedThemes[savedTheme]) {
        console.log('✅ Aplicando tema guardado:', savedTheme);
        setCurrentTheme(savedTheme);
      } else {
        // Usar el primer tema disponible
        const firstThemeKey = Object.keys(convertedThemes)[0];
        console.log('🔄 Usando primer tema disponible:', firstThemeKey);
        setCurrentTheme(firstThemeKey);
      }

    } catch (error) {
      console.error('❌ Error inicializando temas:', error);
      setError('Error cargando temas desde el servidor');
      
      // Usar tema por defecto en caso de error
      setThemes({ 'default': DEFAULT_THEME });
      setCurrentTheme('default');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para asegurar que un tema tenga la estructura completa
  const normalizeTheme = (theme) => {
    if (!theme) return DEFAULT_THEME;
    
    return {
      ...DEFAULT_THEME,
      ...theme,
      colors: {
        ...DEFAULT_THEME.colors,
        ...theme.colors
      },
      typography: {
        ...DEFAULT_THEME.typography,
        ...theme.typography,
        fontSize: {
          ...DEFAULT_THEME.typography.fontSize,
          ...theme.typography?.fontSize
        },
        fontWeight: {
          ...DEFAULT_THEME.typography.fontWeight,
          ...theme.typography?.fontWeight
        }
      },
      spacing: {
        ...DEFAULT_THEME.spacing,
        ...theme.spacing
      },
      borderRadius: {
        ...DEFAULT_THEME.borderRadius,
        ...theme.borderRadius
      }
    };
  };

  // Aplicar tema como CSS variables cada vez que cambie
  useEffect(() => {
    if (isLoading || !currentTheme) return;
    
    const theme = themes[currentTheme];
    if (theme) {
      const normalizedTheme = normalizeTheme(theme);
      applyThemeToDOM(normalizedTheme);
      // Guardar tema actual
      localStorage.setItem('app-theme', currentTheme);
    } else {
      console.warn('🚨 Tema no encontrado:', currentTheme);
    }
  }, [currentTheme, themes, isLoading]);

  // Función para aplicar tema al DOM
  const applyThemeToDOM = (theme) => {
    if (!theme) {
      console.warn('🚨 No se puede aplicar tema: tema es null o undefined');
      return;
    }

    const toKebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase();
    const root = document.documentElement;
    
    // Aplicar colores con validación
    if (theme.colors && typeof theme.colors === 'object') {
      console.log('🎨 Aplicando colores del tema:', theme.colors);
      
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          const kebabKey = toKebabCase(key);
          root.style.setProperty(`--color-${kebabKey}`, value);
        }
      });
      
      // Variables adicionales derivadas para mejor compatibilidad
      const cardColor = theme.colors.surface || theme.colors.background;
      const inputBgColor = theme.colors.background || theme.colors.surface;
      const modalBgColor = theme.colors.surface || theme.colors.background;
      
      root.style.setProperty('--color-card', cardColor);
      root.style.setProperty('--color-input-bg', inputBgColor);
      root.style.setProperty('--color-modal-bg', modalBgColor);
    }
    
    // Aplicar tipografía
    if (theme.typography && typeof theme.typography === 'object') {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      
      if (theme.typography.fontSize && typeof theme.typography.fontSize === 'object') {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          if (value) {
            const kebabKey = toKebabCase(key);
            root.style.setProperty(`--font-size-${kebabKey}`, value);
          }
        });
      }
      
      if (theme.typography.fontWeight && typeof theme.typography.fontWeight === 'object') {
        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
          if (value) {
            const kebabKey = toKebabCase(key);
            root.style.setProperty(`--font-weight-${kebabKey}`, value);
          }
        });
      }
    }
    
    // Aplicar espaciado
    if (theme.spacing && typeof theme.spacing === 'object') {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (value) {
          const kebabKey = toKebabCase(key);
          root.style.setProperty(`--spacing-${kebabKey}`, value);
        }
      });
    }
    
    // Aplicar border radius
    if (theme.borderRadius && typeof theme.borderRadius === 'object') {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        if (value) {
          const kebabKey = toKebabCase(key);
          root.style.setProperty(`--border-radius-${kebabKey}`, value);
        }
      });
    }

    console.log('🎨 Tema aplicado globalmente:', theme.name || 'Tema sin nombre');
  };

  // Cambiar tema
  const changeTheme = (themeKey) => {
    console.log('🔄 Cambiando tema a:', themeKey);
    setCurrentTheme(themeKey);
  };

  // Crear tema en la API
  const createCustomTheme = async (themeData, responsibleUser = 1) => {
    try {
      console.log('📤 Creando tema en API:', themeData);
      
      const apiThemeData = themeApiService.mapInternalThemeToApi(themeData, responsibleUser);
      const createdTheme = await themeApiService.createTheme(apiThemeData);
      
      console.log('✅ Tema creado en API:', createdTheme);
      
      // Actualizar la lista de temas local
      await reloadThemes();
      
      // Cambiar al nuevo tema
      const newThemeKey = `api_${createdTheme.id_visual_parameterization}`;
      setCurrentTheme(newThemeKey);
      
      return createdTheme;
    } catch (error) {
      console.error('❌ Error creando tema:', error);
      setError('Error creando el tema en el servidor');
      throw error;
    }
  };

  // Actualizar tema en la API
  const updateTheme = async (themeKey, themeData, responsibleUser = 1) => {
    try {
      // Extraer el ID del tema desde la clave
      const themeId = themeKey.replace('api_', '');
      
      console.log('📝 Actualizando tema en API:', themeId, themeData);
      
      const apiThemeData = themeApiService.mapInternalThemeToApi(themeData, responsibleUser);
      const updatedTheme = await themeApiService.updateTheme(themeId, apiThemeData);
      
      console.log('✅ Tema actualizado en API:', updatedTheme);
      
      // Actualizar la lista de temas local
      await reloadThemes();
      
      return updatedTheme;
    } catch (error) {
      console.error('❌ Error actualizando tema:', error);
      setError('Error actualizando el tema en el servidor');
      throw error;
    }
  };

  // Recargar temas desde la API
  const reloadThemes = async () => {
    try {
      const apiThemes = await themeApiService.getAllThemes();
      const convertedThemes = {};
      
      apiThemes.forEach(apiTheme => {
        const themeKey = `api_${apiTheme.id_visual_parameterization}`;
        convertedThemes[themeKey] = themeApiService.mapApiThemeToInternal(apiTheme);
      });
      
      setThemes(convertedThemes);
      console.log('🔄 Temas recargados desde API');
    } catch (error) {
      console.error('❌ Error recargando temas:', error);
      setError('Error recargando temas desde el servidor');
    }
  };

  // Obtener todos los temas
  const getAllThemes = () => {
    return themes;
  };

  // Obtener tema actual
  const getCurrentTheme = () => {
    if (!currentTheme || !themes[currentTheme]) {
      return normalizeTheme(DEFAULT_THEME);
    }
    return normalizeTheme(themes[currentTheme]);
  };

  // Obtener lista de nombres de temas
  const getThemeNames = () => {
    return Object.keys(themes);
  };

  // Funciones para compatibilidad con el código existente
  const loadThemesFromAPI = async () => {
    await reloadThemes();
    return themes;
  };

  const saveThemeToAPI = async (themeKey, themeData) => {
    try {
      await createCustomTheme(themeData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteThemeFromAPI = async (themeKey) => {
    // Nota: La API no parece tener endpoint de eliminación, 
    // solo cambio de status. Esto podría implementarse más tarde.
    console.log('⚠️ Eliminación de temas no implementada en la API');
    return false;
  };

  const value = {
    // Estado
    currentTheme,
    isLoading,
    error,
    
    // Datos
    getAllThemes,
    getCurrentTheme,
    getThemeNames,
    
    // Acciones
    changeTheme,
    createCustomTheme,
    updateTheme,
    reloadThemes,
    
    // Funciones de compatibilidad
    loadThemesFromAPI,
    saveThemeToAPI,
    deleteThemeFromAPI,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
        <div className="text-center">
          <div className="text-lg mb-2">🎨 Cargando temas desde el servidor...</div>
          <div className="text-sm text-gray-600">Conectando con la API</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
        <div className="text-center">
          <div className="text-lg mb-2 text-red-600">❌ Error cargando temas</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button 
            onClick={initializeThemes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;