import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { X, Check, Pipette } from 'lucide-react'; // <-- ¡MODIFICADO!
import { HexColorPicker } from 'react-colorful'; // <-- ¡MODIFICADO! Vuelve a HexColorPicker simple
import tinycolor from 'tinycolor2';
import { findClosestColorName } from '../../utils/colorUtils.js';

// --- Estilos para los sliders (copiados de Explorer.jsx) ---
// ... (sin cambios) ...
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

// --- Hook para clic fuera (solo móvil) ---
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (window.innerWidth >= 768) return;
      if (!ref.current || ref.current.contains(event.target)) return;
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

// --- Componente de Slider (copiado de Explorer.jsx) ---
const ColorSlider = ({ label, value, min, max, onChange, gradientStyle }) => {
    const handleSliderChange = (e) => {
        onChange(parseFloat(e.target.value));
    };
    const handleInputChange = (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;
        onChange(val);
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 w-8 flex-shrink-0" title={label}>
                {label}
            </label>
            <div className="relative h-4 flex-1 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer custom-slider"
                    style={{ background: gradientStyle }}
                />
            </div>
            <input
                type="number"
                value={Math.round(value)}
                onChange={handleInputChange}
                min={min}
                max={max}
                className="w-12 text-center text-sm py-0.5 px-1 rounded border bg-gray-100 border-gray-200 text-gray-900"
            />
        </div>
    );
};


// --- Componente Principal del Sidebar de Selector de Color ---
const ColorPickerSidebar = ({
  initialColor, // El color que se está editando
  onClose, // Función para cerrar el sidebar
  onConfirm, // Función para confirmar el cambio (botón Aceptar)
  onRealtimeChange, // Función para actualizar el color en tiempo real
}) => {
  const sidebarRef = useRef();
  
  const [localColor, setLocalColor] = useState(initialColor);
  // --- ¡MODIFICADO! --- 'picker' es el modo por defecto
  const [inputMode, setInputMode] = useState('picker'); 
  const [isPicking, setIsPicking] = useState(false);

  // --- ¡MODIFICADO! ---
  // Los tabs ahora coinciden con la imagen de referencia (simplificado)
  const tabs = [
    { id: 'picker', label: 'Picker' },
    { id: 'hex', label: 'HEX' },
    { id: 'hsb', label: 'HSB' }, // HSB es lo mismo que HSV
    { id: 'hsl', label: 'HSL' },
    { id: 'rgb', label: 'RGB' },
    { id: 'name', label: 'Nombre' },
  ];

  // Sincronizar el color local si el color inicial cambia (al seleccionar otro color)
  useEffect(() => {
    setLocalColor(initialColor);
  }, [initialColor]);

  const handlePickerChange = (newColor) => {
    setLocalColor(newColor);
    if (onRealtimeChange) {
      onRealtimeChange(newColor);
    }
  };

  const handleTextChange = (e) => {
    const newColorStr = e.target.value;
    setLocalColor(newColorStr);
    if (tinycolor(newColorStr).isValid() && onRealtimeChange) {
      onRealtimeChange(newColorStr);
    }
  };
  const handleTextBlur = (e) => {
    if (!tinycolor(e.target.value).isValid()) {
      setLocalColor(initialColor); // Revertir si es inválido
      if (onRealtimeChange) onRealtimeChange(initialColor);
    }
  };
  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (tinycolor(e.target.value).isValid()) {
        onConfirm(e.target.value); // Confirmar con Enter
      } else {
        setLocalColor(initialColor); // Revertir
        if (onRealtimeChange) onRealtimeChange(initialColor);
      }
    }
  };
  
  // --- ¡MODIFICADO! ---
  // Función para obtener el valor del input de texto (para HEX)
  const getFormattedColor = (mode) => {
    const c = tinycolor(localColor);
    if (!c.isValid()) return localColor;
    if (mode === 'hex') {
      return c.toHexString().toUpperCase();
    }
    if (mode === 'name') {
      return findClosestColorName(localColor);
    }
    // Para otros modos (RGB, HSL, HSB)
    if (mode === 'rgb') return c.toRgbString();
    if (mode === 'hsl') return c.toHslString();
    if (mode === 'hsv') return c.toHsvString(); // hsv es hsb
    
    return c.toHexString().toUpperCase();
  };

  const colorTiny = tinycolor(localColor);
  const rgb = colorTiny.toRgb();
  const hsl = colorTiny.toHsl();
  const hsv = colorTiny.toHsv();

  const handleSliderChange = (mode, channel, value) => {
    let newColor;
    if (mode === 'rgb') {
      const newRgb = { ...rgb, [channel]: value };
      newColor = tinycolor(newRgb);
    } else if (mode === 'hsl') {
      const newHsl = { ...hsl, [channel]: value / (channel === 'h' ? 1 : 100) };
      newColor = tinycolor(newHsl);
    } else if (mode === 'hsv') {
      const newHsv = { ...hsv, [channel]: value / (channel === 'h' ? 1 : 100) };
      newColor = tinycolor(newHsv);
    }
    
    if (newColor && newColor.isValid()) {
      const newHex = newColor.toHexString();
      handlePickerChange(newHex); // Usar el handler unificado
    }
  };
  
  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturationHsl: `linear-gradient(to right, ${tinycolor({h: hsl.h, s: 0, l: 0.5}).toHexString()}, ${tinycolor({h: hsl.h, s: 1, l: 0.5}).toHexString()})`,
    luminance: `linear-gradient(to right, #000, ${tinycolor({h: hsl.h, s: hsl.s, l: 0.5}).toHexString()}, #fff)`,
    saturationHsv: `linear-gradient(to right, ${tinycolor({h: hsv.h, s: 0, v: hsv.v}).toHexString()}, ${tinycolor({h: hsv.h, s: 1, v: hsv.v}).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${tinycolor({h: hsv.h, s: hsv.s, v: 1}).toHexString()})`,
    red: `linear-gradient(to right, ${tinycolor({...rgb, r: 0}).toHexString()}, ${tinycolor({...rgb, r: 255}).toHexString()})`,
    green: `linear-gradient(to right, ${tinycolor({...rgb, g: 0}).toHexString()}, ${tinycolor({...rgb, g: 255}).toHexString()})`,
    blue: `linear-gradient(to right, ${tinycolor({...rgb, b: 0}).toHexString()}, ${tinycolor({...rgb, b: 255}).toHexString()})`,
  };

  // --- ¡ELIMINADO! --- const inputModes

  const openEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      alert('Tu navegador no soporta la API EyeDropper.');
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      setIsPicking(true);
      // Ocultar el sidebar temporalmente
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'hidden';
      await new Promise(resolve => setTimeout(resolve, 100)); // Dar tiempo a que se oculte
      
      const { sRGBHex } = await eyeDropper.open();
      
      // Mostrar el sidebar de nuevo
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'visible';
      setIsPicking(false);
      handlePickerChange(sRGBHex);
    } catch (e) {
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'visible';
      setIsPicking(false);
    }
  };

  const handleCancel = () => {
    // Revertir al color original antes de cerrar
    onRealtimeChange(initialColor);
    onClose();
  };
  
  const handleConfirm = () => {
    // Confirmar el color local
    onConfirm(localColor);
  };
  
  // --- ¡MODIFICADO! ---
  // Se añade el hook de clic fuera para cancelar en móvil
  useOnClickOutside(sidebarRef, handleCancel);

  return (
    <>
      <style>{sliderStyles}</style>
      {/* Backdrop para móvil */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={handleCancel}
        style={{ visibility: isPicking ? 'hidden' : 'visible' }}
      />
      
      {/* Panel del Sidebar */}
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-2xl shadow-2xl transition-transform transform
                   md:transform-none md:relative md:w-64 lg:w-72 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border
                   
                   h-auto max-h-[50vh] md:h-auto" // <-- ¡MODIFICADO! Altura móvil
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          visibility: isPicking ? 'hidden' : 'visible'
        }}
      >
        {/* --- ¡MODIFICADO! --- Layout reestructurado */}
        <div 
          className="h-full overflow-hidden flex flex-col" // <-- Contenedor flex
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Handle visual (solo móvil) */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-4 md:hidden flex-shrink-0" />
          
          {/* Header (solo desktop) */}
          <div className="hidden md:flex justify-between items-center mb-4 px-4 pt-4">
            <h2 className="text-xl font-bold text-gray-900">
              Editar Color
            </h2>
            <button 
              onClick={handleCancel} 
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs de Navegación */}
          <div className="flex-shrink-0 border-b border-gray-200 overflow-x-auto">
            <nav className="flex px-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInputMode(tab.id)}
                  className={`
                    ${
                      inputMode === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-colors
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido del Selector de Color (con scroll) */}
          <div className="flex-grow overflow-y-auto space-y-3 p-4">
            
            {/* --- Contenido de Pestañas --- */}
            {inputMode === 'picker' && (
              <div className="space-y-3">
                <HexColorPicker color={localColor} onChange={handlePickerChange} className="!w-full" />
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-5 h-5 rounded border flex-shrink-0 border-gray-200" 
                    style={{ backgroundColor: localColor }}
                  />
                  <button
                    onClick={openEyedropper}
                    className="p-1 rounded-md border bg-gray-100 border-gray-200 text-gray-800"
                    title="Seleccionar color (Eyedropper)"
                  >
                    <Pipette size={14} />
                  </button>
                  <input 
                    type="text"
                    value={getFormattedColor('hex')}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    onKeyDown={handleTextKeyDown}
                    className="flex-1 w-full font-mono text-sm px-2 py-0.5 rounded-md border bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
            )}
            
            {inputMode === 'hex' && (
              <div>
                <label className="text-xs font-semibold text-gray-500">HEX</label>
                <input 
                    type="text"
                    value={getFormattedColor('hex')}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    onKeyDown={handleTextKeyDown}
                    className="w-full font-mono text-lg p-2 rounded-md border bg-gray-100 border-gray-200 text-gray-900"
                />
              </div>
            )}
            
            {inputMode === 'name' && (
              <div>
                <label className="text-xs font-semibold text-gray-500">Nombre más cercano</label>
                <input 
                    type="text"
                    value={getFormattedColor('name')}
                    readOnly
                    className="w-full text-lg p-2 rounded-md border bg-gray-100 border-gray-200 text-gray-900 cursor-default"
                />
              </div>
            )}

            {inputMode === 'rgb' && (
              <div className="space-y-2">
                <ColorSlider label="R" min={0} max={255} value={rgb.r} onChange={(v) => handleSliderChange('rgb', 'r', v)} gradientStyle={gradients.red} />
                <ColorSlider label="G" min={0} max={255} value={rgb.g} onChange={(v) => handleSliderChange('rgb', 'g', v)} gradientStyle={gradients.green} />
                <ColorSlider label="B" min={0} max={255} value={rgb.b} onChange={(v) => handleSliderChange('rgb', 'b', v)} gradientStyle={gradients.blue} />
              </div>
            )}
            {inputMode === 'hsl' && (
              <div className="space-y-2">
                <ColorSlider label="H" min={0} max={360} value={Math.round(hsl.h)} onChange={(v) => handleSliderChange('hsl', 'h', v)} gradientStyle={gradients.hue} />
                <ColorSlider label="S" min={0} max={100} value={Math.round(hsl.s * 100)} onChange={(v) => handleSliderChange('hsl', 's', v)} gradientStyle={gradients.saturationHsl} />
                <ColorSlider label="L" min={0} max={100} value={Math.round(hsl.l * 100)} onChange={(v) => handleSliderChange('hsl', 'l', v)} gradientStyle={gradients.luminance} />
              </div>
            )}
            {inputMode === 'hsv' && ( // hsv es hsb
              <div className="space-y-2">
                <ColorSlider label="H" min={0} max={360} value={Math.round(hsv.h)} onChange={(v) => handleSliderChange('hsv', 'h', v)} gradientStyle={gradients.hue} />
                <ColorSlider label="S" min={0} max={100} value={Math.round(hsv.s * 100)} onChange={(v) => handleSliderChange('hsv', 's', v)} gradientStyle={gradients.saturationHsv} />
                <ColorSlider label="V" min={0} max={100} value={Math.round(hsv.v * 100)} onChange={(v) => handleSliderChange('hsv', 'v', v)} gradientStyle={gradients.brightness} />
              </div>
            )}
          </div>
          
          {/* Botones de Acción (Fijos al fondo del sidebar) */}
          <div 
            className="flex-shrink-0 flex gap-3 p-4 border-t" 
            style={{ borderColor: '#E5E7EB' }}
          >
            <button
              onClick={handleCancel}
              className="flex-1 font-bold py-2.5 px-4 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 font-bold py-2.5 px-4 rounded-lg transition-all text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
            >
              <Check size={16} strokeWidth={2.5} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(ColorPickerSidebar);