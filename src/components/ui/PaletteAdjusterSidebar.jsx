import React, { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import tinycolor from 'tinycolor2';
import { applyAdjustments } from '../../utils/colorUtils';

// --- NUEVO HOOK ---
// Este hook maneja la detección de clics fuera del elemento (el panel lateral)
// para poder cerrarlo sin necesidad de un fondo oscuro.
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // No hacer nada si se hace clic en el elemento del ref o en sus descendientes
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    
    // Añadimos los listeners al documento
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    
    // Función de limpieza al desmontar el componente
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Volver a ejecutar si el ref o el handler cambian
}


// --- Componente de Slider Personalizado (SIN CAMBIOS) ---
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

  // Listeners de Ratón
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

  // Listeners Táctiles
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

  // Handlers de eventos directos
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


// --- Componente SliderControl (SIN CAMBIOS) ---
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
  brandColor,
}) => {

  const adjustedColor = applyAdjustments(brandColor, paletteAdjustments);

  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturation: `linear-gradient(to right, ${tinycolor(brandColor).desaturate(100).toHexString()}, ${tinycolor(brandColor).saturate(100).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${brandColor}, #fff)`,
    temperature: 'linear-gradient(to right, #66b3ff, #fff, #ffc966)'
  };

  // --- MODIFICADO ---
  // Se ha renombrado la función de 'handleCancel' a 'closeHandler'
  // para que sea más genérica, ya que ahora la usa el hook 'useOnClickOutside'.
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
  
  // --- NUEVO ---
  // Creamos una ref para el panel lateral
  const sidebarRef = useRef();
  
  // --- NUEVO ---
  // Llamamos al hook para que ejecute 'closeHandler' si se hace clic
  // fuera del elemento apuntado por 'sidebarRef'
  useOnClickOutside(sidebarRef, closeHandler);


  return (
    <>
      {/* --- ELIMINADO --- 
        Se ha eliminado el 'div' que actuaba como fondo oscuro (backdrop)
      
        <div
          className="fixed inset-0 bg-black/30 z-50"
          onMouseDown={(e) => { ... }}
        ></div>
      */}

      <aside
        // --- NUEVO ---
        // Adjuntamos la ref a nuestro panel lateral
        ref={sidebarRef}
        className="fixed top-0 right-0 z-[60] w-80 h-full transition-transform transform translate-x-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          borderLeftWidth: '1px',
          // --- NUEVO ---
          // Añadimos una sombra para dar separación visual,
          // ya que no hay fondo oscuro.
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1), -5px 0 10px -6px rgba(0, 0, 0, 0.1)'
        }}
        // Se eliminan los 'onMouseDown' y 'onTouchStart' del 'aside'
        // ya que el hook 'useOnClickOutside' maneja esta lógica de forma más limpia.
      >
        <div className="h-full px-6 py-4 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>
              Adjust Palette
            </h2>
            <button 
              // --- MODIFICADO ---
              // El botón X ahora llama a 'closeHandler'
              onClick={closeHandler} 
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Vista previa del color */}
          <div 
            className="flex items-center justify-center h-24 rounded-lg mb-6" 
            style={{ backgroundColor: adjustedColor }}
          >
            <span className="text-white font-bold text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {tinycolor(adjustedColor).toHexString()}
            </span>
          </div>

          {/* Sliders */}
          <div className="space-y-6 flex-grow">
            <SliderControl
              label="Hue"
              value={paletteAdjustments.hue}
              min={-180}
              max={180}
              onChange={(v) => handleAdjustmentChange('hue', v)}
              onInputChange={(v) => handleAdjustmentChange('hue', v)}
              gradient={gradients.hue}
            />
            <SliderControl
              label="Saturation"
              value={paletteAdjustments.saturation}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('saturation', v)}
              onInputChange={(v) => handleAdjustmentChange('saturation', v)}
              gradient={gradients.saturation}
            />
            <SliderControl
              label="Brightness"
              value={paletteAdjustments.brightness}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('brightness', v)}
              onInputChange={(v) => handleAdjustmentChange('brightness', v)}
              gradient={gradients.brightness}
            />
            <SliderControl
              label="Temperature"
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
              // --- MODIFICADO ---
              // El botón Cancelar ahora llama a 'closeHandler'
              onClick={closeHandler}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-default)',
                borderColor: 'var(--border-default)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--action-primary-default)' }}
            >
              <Check size={16} />
              Apply
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(PaletteAdjusterSidebar);
