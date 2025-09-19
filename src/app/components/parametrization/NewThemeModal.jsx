import React, { useState } from 'react';
import ColorPickerModal from './ColorPickerModal';

const NewThemeModal = ({ isOpen, onClose, onSave }) => {
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [themeParams, setThemeParams] = useState({
    // Nombres que coinciden con lo que espera handleSaveNewTheme
    primaryColor: '#1E40AF',
    secondaryColor: '#64748B', 
    accentColor: '#3B82F6',
    backgroundColor: '#ffffff',
    surfaceColor: '#F8FAFC',
    textColor: '#1E293B',
    textSecondaryColor: '#64748B',
    borderColor: '#E2E8F0',
    hoverColor: '#F1F5F9',
    // Colores adicionales que maneja la API
    errorColor: '#DC2626',
    successColor: '#059669',
    warningColor: '#D97706',
    // Tipografía
    fontFamily: 'Inter, system-ui, sans-serif',
    titleFontSize: '1.25rem', // xl
    baseFontSize: '1rem' // base
  });

  // State for color picker modal
  const [colorPickerState, setColorPickerState] = useState({
    isOpen: false,
    currentParam: null,
    currentColor: '#000000',
    label: ''
  });

  // Color picker button component
  const ColorPickerButton = ({ color, onColorClick, label }) => {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
            style={{ backgroundColor: color }}
            onClick={onColorClick}
            title="Click to choose color"
          />
          <span className="text-xs text-gray-500 font-mono min-w-[70px]">
            {color.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const SelectField = ({ value, onChange, options, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const handleParamChange = (param, value) => {
    setThemeParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const openColorPicker = (param, currentColor, label) => {
    setColorPickerState({
      isOpen: true,
      currentParam: param,
      currentColor: currentColor,
      label: `Choose ${label}`
    });
  };

  const handleColorSelect = (selectedColor) => {
    if (colorPickerState.currentParam) {
      handleParamChange(colorPickerState.currentParam, selectedColor);
    }
    setColorPickerState(prev => ({ ...prev, isOpen: false, currentParam: null }));
  };

  const closeColorPicker = () => {
    setColorPickerState(prev => ({ ...prev, isOpen: false, currentParam: null }));
  };

  const handleSave = () => {
    if (!themeName.trim()) {
      alert('Please enter a theme name');
      return;
    }
    
    // Estructura que coincide con lo que espera handleSaveNewTheme
    const newTheme = {
      name: themeName,
      description: themeDescription || `Custom theme: ${themeName}`,
      // Colores con nombres correctos
      primaryColor: themeParams.primaryColor,
      secondaryColor: themeParams.secondaryColor,
      accentColor: themeParams.accentColor,
      backgroundColor: themeParams.backgroundColor,
      surfaceColor: themeParams.surfaceColor,
      textColor: themeParams.textColor,
      textSecondaryColor: themeParams.textSecondaryColor,
      borderColor: themeParams.borderColor,
      hoverColor: themeParams.hoverColor,
      errorColor: themeParams.errorColor,
      successColor: themeParams.successColor,
      warningColor: themeParams.warningColor,
      // Tipografía
      fontFamily: themeParams.fontFamily,
      titleFontSize: themeParams.titleFontSize,
      baseFontSize: themeParams.baseFontSize
    };
    
    onSave(newTheme);
    
    // Reset form
    setThemeName('');
    setThemeDescription('');
    setThemeParams({
      primaryColor: '#1E40AF',
      secondaryColor: '#64748B', 
      accentColor: '#3B82F6',
      backgroundColor: '#ffffff',
      surfaceColor: '#F8FAFC',
      textColor: '#1E293B',
      textSecondaryColor: '#64748B',
      borderColor: '#E2E8F0',
      hoverColor: '#F1F5F9',
      errorColor: '#DC2626',
      successColor: '#059669',
      warningColor: '#D97706',
      fontFamily: 'Inter, system-ui, sans-serif',
      titleFontSize: '1.25rem',
      baseFontSize: '1rem'
    });
    
    onClose();
  };

  // Opciones actualizadas para coincidir con el sistema
  const fontSizeOptions = [
    { value: '0.75rem', label: 'XS (12px)' },
    { value: '0.875rem', label: 'SM (14px)' },
    { value: '1rem', label: 'Base (16px)' },
    { value: '1.125rem', label: 'LG (18px)' },
    { value: '1.25rem', label: 'XL (20px)' },
    { value: '1.5rem', label: '2XL (24px)' }
  ];

  const fontTypeOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
    { value: 'Roboto, system-ui, sans-serif', label: 'Roboto' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Verdana, sans-serif', label: 'Verdana' }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-900">Create New Theme</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Theme Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Name *
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="Enter theme name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  cols={30}
                  rows={4}
                  maxLength={200} // Límite de 200 caracteres
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  placeholder="Brief description of your theme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Main Colors */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Main Colors</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <ColorPickerButton
                  label="Primary Color"
                  color={themeParams.primaryColor}
                  onColorClick={() => openColorPicker('primaryColor', themeParams.primaryColor, 'Primary Color')}
                />
                <ColorPickerButton
                  label="Secondary Color"
                  color={themeParams.secondaryColor}
                  onColorClick={() => openColorPicker('secondaryColor', themeParams.secondaryColor, 'Secondary Color')}
                />
                <ColorPickerButton
                  label="Accent Color"
                  color={themeParams.accentColor}
                  onColorClick={() => openColorPicker('accentColor', themeParams.accentColor, 'Accent Color')}
                />
                <ColorPickerButton
                  label="Background Color"
                  color={themeParams.backgroundColor}
                  onColorClick={() => openColorPicker('backgroundColor', themeParams.backgroundColor, 'Background Color')}
                />
                <ColorPickerButton
                  label="Surface Color"
                  color={themeParams.surfaceColor}
                  onColorClick={() => openColorPicker('surfaceColor', themeParams.surfaceColor, 'Surface Color')}
                />
              </div>
            </div>

            {/* Text Colors */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Text Colors</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <ColorPickerButton
                  label="Text Color"
                  color={themeParams.textColor}
                  onColorClick={() => openColorPicker('textColor', themeParams.textColor, 'Text Color')}
                />
                <ColorPickerButton
                  label="Secondary Text Color"
                  color={themeParams.textSecondaryColor}
                  onColorClick={() => openColorPicker('textSecondaryColor', themeParams.textSecondaryColor, 'Secondary Text Color')}
                />
              </div>
            </div>

            {/* UI Colors */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">UI Colors</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <ColorPickerButton
                  label="Border Color"
                  color={themeParams.borderColor}
                  onColorClick={() => openColorPicker('borderColor', themeParams.borderColor, 'Border Color')}
                />
                <ColorPickerButton
                  label="Hover Color"
                  color={themeParams.hoverColor}
                  onColorClick={() => openColorPicker('hoverColor', themeParams.hoverColor, 'Hover Color')}
                />
                <ColorPickerButton
                  label="Error Color"
                  color={themeParams.errorColor}
                  onColorClick={() => openColorPicker('errorColor', themeParams.errorColor, 'Error Color')}
                />
                <ColorPickerButton
                  label="Success Color"
                  color={themeParams.successColor}
                  onColorClick={() => openColorPicker('successColor', themeParams.successColor, 'Success Color')}
                />
                <ColorPickerButton
                  label="Warning Color"
                  color={themeParams.warningColor}
                  onColorClick={() => openColorPicker('warningColor', themeParams.warningColor, 'Warning Color')}
                />
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Typography</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <SelectField
                  label="Font Family"
                  value={themeParams.fontFamily}
                  onChange={(value) => handleParamChange('fontFamily', value)}
                  options={fontTypeOptions}
                />
                <SelectField
                  label="Title Font Size"
                  value={themeParams.titleFontSize}
                  onChange={(value) => handleParamChange('titleFontSize', value)}
                  options={fontSizeOptions}
                />
                <SelectField
                  label="Base Font Size"
                  value={themeParams.baseFontSize}
                  onChange={(value) => handleParamChange('baseFontSize', value)}
                  options={fontSizeOptions}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={colorPickerState.isOpen}
        onClose={closeColorPicker}
        onColorSelect={handleColorSelect}
        currentColor={colorPickerState.currentColor}
        label={colorPickerState.label}
      />
    </>
  );
};

export default NewThemeModal;