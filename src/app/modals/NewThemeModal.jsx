import React, { useState } from 'react';
import ColorPickerModal from './ColorPickerModal'; // Import the color picker modal

const NewThemeModal = ({ isOpen, onClose, onSave }) => {
  const [themeName, setThemeName] = useState('');
  const [themeParams, setThemeParams] = useState({
    textColor: '#000000',
    paragraphTextColor: '#666666',
    backgroundColor: '#ffffff',
    primaryButton: '#3b82f6',
    secondaryButton: '#6b7280',
    titlesTextSize: '14px',
    paragraphTextSize: '12px',
    fontType: 'Times New Roman'
  });

  // State for color picker modal
  const [colorPickerState, setColorPickerState] = useState({
    isOpen: false,
    currentParam: null,
    currentColor: '#000000',
    label: ''
  });

  // Color picker button component that opens the modal
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
          <span className="text-xs text-gray-500 font-mono min-w-[60px]">
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
        className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
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
    
    const newTheme = {
      name: themeName,
      ...themeParams
    };
    
    onSave(newTheme);
    
    // Reset form
    setThemeName('');
    setThemeParams({
      textColor: '#000000',
      paragraphTextColor: '#666666',
      backgroundColor: '#ffffff',
      primaryButton: '#3b82f6',
      secondaryButton: '#6b7280',
      titlesTextSize: '14px',
      paragraphTextSize: '12px',
      fontType: 'Times New Roman'
    });
    
    onClose();
  };

  const fontSizeOptions = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px'];
  const fontTypeOptions = ['Times New Roman', 'Arial', 'Helvetica', 'Georgia', 'Verdana', 'Roboto', 'Open Sans'];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-900">Add New Theme</h2>
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
            {/* Theme Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Enter theme name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Color Parameters */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Color Parameters</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <ColorPickerButton
                  label="Text Color"
                  color={themeParams.textColor}
                  onColorClick={() => openColorPicker('textColor', themeParams.textColor, 'Text Color')}
                />
                <ColorPickerButton
                  label="Paragraph Text Color"
                  color={themeParams.paragraphTextColor}
                  onColorClick={() => openColorPicker('paragraphTextColor', themeParams.paragraphTextColor, 'Paragraph Text Color')}
                />
                <ColorPickerButton
                  label="Background Color"
                  color={themeParams.backgroundColor}
                  onColorClick={() => openColorPicker('backgroundColor', themeParams.backgroundColor, 'Background Color')}
                />
                <ColorPickerButton
                  label="Primary Button"
                  color={themeParams.primaryButton}
                  onColorClick={() => openColorPicker('primaryButton', themeParams.primaryButton, 'Primary Button')}
                />
                <ColorPickerButton
                  label="Secondary Button"
                  color={themeParams.secondaryButton}
                  onColorClick={() => openColorPicker('secondaryButton', themeParams.secondaryButton, 'Secondary Button')}
                />
              </div>
            </div>

            {/* Typography Parameters */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Typography Parameters</span>
                <span className="text-sm font-semibold text-gray-900">Value</span>
              </div>
              
              <div className="space-y-1">
                <SelectField
                  label="Titles Text Size"
                  value={themeParams.titlesTextSize}
                  onChange={(value) => handleParamChange('titlesTextSize', value)}
                  options={fontSizeOptions}
                />
                <SelectField
                  label="Paragraph Text Size"
                  value={themeParams.paragraphTextSize}
                  onChange={(value) => handleParamChange('paragraphTextSize', value)}
                  options={fontSizeOptions}
                />
                <SelectField
                  label="Font Type"
                  value={themeParams.fontType}
                  onChange={(value) => handleParamChange('fontType', value)}
                  options={fontTypeOptions}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Save Theme
            </button>
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