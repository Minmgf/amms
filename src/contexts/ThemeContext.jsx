"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Temas predefinidos
const PREDEFINED_THEMES = {
  oscuro: {
    name: 'Oscuro',
    colors: {
      primary: '#000000',
      secondary: '#1f2937',
      accent: '#3b82f6',
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      textSecondary: '#d1d5db',
      border: '#374151',
      hover: '#374151',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
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
  },
  claro: {
    name: 'Claro',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      hover: '#f3f4f6',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
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
  },
  personalizado: {
    name: 'Personalizado',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      hover: '#475569',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
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
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    }
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
  const [currentTheme, setCurrentTheme] = useState('oscuro');
  const [customThemes, setCustomThemes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    console.log('🔄 ThemeProvider: Inicializando...');
    
    const savedTheme = localStorage.getItem('app-theme');
    const savedCustomThemes = localStorage.getItem('app-custom-themes');
    
    console.log('💾 Tema guardado:', savedTheme);
    console.log('💾 Temas personalizados:', savedCustomThemes);
    
    if (savedTheme && PREDEFINED_THEMES[savedTheme]) {
      console.log('✅ Aplicando tema guardado:', savedTheme);
      setCurrentTheme(savedTheme);
    } else if (savedTheme) {
      console.log('⚠️ Tema guardado no válido, usando oscuro por defecto');
      setCurrentTheme('oscuro');
    }
    
    if (savedCustomThemes) {
      try {
        const parsedCustomThemes = JSON.parse(savedCustomThemes);
        console.log('✅ Temas personalizados cargados:', Object.keys(parsedCustomThemes));
        setCustomThemes(parsedCustomThemes);
      } catch (error) {
        console.error('❌ Error parsing saved custom themes:', error);
      }
    }
    
    setIsLoading(false);
    console.log('✅ ThemeProvider: Inicialización completada');
  }, []);

  // Función para asegurar que un tema tenga la estructura completa
  const normalizeTheme = (theme) => {
    if (!theme) return PREDEFINED_THEMES.oscuro;
    
    return {
      name: theme.name || 'Tema sin nombre',
      colors: {
        primary: '#000000',
        secondary: '#1f2937',
        accent: '#3b82f6',
        background: '#111827',
        surface: '#1f2937',
        text: '#ffffff',
        textSecondary: '#d1d5db',
        border: '#374151',
        hover: '#374151',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        ...theme.colors
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
          ...theme.typography?.fontSize
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          ...theme.typography?.fontWeight
        },
        ...theme.typography
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        ...theme.spacing
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        ...theme.borderRadius
      }
    };
  };

  // Aplicar tema como CSS variables cada vez que cambie
  useEffect(() => {
    if (isLoading) return;
    
    const rawTheme = getAllThemes()[currentTheme];
    if (rawTheme) {
      const normalizedTheme = normalizeTheme(rawTheme);
      applyThemeToDOM(normalizedTheme);
      // Guardar tema actual
      localStorage.setItem('app-theme', currentTheme);
    } else {
      console.warn('🚨 Tema no encontrado:', currentTheme, 'Aplicando tema por defecto');
      const defaultTheme = normalizeTheme(PREDEFINED_THEMES.oscuro);
      applyThemeToDOM(defaultTheme);
      setCurrentTheme('oscuro');
    }
  }, [currentTheme, customThemes, isLoading]);

  // Función para aplicar tema al DOM
  const applyThemeToDOM = (theme) => {
    if (!theme) {
      console.warn('🚨 No se puede aplicar tema: tema es null o undefined');
      return;
    }

    const root = document.documentElement;
    
    // Aplicar colores con validación
    if (theme.colors && typeof theme.colors === 'object') {
      console.log('🎨 Aplicando colores del tema:', theme.colors);
      
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--color-${key}`, value);
          console.log(`   --color-${key}: ${value}`);
        }
      });
      
      // Variables adicionales derivadas para mejor compatibilidad
      const cardColor = theme.colors.surface || theme.colors.background;
      const inputBgColor = theme.colors.background || theme.colors.surface;
      const modalBgColor = theme.colors.surface || theme.colors.background;
      
      root.style.setProperty('--color-card', cardColor);
      root.style.setProperty('--color-input-bg', inputBgColor);
      root.style.setProperty('--color-modal-bg', modalBgColor);
      
      console.log('🎨 Variables derivadas aplicadas:');
      console.log(`   --color-card: ${cardColor}`);
      console.log(`   --color-input-bg: ${inputBgColor}`);
      console.log(`   --color-modal-bg: ${modalBgColor}`);
    } else {
      console.warn('🚨 theme.colors no está definido o no es un objeto');
    }
    
    // Aplicar tipografía con validación
    if (theme.typography && typeof theme.typography === 'object') {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      
      if (theme.typography.fontSize && typeof theme.typography.fontSize === 'object') {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(`--font-size-${key}`, value);
          }
        });
      }
      
      if (theme.typography.fontWeight && typeof theme.typography.fontWeight === 'object') {
        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(`--font-weight-${key}`, value);
          }
        });
      }
    } else {
      console.warn('🚨 theme.typography no está definido o no es un objeto');
    }
    
    // Aplicar espaciado con validación
    if (theme.spacing && typeof theme.spacing === 'object') {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--spacing-${key}`, value);
        }
      });
    } else {
      console.warn('🚨 theme.spacing no está definido o no es un objeto');
    }
    
    // Aplicar border radius con validación
    if (theme.borderRadius && typeof theme.borderRadius === 'object') {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--border-radius-${key}`, value);
        }
      });
    } else {
      console.warn('🚨 theme.borderRadius no está definido o no es un objeto');
    }

    console.log('🎨 Tema aplicado globalmente:', theme.name || 'Tema sin nombre');
  };

  // Obtener todos los temas (predefinidos + personalizados)
  const getAllThemes = () => {
    return { ...PREDEFINED_THEMES, ...customThemes };
  };

  // Cambiar tema
  const changeTheme = (themeKey) => {
    console.log('🔄 Cambiando tema a:', themeKey);
    setCurrentTheme(themeKey);
  };

  // Crear tema personalizado
  const createCustomTheme = (themeKey, themeData) => {
    console.log('🎨 Creando tema personalizado:', themeKey, themeData);
    
    const newCustomThemes = {
      ...customThemes,
      [themeKey]: {
        name: themeData.name,
        ...themeData
      }
    };
    
    setCustomThemes(newCustomThemes);
    localStorage.setItem('app-custom-themes', JSON.stringify(newCustomThemes));
    
    // Cambiar al nuevo tema
    setCurrentTheme(themeKey);
  };

  // Actualizar tema existente
  const updateTheme = (themeKey, themeData) => {
    if (PREDEFINED_THEMES[themeKey]) {
      console.warn('No se puede modificar un tema predefinido');
      return;
    }
    
    console.log('✏️ Actualizando tema:', themeKey);
    
    const updatedCustomThemes = {
      ...customThemes,
      [themeKey]: {
        ...customThemes[themeKey],
        ...themeData
      }
    };
    
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('app-custom-themes', JSON.stringify(updatedCustomThemes));
  };

  // Eliminar tema personalizado
  const deleteCustomTheme = (themeKey) => {
    if (PREDEFINED_THEMES[themeKey]) {
      console.warn('No se puede eliminar un tema predefinido');
      return;
    }
    
    console.log('🗑️ Eliminando tema:', themeKey);
    
    const updatedCustomThemes = { ...customThemes };
    delete updatedCustomThemes[themeKey];
    
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('app-custom-themes', JSON.stringify(updatedCustomThemes));
    
    // Si el tema actual es el que se está eliminando, cambiar al tema por defecto
    if (currentTheme === themeKey) {
      setCurrentTheme('oscuro');
    }
  };

  // Obtener tema actual
  const getCurrentTheme = () => {
    const rawTheme = getAllThemes()[currentTheme];
    return normalizeTheme(rawTheme);
  };

  // Obtener lista de nombres de temas
  const getThemeNames = () => {
    return Object.keys(getAllThemes());
  };

  const value = {
    // Estado
    currentTheme,
    isLoading,
    
    // Datos
    getAllThemes,
    getCurrentTheme,
    getThemeNames,
    
    // Acciones
    changeTheme,
    createCustomTheme,
    updateTheme,
    deleteCustomTheme,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-lg mb-2">🎨 Inicializando sistema de temas...</div>
          <div className="text-sm text-gray-400">Cargando configuración</div>
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
