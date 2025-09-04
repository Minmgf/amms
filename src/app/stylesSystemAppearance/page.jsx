"use client";
import React, { useState, useEffect } from 'react';
import { FiEdit3, FiBell, FiPlus, FiX } from 'react-icons/fi';
import NavigationMenu from '../components/ParameterNavigation';
import ColorPickerModal from '../components/userParameterization/ColorPickerModal';
import NewThemeModal from '../components/userParameterization/NewThemeModal';

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
  const [selectedTheme, setSelectedTheme] = useState('Oscuro');
  const [themes, setThemes] = useState(['Oscuro', 'Claro', 'Personalizado']);
  
  // Modal states
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isNewThemeModalOpen, setIsNewThemeModalOpen] = useState(false);
  const [currentColorPicker, setCurrentColorPicker] = useState({
    label: '',
    color: '',
    onChange: null
  });
  
  // Estados para los parámetros de estilo
  const [styleParams, setStyleParams] = useState({
    textColor: '#ffffff',
    paragraphTextColor: '#cccccc',
    backgroundColor: '#000000',
    primaryButton: '#3b82f6',
    secondaryButton: '#4b5563',
    titlesTextSize: '14px',
    paragraphTextSize: '12px',
    fontType: 'Times New Roman'
  });

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  const handleStyleChange = (param, value) => {
    setStyleParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving style changes:', styleParams);
    // Aquí iría la lógica para guardar en el backend
    alert('Changes saved successfully!');
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
    console.log('Saving new theme:', newTheme);
    setThemes(prev => [...prev, newTheme.name]);
    setSelectedTheme(newTheme.name);
    
    // Apply the new theme's parameters
    const { name, ...params } = newTheme;
    setStyleParams(params);
    
    alert(`Theme "${newTheme.name}" created successfully!`);
  };

  // Delete theme handler
  const handleDeleteTheme = () => {
    if (themes.length <= 1) {
      alert('Cannot delete the last theme');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete the theme "${selectedTheme}"?`);
    if (confirmed) {
      const updatedThemes = themes.filter(theme => theme !== selectedTheme);
      setThemes(updatedThemes);
      setSelectedTheme(updatedThemes[0]);
      alert(`Theme "${selectedTheme}" deleted successfully!`);
    }
  };

  const fontSizeOptions = ['10px', '12px', '14px', '16px', '18px', '20px'];
  const fontTypeOptions = ['Times New Roman', 'Arial', 'Helvetica', 'Georgia', 'Verdana'];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Parameterization</h1>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <FiEdit3 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <FiBell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-semibold text-green-700">JV</span>
              </div>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Theme Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Theme</span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {themes.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleOpenNewThemeModal}
                      className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                      title="Add new theme"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDeleteTheme}
                      className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                      title="Delete current theme"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Parameters */}
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Parameter</span>
                    <span className="text-sm font-semibold text-gray-900">Value</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <ColorPicker
                    label="Text Color"
                    color={styleParams.textColor}
                    onChange={(color) => handleStyleChange('textColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Paragraph Text Color"
                    color={styleParams.paragraphTextColor}
                    onChange={(color) => handleStyleChange('paragraphTextColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Background Color"
                    color={styleParams.backgroundColor}
                    onChange={(color) => handleStyleChange('backgroundColor', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Primary Button"
                    color={styleParams.primaryButton}
                    onChange={(color) => handleStyleChange('primaryButton', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                  <ColorPicker
                    label="Secondary Button"
                    color={styleParams.secondaryButton}
                    onChange={(color) => handleStyleChange('secondaryButton', color)}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                </div>
              </div>

              {/* Typography Parameters */}
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Parameter</span>
                    <span className="text-sm font-semibold text-gray-900">Value</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <SelectField
                    label="Titles Text Size"
                    value={styleParams.titlesTextSize}
                    onChange={(value) => handleStyleChange('titlesTextSize', value)}
                    options={fontSizeOptions}
                  />
                  <SelectField
                    label="Paragraph Text Size"
                    value={styleParams.paragraphTextSize}
                    onChange={(value) => handleStyleChange('paragraphTextSize', value)}
                    options={fontSizeOptions}
                  />
                  <SelectField
                    label="Font Type"
                    value={styleParams.fontType}
                    onChange={(value) => handleStyleChange('fontType', value)}
                    options={fontTypeOptions}
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveChanges}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
              <div className="relative">
                {/* Monitor Frame */}
                <div className="w-80 h-52 bg-gray-300 rounded-t-lg relative">
                  {/* Screen */}
                  <div 
                    className="w-full h-full rounded-t-lg overflow-hidden relative"
                    style={{ backgroundColor: styleParams.backgroundColor }}
                  >
                    {/* Mock Dashboard Content */}
                    <div className="p-4 text-xs">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <h1 
                          className="font-bold"
                          style={{ 
                            color: styleParams.textColor,
                            fontSize: styleParams.titlesTextSize,
                            fontFamily: styleParams.fontType
                          }}
                        >
                          Dashboard
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
                            <div className="bg-gray-700 rounded p-1">
                              <div 
                                className="text-xs"
                                style={{ 
                                  color: styleParams.paragraphTextColor,
                                  fontSize: styleParams.paragraphTextSize,
                                  fontFamily: styleParams.fontType
                                }}
                              >
                                Stats
                              </div>
                            </div>
                            <div className="bg-gray-700 rounded p-1">
                              <div 
                                className="text-xs"
                                style={{ 
                                  color: styleParams.paragraphTextColor,
                                  fontSize: styleParams.paragraphTextSize,
                                  fontFamily: styleParams.fontType
                                }}
                              >
                                Data
                              </div>
                            </div>
                          </div>
                          
                          {/* Buttons */}
                          <div className="flex space-x-1">
                            <button 
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: styleParams.primaryButton }}
                            >
                              Primary
                            </button>
                            <button 
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: styleParams.secondaryButton }}
                            >
                              Secondary
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