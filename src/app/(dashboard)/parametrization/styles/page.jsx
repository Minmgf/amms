"use client";
import React, { useState, useEffect } from 'react';
import { FiEdit3, FiBell, FiPlus, FiX } from 'react-icons/fi';
import NavigationMenu from '../../../components/ParameterNavigation';
import ColorPickerModal from '../../../components/parametrization/ColorPickerModal';
import NewThemeModal from '../../../components/parametrization/NewThemeModal';
import { useTheme } from '@/contexts/ThemeContext';

// Enhanced Color Picker Component with Modal
const ColorPicker = ({ color, onChange, label, onOpenColorPicker }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center space-x-2">
      <div 
        className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
        style={{ backgroundColor: color }}
        onClick={() => onOpenColorPicker(label, color, onChange)}
      />
    </div>
  </div>
);

// Select Component
const SelectField = ({ value, onChange, options, label }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// Main Component
const StylesParameterizationView = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Styles');
  
  // Usar el contexto de tema global
  const {
    currentTheme,
    getAllThemes,
    getCurrentTheme,
    getThemeNames,
    changeTheme,
    createCustomTheme,
    updateTheme,
    deleteCustomTheme
  } = useTheme();
  
  // Estados locales para la edición
  const [editingTheme, setEditingTheme] = useState(null);
  const [tempStyleParams, setTempStyleParams] = useState({});
  
  // Modal states
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isNewThemeModalOpen, setIsNewThemeModalOpen] = useState(false);
  const [currentColorPicker, setCurrentColorPicker] = useState({
    label: '',
    color: '',
    onChange: null
  });

  // Inicializar parámetros temporales cuando cambie el tema
  useEffect(() => {
    const theme = getCurrentTheme();
    if (theme) {
      setTempStyleParams({
        textColor: theme.colors.text,
        paragraphTextColor: theme.colors.textSecondary,
        backgroundColor: theme.colors.background,
        surfaceColor: theme.colors.surface, // ← Agregar color de superficie
        primaryButton: theme.colors.accent,
        secondaryButton: theme.colors.secondary,
        titlesTextSize: theme.typography.fontSize.xl,
        paragraphTextSize: theme.typography.fontSize.base,
        fontType: theme.typography.fontFamily
      });
    }
  }, [currentTheme, getCurrentTheme]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  const handleStyleChange = (param, value) => {
    setTempStyleParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log('🎨 Guardando cambios del tema:', currentTheme, tempStyleParams);
    
    // Convertir parámetros temporales al formato del tema
    const themeData = {
      colors: {
        ...getCurrentTheme().colors,
        text: tempStyleParams.textColor,
        textSecondary: tempStyleParams.paragraphTextColor,
        background: tempStyleParams.backgroundColor,
        surface: tempStyleParams.surfaceColor, // ← Incluir color de superficie
        accent: tempStyleParams.primaryButton,
        secondary: tempStyleParams.secondaryButton,
      },
      typography: {
        ...getCurrentTheme().typography,
        fontFamily: tempStyleParams.fontType,
        fontSize: {
          ...getCurrentTheme().typography.fontSize,
          xl: tempStyleParams.titlesTextSize,
          base: tempStyleParams.paragraphTextSize,
        }
      }
    };
    
    // Si es un tema personalizado, actualizarlo. Si no, crear uno nuevo
    const allThemes = getAllThemes();
    const isCustomTheme = !['oscuro', 'claro', 'personalizado'].includes(currentTheme);
    
    if (isCustomTheme) {
      updateTheme(currentTheme, themeData);
      alert('¡Tema actualizado exitosamente! Los cambios se han aplicado globalmente.');
    } else {
      // Crear un nuevo tema personalizado basado en el actual
      const newThemeName = `${allThemes[currentTheme].name}_personalizado_${Date.now()}`;
      const newThemeKey = newThemeName.toLowerCase().replace(/\s+/g, '_');
      
      createCustomTheme(newThemeKey, {
        name: newThemeName,
        ...themeData
      });
      
      alert(`¡Nuevo tema "${newThemeName}" creado y aplicado! Los cambios se reflejan en toda la aplicación.`);
    }
  };

  const handleThemeChange = (themeName) => {
    console.log('🔄 Cambiando tema global a:', themeName);
    changeTheme(themeName);
  };

  // Color picker modal handlers
  const handleOpenColorPicker = (label, color, onChange) => {
    setCurrentColorPicker({ label, color, onChange });
    setIsColorPickerOpen(true);
  };

  const handleCloseColorPicker = () => {
    setIsColorPickerOpen(false);
    setCurrentColorPicker({ label: '', color: '', onChange: null });
  };

  const handleColorSelect = (color) => {
    if (currentColorPicker.onChange) {
      currentColorPicker.onChange(color);
    }
    handleCloseColorPicker();
  };

  // New theme modal handlers
  const handleOpenNewThemeModal = () => {
    setIsNewThemeModalOpen(true);
  };

  const handleCloseNewThemeModal = () => {
    setIsNewThemeModalOpen(false);
  };

  const handleSaveNewTheme = (newTheme) => {
    console.log('🎨 Creando nuevo tema global:', newTheme);
    
    const themeKey = newTheme.name.toLowerCase().replace(/\s+/g, '_');
    
    // Convertir datos del modal al formato del sistema de temas
    const themeData = {
      colors: {
        primary: newTheme.primaryColor || '#000000',
        secondary: newTheme.secondaryColor || '#1f2937',
        accent: newTheme.accentColor || '#3b82f6',
        background: newTheme.backgroundColor || '#111827',
        surface: newTheme.surfaceColor || '#1f2937',
        text: newTheme.textColor || '#ffffff',
        textSecondary: newTheme.textSecondaryColor || '#d1d5db',
        border: newTheme.borderColor || '#374151',
        hover: newTheme.hoverColor || '#374151',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      typography: {
        fontFamily: newTheme.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: newTheme.baseFontSize || '1rem',
          lg: '1.125rem',
          xl: newTheme.titleFontSize || '1.25rem',
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
    
    createCustomTheme(themeKey, {
      name: newTheme.name,
      ...themeData
    });
    
    alert(`¡Tema "${newTheme.name}" creado y aplicado globalmente!`);
  };

  // Delete theme handler
  const handleDeleteTheme = () => {
    const themeNames = getThemeNames();
    
    if (themeNames.length <= 1) {
      alert('No se puede eliminar el último tema');
      return;
    }
    
    // No permitir eliminar temas predefinidos
    if (['oscuro', 'claro', 'personalizado'].includes(currentTheme)) {
      alert('No se pueden eliminar los temas predefinidos');
      return;
    }
    
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el tema "${getAllThemes()[currentTheme].name}"?`);
    if (confirmed) {
      deleteCustomTheme(currentTheme);
      alert(`Tema eliminado exitosamente!`);
    }
  };

  const fontSizeOptions = ['10px', '12px', '14px', '16px', '18px', '20px'];
  const fontTypeOptions = ['Inter, system-ui, sans-serif', 'Times New Roman', 'Arial', 'Helvetica', 'Georgia', 'Verdana', 'Poppins'];

  return (
    <>
      <div className="min-h-screen bg-background text-primary p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Parameterization</h1>
            <div className="text-sm bg-surface p-2 rounded-theme-md border border-primary">
              <span className="text-secondary">Tema actual: </span>
              <span className="font-semibold text-accent">{getAllThemes()[currentTheme]?.name}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="mb-6 md:mb-8">
            <NavigationMenu
              activeItem={activeMenuItem}
              onItemClick={handleMenuItemChange}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="card-theme">
              {/* Theme Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-primary">Tema Global</span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={currentTheme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="input-theme"
                    >
                      {getThemeNames().map(themeKey => (
                        <option key={themeKey} value={themeKey}>
                          {getAllThemes()[themeKey].name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleOpenNewThemeModal}
                      className="btn-theme btn-primary"
                      title="Crear nuevo tema"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDeleteTheme}
                      className="btn-theme btn-secondary"
                      title="Eliminar tema actual"
                      disabled={['oscuro', 'claro', 'personalizado'].includes(currentTheme)}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-secondary bg-surface p-2 rounded-theme-sm border border-primary">
                  💡 Los cambios se aplicarán a toda la aplicación globalmente
                </div>
              </div>

              {/* Color Parameters */}
              <div className="mb-8">
                <div className="border-b border-primary pb-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Parámetro</span>
                    <span className="text-sm font-semibold text-primary">Valor</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <ColorPicker
                    label="Color de Texto"
                    color={tempStyleParams.textColor}
                    onChange={(color) => handleStyleChange('textColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Color de Párrafos"
                    color={tempStyleParams.paragraphTextColor}
                    onChange={(color) => handleStyleChange('paragraphTextColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Color de Fondo"
                    color={tempStyleParams.backgroundColor}
                    onChange={(color) => handleStyleChange('backgroundColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Color de Superficie (Cards)"
                    color={tempStyleParams.surfaceColor}
                    onChange={(color) => handleStyleChange('surfaceColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Botón Primario"
                    color={tempStyleParams.primaryButton}
                    onChange={(color) => handleStyleChange('primaryButton', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Botón Secundario"
                    color={tempStyleParams.secondaryButton}
                    onChange={(color) => handleStyleChange('secondaryButton', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                </div>
              </div>

              {/* Typography Parameters */}
              <div className="mb-8">
                <div className="border-b border-primary pb-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Tipografía</span>
                    <span className="text-sm font-semibold text-primary">Valor</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <SelectField
                    label="Tamaño de Títulos"
                    value={tempStyleParams.titlesTextSize}
                    onChange={(value) => handleStyleChange('titlesTextSize', value)}
                    options={fontSizeOptions}
                  />
                  <SelectField
                    label="Tamaño de Párrafos"
                    value={tempStyleParams.paragraphTextSize}
                    onChange={(value) => handleStyleChange('paragraphTextSize', value)}
                    options={fontSizeOptions}
                  />
                  <SelectField
                    label="Tipo de Fuente"
                    value={tempStyleParams.fontType}
                    onChange={(value) => handleStyleChange('fontType', value)}
                    options={fontTypeOptions}
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveChanges}
                className="btn-theme btn-primary w-full py-3 font-medium"
              >
                💾 Aplicar Cambios Globalmente
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="card-theme flex items-center justify-center">
              <div className="relative">
                {/* Monitor Frame */}
                <div className="w-80 h-52 bg-gray-300 rounded-t-lg relative">
                  {/* Screen */}
                  <div 
                    className="w-full h-full rounded-t-lg overflow-hidden relative"
                    style={{ backgroundColor: tempStyleParams.backgroundColor }}
                  >
                    {/* Mock Dashboard Content */}
                    <div className="p-4 text-xs">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <h1 
                          className="font-bold"
                          style={{ 
                            color: tempStyleParams.textColor,
                            fontSize: tempStyleParams.titlesTextSize,
                            fontFamily: tempStyleParams.fontType
                          }}
                        >
                          Dashboard Global
                        </h1>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Sidebar */}
                      <div className="flex">
                        <div className="w-16 space-y-1">
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-3/4 h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-2/3 h-1 bg-gray-600 rounded"></div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="flex-1 ml-3">
                          {/* Chart Area */}
                          <div className="h-16 bg-gray-800 rounded mb-2 relative overflow-hidden">
                            <div className="absolute bottom-0 left-2 w-1 bg-blue-400 h-8"></div>
                            <div className="absolute bottom-0 left-4 w-1 bg-blue-400 h-12"></div>
                            <div className="absolute bottom-0 left-6 w-1 bg-blue-400 h-6"></div>
                            <div className="absolute bottom-0 left-8 w-1 bg-blue-400 h-10"></div>
                            <div className="absolute bottom-0 left-10 w-1 bg-blue-400 h-14"></div>
                          </div>
                          
                          {/* Stats Cards */}
                          <div className="grid grid-cols-2 gap-1 mb-2">
                            <div 
                              className="rounded p-1"
                              style={{ backgroundColor: tempStyleParams.surfaceColor }}
                            >
                              <div 
                                className="text-xs"
                                style={{ 
                                  color: tempStyleParams.paragraphTextColor,
                                  fontSize: tempStyleParams.paragraphTextSize,
                                  fontFamily: tempStyleParams.fontType
                                }}
                              >
                                Card Surface
                              </div>
                            </div>
                            <div 
                              className="rounded p-1"
                              style={{ backgroundColor: tempStyleParams.surfaceColor }}
                            >
                              <div 
                                className="text-xs"
                                style={{ 
                                  color: tempStyleParams.paragraphTextColor,
                                  fontSize: tempStyleParams.paragraphTextSize,
                                  fontFamily: tempStyleParams.fontType
                                }}
                              >
                                Tema Global
                              </div>
                            </div>
                          </div>
                          
                          {/* Buttons */}
                          <div className="flex space-x-1">
                            <button 
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: tempStyleParams.primaryButton }}
                            >
                              Primario
                            </button>
                            <button 
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: tempStyleParams.secondaryButton }}
                            >
                              Secundario
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Monitor Stand */}
                <div className="w-20 h-4 bg-gray-400 mx-auto"></div>
                <div className="w-32 h-2 bg-gray-400 mx-auto rounded-b-lg"></div>
                
                {/* Info Text */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-secondary">
                    🌍 Preview: Los cambios se aplicarán globalmente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={handleCloseColorPicker}
        onColorSelect={handleColorSelect}
        title={currentColorPicker.label || "Colors"}
      />

      {/* New Theme Modal */}
      <NewThemeModal
        isOpen={isNewThemeModalOpen}
        onClose={handleCloseNewThemeModal}
        onSave={handleSaveNewTheme}
      />
    </>
  );
};

export default StylesParameterizationView;