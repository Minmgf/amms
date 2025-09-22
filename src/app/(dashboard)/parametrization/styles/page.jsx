"use client";
import React, { useState, useEffect } from 'react';
import { FiEdit3, FiBell, FiPlus, FiX, FiRefreshCw, FiSave } from 'react-icons/fi';
import NavigationMenu from '../../../components/parametrization/ParameterNavigation';
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
  const [activeMenuItem, setActiveMenuItem] = useState('Estilos');
  
  // Usar el contexto de tema global
  const {
    currentTheme,
    getAllThemes,
    getCurrentTheme,
    getThemeNames,
    changeTheme,
    createCustomTheme,
    updateTheme,
    reloadThemes,
    isLoading,
    error
  } = useTheme();
  
  // Estados locales para la edición
  const [tempStyleParams, setTempStyleParams] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
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
        surfaceColor: theme.colors.surface,
        primaryButton: theme.colors.primary,
        secondaryButton: theme.colors.secondary,
        accentColor: theme.colors.accent,
        borderColor: theme.colors.border,
        hoverColor: theme.colors.hover,
        errorColor: theme.colors.error,
        successColor: theme.colors.success,
        warningColor: theme.colors.warning,
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      console.log('💾 Guardando cambios del tema:', currentTheme, tempStyleParams);
      
      // Convertir parámetros temporales al formato del tema
      const themeData = {
        name: getAllThemes()[currentTheme]?.name || 'Tema Actualizado',
        description: getAllThemes()[currentTheme]?.description || 'Tema personalizado actualizado',
        colors: {
          ...getCurrentTheme().colors,
          text: tempStyleParams.textColor,
          textSecondary: tempStyleParams.paragraphTextColor,
          background: tempStyleParams.backgroundColor,
          surface: tempStyleParams.surfaceColor,
          primary: tempStyleParams.primaryButton,
          secondary: tempStyleParams.secondaryButton,
          accent: tempStyleParams.accentColor,
          border: tempStyleParams.borderColor,
          hover: tempStyleParams.hoverColor,
          error: tempStyleParams.errorColor,
          success: tempStyleParams.successColor,
          warning: tempStyleParams.warningColor,
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

      
      // Si es un tema de la API (empieza con 'api_'), actualizarlo
      if (currentTheme && currentTheme.startsWith('api_')) {
        await updateTheme(currentTheme, themeData, 1); // responsibleUser = 1
        setSaveMessage('✅ Tema actualizado exitosamente en el servidor');
      } else {
        // Crear un nuevo tema en la API
        await createCustomTheme(themeData, 1);
        setSaveMessage('✅ Nuevo tema creado y guardado en el servidor');
      }
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error guardando tema:', error);
      setSaveMessage('❌ Error guardando el tema en el servidor');
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = async (themeName) => {
    console.log('🔄 Cambiando tema global a:', themeName);
    changeTheme(themeName);
  };

  const handleRefreshThemes = async () => {
    try {
      console.log('🔄 Recargando temas desde la API...');
      await reloadThemes();
      setSaveMessage('✅ Temas recargados desde el servidor');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error recargando temas:', error);
      setSaveMessage('❌ Error recargando temas desde el servidor');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    }
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

  const handleSaveNewTheme = async (newTheme) => {
    try {
      console.log('🎨 Creando nuevo tema en API:', newTheme);
      
      const themeData = {
        name: newTheme.name,
        description: newTheme.description || `Tema personalizado: ${newTheme.name}`,
        colors: {
          primary: newTheme.primaryColor || '#000000',
          secondary: newTheme.secondaryColor || '#1f2937',
          accent: newTheme.accentColor || '#3b82f6',
          background: newTheme.backgroundColor || '#ffffff',
          surface: newTheme.surfaceColor || '#f8fafc',
          text: newTheme.textColor || '#1e293b',
          textSecondary: newTheme.textSecondaryColor || '#64748b',
          border: newTheme.borderColor || '#e2e8f0',
          hover: newTheme.hoverColor || '#f1f5f9',
          error: '#dc2626',
          success: '#059669',
          warning: '#d97706',
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
        }
      };
      
      await createCustomTheme(themeData, 1); // responsibleUser = 1
      setSaveMessage(`✅ Tema "${newTheme.name}" creado exitosamente`);
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error creando tema:', error);
      setSaveMessage('❌ Error creando el tema en el servidor');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    }
  };

  const fontSizeOptions = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem'];
  const fontTypeOptions = [
    'Inter, system-ui, sans-serif', 
    'Poppins, system-ui, sans-serif',
    'Roboto, system-ui, sans-serif',
    'Arial, sans-serif', 
    'Helvetica, sans-serif', 
    'Georgia, serif', 
    'Times New Roman, serif',
    'Verdana, sans-serif'
  ];

  // Mostrar loading si está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">🎨 Cargando sistema de temas...</div>
          <div className="text-sm text-gray-600">Conectando con el servidor</div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2 text-red-600">❌ Error cargando temas</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button 
            onClick={handleRefreshThemes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-primary p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Parametrización</h1>
            <div className="text-sm bg-surface p-2 rounded-theme-md border border-primary">
              <span className="text-secondary">Tema actual: </span>
              <span className="font-semibold text-accent">{getAllThemes()[currentTheme]?.name || 'Cargando...'}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="mb-6 md:mb-8">
            <NavigationMenu
              activeItem={activeMenuItem}
              onItemClick={handleMenuItemChange}
            />
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              saveMessage.includes('❌') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="card-theme">
              {/* Theme Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-primary">Tema Global (API)</span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={currentTheme || ''}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="input-theme"
                      disabled={isLoading}
                    >
                      <option value="">Seleccionar tema...</option>
                      {getThemeNames().map(themeKey => (
                        <option key={themeKey} value={themeKey}>
                          {getAllThemes()[themeKey]?.name || themeKey}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleOpenNewThemeModal}
                      className="btn-theme btn-primary"
                      title="Crear nuevo tema"
                      disabled={isLoading}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleRefreshThemes}
                      className="btn-theme btn-secondary"
                      title="Recargar temas desde el servidor"
                      disabled={isLoading}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-secondary bg-surface p-2 rounded-theme-sm border border-primary">
                  💡 Conectado con la API - Los cambios se sincronizan automáticamente
                </div>
              </div>

              {/* Color Parameters */}
              <div className="mb-8">
                <div className="border-b border-primary pb-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Colores</span>
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
                    label="Color de Superficie"
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
                  <ColorPicker
                    label="Color de Acento"
                    color={tempStyleParams.accentColor}
                    onChange={(color) => handleStyleChange('accentColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Color de Bordes"
                    color={tempStyleParams.borderColor}
                    onChange={(color) => handleStyleChange('borderColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Color de Hover"
                    color={tempStyleParams.hoverColor}
                    onChange={(color) => handleStyleChange('hoverColor', color)}
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
                disabled={isSaving || isLoading}
                className="btn-theme btn-primary w-full py-3 font-medium flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Guardar en API</span>
                  </>
                )}
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
                          Dashboard API
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
                          <div className="w-full h-1 rounded" style={{ backgroundColor: tempStyleParams.borderColor }}></div>
                          <div className="w-3/4 h-1 rounded" style={{ backgroundColor: tempStyleParams.borderColor }}></div>
                          <div className="w-full h-1 rounded" style={{ backgroundColor: tempStyleParams.borderColor }}></div>
                          <div className="w-2/3 h-1 rounded" style={{ backgroundColor: tempStyleParams.borderColor }}></div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="flex-1 ml-3">
                          {/* Chart Area */}
                          <div className="h-16 rounded mb-2 relative overflow-hidden" style={{ backgroundColor: tempStyleParams.surfaceColor }}>
                            <div className="absolute bottom-0 left-2 w-1 h-8" style={{ backgroundColor: tempStyleParams.primaryButton }}></div>
                            <div className="absolute bottom-0 left-4 w-1 h-12" style={{ backgroundColor: tempStyleParams.primaryButton }}></div>
                            <div className="absolute bottom-0 left-6 w-1 h-6" style={{ backgroundColor: tempStyleParams.primaryButton }}></div>
                            <div className="absolute bottom-0 left-8 w-1 h-10" style={{ backgroundColor: tempStyleParams.primaryButton }}></div>
                            <div className="absolute bottom-0 left-10 w-1 h-14" style={{ backgroundColor: tempStyleParams.primaryButton }}></div>
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
                                API Card
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
                                Live Preview
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
                    🌐 Preview en tiempo real - Conectado con API
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
        currentColor={currentColorPicker.color}
        label={currentColorPicker.label}
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