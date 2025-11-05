import React, { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import tinycolor from 'tinycolor2';

// --- MODIFICACIÓN ---
// El hook 'useOnClickOutside' ya no es necesario para el layout de escritorio.
// Lo mantendremos pero solo para el backdrop de MÓVIL.

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Si estamos en pantalla de escritorio (md o más), no hagas nada.
      if (window.innerWidth >= 768) {
        return;
      }
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
// --- FIN MODIFICACIÓN ---


// Componente de Slider Personalizado (sin cambios)
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
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2 border-gray-200 cursor-grab active:cursor-grabbing"
          style={{ 
            left: `${percent}%`, 
            transform: `translate(-50%, -50%)`,
            touchAction: 'none' 
          }}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbTouchStart}
        ></div>
      </div>
    </div>
  );
};

// Componente SliderControl (sin cambios)
const SliderControl = ({ label, value, min, max, onChange, gradient, onInputChange }) => (
    <div 
      className="space-y-3" 
      onMouseDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
    >
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium">{label}</label>
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
                className="w-20 px-2 py-1 rounded-md border text-sm text-center"
                style={{
                    backgroundColor: 'var(--bg-muted)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-default)',
                }}
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
  // El hook se usa solo para cerrar el bottom-sheet en móvil
  useOnClickOutside(sidebarRef, closeHandler);

  return (
    <>
      {/* --- ¡CLASES MODIFICADAS! ---
        Móvil (default): `fixed bottom-0`... (bottom sheet)
        Escritorio (md:): `relative`, `sticky`, `w-80`... (sidebar)
      */}
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                   md:transform-none md:relative md:w-80 lg:w-96 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div 
          className="h-full px-6 py-4 overflow-y-auto flex flex-col"
          // Detiene la propagación del clic en el contenido del sidebar
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Handle visual (solo móvil) */}
          <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>
              Ajustar Paleta
            </h2>
            <button 
              onClick={closeHandler} 
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Vista previa de UN SOLO color (como en Coolors) */}
          <div 
            className="flex items-center justify-center h-24 rounded-lg mb-6 border"
            style={{ 
              backgroundColor: previewColor,
              borderColor: 'var(--border-default)'
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
            className="flex gap-3 pt-4 border-t" 
            style={{ borderColor: 'var(--border-default)' }}
          >
            <button
              onClick={closeHandler}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-default)',
                borderColor: 'var(--border-default)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--action-primary-default)' }}
            >
              <Check size={16} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(PaletteAdjusterSidebar);