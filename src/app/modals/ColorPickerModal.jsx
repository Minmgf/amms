import React, { useState, useRef, useEffect } from 'react';

const ColorPickerModal = ({ isOpen, onClose, onColorSelect, currentColor, label }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || '#8B5CF6');
  const [opacity, setOpacity] = useState(100);

  const canvasRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Predefined colors palette
  const colorMatrix = [
    // Grayscale row
    ['#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827', '#000000'],
    // Cyan to Blue
    ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63', '#083344'],
    // Purple to Blue
    ['#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3B0764'],
    // Pink to Purple
    ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843', '#701A3F'],
    // Red
    ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#600000'],
    // Orange
    ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12', '#540000'],
    // Yellow
    ['#FEFCE8', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#451A03'],
    // Green
    ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D', '#052E16'],
  ];

  useEffect(() => {
    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, [currentColor]);

  useEffect(() => {
    if (isOpen) {
      drawColorPicker();
    }
  }, [isOpen]);

  const drawColorPicker = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Create horizontal gradient (hue)
    const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
    hueGradient.addColorStop(0, '#FF0000');
    hueGradient.addColorStop(0.17, '#FF00FF');
    hueGradient.addColorStop(0.33, '#0000FF');
    hueGradient.addColorStop(0.5, '#00FFFF');
    hueGradient.addColorStop(0.67, '#00FF00');
    hueGradient.addColorStop(0.83, '#FFFF00');
    hueGradient.addColorStop(1, '#FF0000');

    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, width, height);

    // Create vertical gradient (saturation and brightness)
    const saturationGradient = ctx.createLinearGradient(0, 0, 0, height);
    saturationGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    saturationGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    saturationGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    saturationGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    setSelectedColor(hex);
  };

  const handleMouseMove = (e) => {
    if (isMouseDown) {
      handleCanvasClick(e);
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleSave = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
            {label || 'Choose Color'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Color Preview */}
          <div className="w-full">
            <div 
              className="w-full h-16 rounded-lg border-2 border-gray-200 mb-2"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="text-center text-sm text-gray-600 font-mono">
              {selectedColor.toUpperCase()}
            </div>
          </div>

          {/* Main Color Picker Canvas */}
          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={240}
              height={120}
              className="w-60 h-32 rounded border border-gray-200 cursor-crosshair block"
              onClick={handleCanvasClick}
              onMouseDown={() => setIsMouseDown(true)}
              onMouseUp={() => setIsMouseDown(false)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsMouseDown(false)}
              style={{ touchAction: 'none', imageRendering: 'pixelated' }}
            />
          </div>

          {/* Opacity Slider */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">OPACITY</span>
              <span className="text-sm text-gray-600">{opacity}%</span>
            </div>
            <div className="relative w-full">
              <div 
                className="w-full h-6 rounded-lg border border-gray-200 opacity-slider-track"
                style={{
                  background: `linear-gradient(to right, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 1) 100%)`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-purple-500 rounded-full shadow-md pointer-events-none"
                  style={{ left: `${opacity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Color Matrix */}
          <div className="w-full">
            <div className="grid gap-1">
              {colorMatrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 justify-center">
                  {row.map((color, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-6 h-6 flex-shrink-0 rounded cursor-pointer border border-gray-200 hover:border-gray-400 transition-colors hover:scale-110"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorClick(color)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;