import React, { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import tinycolor from 'tinycolor2';

// --- Estilos para los sliders (traídos de ColorPickerSidebar) ---
const sliderStyles = `
  .custom-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    outline: none;
    opacity: 0.9;
    transition: opacity .2s;
  }
  .custom-slider:hover {
    opacity: 1;
  }
  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #E5E7EB; /* Borde gris claro */
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    margin-top: -4px;
  }
  .custom-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

// --- ELIMINADO --- Hook useOnClickOutside

// Componente de Slider Personalizado (Actualizado)
const CustomSlider = ({ min, max, value, onChange, gradient }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const getValueFromX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return value;
    
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(min + percent * (max - min));
    return newValue;
  }, [min, max, value]); 

  const handleMove = useCallback((clientX) => {
    const newValue = getValueFromX(clientX);
    onChange(newValue);
  }, [getValueFromX, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const handleTrackMouseDown = (e) => {
    handleMove(e.clientX);
    setIsDragging(true);
  };
  const handleTrackTouchStart = (e) => {
    handleMove(e.touches[0].clientX);
    setIsDragging(true);
  };
  const handleThumbMouseDown = () => {
    setIsDragging(true);
  };
  const handleThumbTouchStart = () => {
    setIsDragging(true);
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div 
      className="relative w-full h-5 flex items-center"
      onMouseDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); }}
    >
      <div
        ref={trackRef}
        className="relative w-full h-1.5 rounded-full cursor-pointer"
        style={{ background: gradient }} 
        onMouseDown={handleTrackMouseDown}
        onTouchStart={handleTrackTouchStart}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2"
          style={{ 
            left: `${percent}%`, 
            transform: `translate(-50%, -50%)`,
            touchAction: 'none',
            borderColor: '#E5E7EB' // Borde gris claro
          }}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbTouchStart}
        ></div>
      </div>
    </div>
  );
};

// Componente SliderControl (Actualizado)
const SliderControl = ({ label, value, min, max, onChange, gradient, onInputChange }) => (
    <div 
      className="space-y-3" 
      onMouseDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
    >
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-800">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    onInputChange(0); 
                  } else {
                    onInputChange(parseInt(val, 10));
                  }
                }}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onTouchStart={(e) => { e.stopPropagation(); }}
                className="w-20 px-2 py-1 rounded-md border text-sm text-center bg-gray-100 border-gray-200 text-gray-900"
            />
        </div>
        <div className="col-span-2">
            <CustomSlider
              min={Number(min)}
              max={Number(max)}
              value={Number(value)}
              onChange={onChange}
              gradient={gradient}
            />
        </div>
    </div>
);

// --- Componente Principal (MODIFICADO) ---
const PaletteAdjusterSidebar = ({
  paletteAdjustments,
  setPaletteAdjustments,
  commitPaletteAdjustments,
  cancelPaletteAdjustments,
  setIsAdjusterSidebarVisible,
  originalExplorerPalette,
  explorerPalette,
  lockedColors,
}) => {

  const baseForGradient = (originalExplorerPalette || []).find(c => !(lockedColors || []).includes(c)) || (originalExplorerPalette || [])[0] || '#808080';
  const originalIndex = (originalExplorerPalette || []).indexOf(baseForGradient);
  const adjustedBase = (explorerPalette || [])[originalIndex] || baseForGradient;
  const previewColor = (lockedColors || []).includes(baseForGradient) ? baseForGradient : adjustedBase;

  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturation: `linear-gradient(to right, ${tinycolor(baseForGradient).desaturate(100).toHexString()}, ${tinycolor(baseForGradient).saturate(100).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${baseForGradient}, #fff)`,
    temperature: 'linear-gradient(to right, #66b3ff, #fff, #ffc966)'
  };

  const closeHandler = () => {
    cancelPaletteAdjustments();
    setIsAdjusterSidebarVisible(false);
  };

  const handleApply = () => {
    commitPaletteAdjustments();
    setIsAdjusterSidebarVisible(false);
  };

  const handleAdjustmentChange = (key, newValue) => {
    let clampedValue = newValue;
    if (key === 'hue') clampedValue = Math.max(-180, Math.min(180, newValue));
    else clampedValue = Math.max(-100, Math.min(100, newValue));

    if (isNaN(clampedValue)) clampedValue = 0;

    setPaletteAdjustments((prev) => ({
      ...prev,
      [key]: clampedValue,
    }));
  };
  
  const sidebarRef = useRef();
  // --- ELIMINADO --- useOnClickOutside

  return (
    <>
      {/* --- ¡NUEVO! --- Añadir los estilos del slider --- */}
      <style>{sliderStyles}</style>
      
      {/* --- ELIMINADO --- Backdrop */}
      
      {/* Panel del Sidebar */}
      {/* --- ¡MODIFICACIÓN CLAVE! --- Clases de <aside> actualizadas --- */}
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                   md:transform-none md:relative md:w-64 lg:w-72 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
        // --- ¡MODIFICADO! --- Fondo blanco y borde
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
        }}
      >
        <div 
          className="h-full px-4 py-4 overflow-y-auto flex flex-col" // <-- Padding actualizado
          // Detiene la propagación del clic en el contenido del sidebar
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Handle visual (solo móvil) */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Ajustar Paleta
            </h2>
            <button 
              onClick={closeHandler} 
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          {/* Vista previa de UN SOLO color (como en Coolors) */}
          <div 
            className="flex items-center justify-center h-24 rounded-lg mb-6 border"
            style={{ 
              backgroundColor: previewColor,
              borderColor: '#E5E7EB' // Borde gris claro
            }}
          >
            <span 
              className="font-mono font-bold text-lg px-2 py-1 rounded-md bg-black/20 backdrop-blur-sm"
              style={{ 
                color: tinycolor(previewColor).isLight() ? '#000' : '#FFF',
              }}
            >
              {tinycolor(previewColor).toHexString().toUpperCase()}
            </span>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            <SliderControl
              label="Matiz"
              value={paletteAdjustments.hue}
              min={-180}
              max={180}
              onChange={(v) => handleAdjustmentChange('hue', v)}
              onInputChange={(v) => handleAdjustmentChange('hue', v)}
              gradient={gradients.hue}
            />
            <SliderControl
              label="Saturación"
              value={paletteAdjustments.saturation}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('saturation', v)}
              onInputChange={(v) => handleAdjustmentChange('saturation', v)}
              gradient={gradients.saturation}
            />
            <SliderControl
              label="Brillo"
              value={paletteAdjustments.brightness}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('brightness', v)}
              onInputChange={(v) => handleAdjustmentChange('brightness', v)}
              gradient={gradients.brightness}
            />
            <SliderControl
              label="Temperatura"
              value={paletteAdjustments.temperature}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('temperature', v)}
              onInputChange={(v) => handleAdjustmentChange('temperature', v)}
              gradient={gradients.temperature}
            />
          </div>

          {/* Botones de Acción */}
          <div 
            className="flex gap-3 pt-4 border-t mt-auto" // <-- 'mt-auto' empuja esto al fondo
            style={{ borderColor: '#E5E7EB' }}
          >
            <button
              onClick={closeHandler}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
            >
              Cancelar
            </button>
            {/* --- ¡BOTÓN CON GRADIENTE! --- */}
            <button
              onClick={handleApply}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-all text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
            >
              <Check size={16} strokeWidth={1.75} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(PaletteAdjusterSidebar);