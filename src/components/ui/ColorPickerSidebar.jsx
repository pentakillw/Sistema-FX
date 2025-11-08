import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { X, Check, ChevronDown, Pipette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import tinycolor from 'tinycolor2';
// --- ¡CORRECCIÓN! --- Se importa desde 'colorUtils.js'
import { findClosestColorName } from '../../utils/colorUtils.js';

// --- Estilos para los sliders (copiados de Explorer.jsx) ---
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
  useOnClickOutside(sidebarRef, onClose);

  const [localColor, setLocalColor] = useState(initialColor);
  const [inputMode, setInputMode] = useState('hex');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

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
  
  const getFormattedColor = (mode) => {
    const c = tinycolor(localColor);
    if (!c.isValid()) return localColor;
    if (mode === 'name') {
      return findClosestColorName(localColor);
    }
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

  const inputModes = ['hex', 'rgb', 'hsl', 'hsv', 'name'];

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
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                   md:transform-none md:relative md:w-64 lg:w-72 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          visibility: isPicking ? 'hidden' : 'visible'
        }}
      >
        <div 
          className="h-full px-4 py-4 overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Handle visual (solo móvil) */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
          
          <div className="flex justify-between items-center mb-4">
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

          {/* Contenido del Selector de Color */}
          <div className="flex-grow space-y-3">
            <HexColorPicker color={localColor} onChange={handlePickerChange} className="!w-full" />
            
            {/* Row 1: Info Bar */}
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
              
              {inputMode === 'hex' && (
                <input 
                  type="text"
                  value={getFormattedColor('hex')}
                  onChange={handleTextChange}
                  onBlur={handleTextBlur}
                  onKeyDown={handleTextKeyDown}
                  className="flex-1 w-full font-mono text-sm px-2 py-0.5 rounded-md border bg-gray-100 border-gray-200 text-gray-900"
                />
              )}
              {inputMode === 'name' && (
                <input 
                  type="text"
                  value={getFormattedColor('name')}
                  readOnly
                  className="flex-1 w-full text-sm px-2 py-0.5 rounded-md border bg-gray-100 border-gray-200 text-gray-900 cursor-default"
                />
              )}
              {inputMode !== 'hex' && inputMode !== 'name' && (
                <span className="flex-1 w-full font-mono text-sm px-2 py-0.5 text-gray-900">
                  {getFormattedColor('hex')}
                </span>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setIsModeMenuOpen(p => !p)}
                  className="p-1 rounded-md border bg-gray-100 border-gray-200 text-gray-800"
                  title="Cambiar modo de input"
                >
                  <ChevronDown size={14} />
                </button>
                {isModeMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-24 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-1">
                    {inputModes.map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setInputMode(mode);
                          setIsModeMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-sm rounded ${inputMode === mode ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100 text-gray-900`}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Row 2: Sliders (si no es hex o name) */}
            {inputMode !== 'hex' && inputMode !== 'name' && (
              <div className="pt-3 border-t border-gray-200">
                {inputMode === 'rgb' && (
                  <div className="space-y-1">
                    <ColorSlider label="R" min={0} max={255} value={rgb.r} onChange={(v) => handleSliderChange('rgb', 'r', v)} gradientStyle={gradients.red} />
                    <ColorSlider label="G" min={0} max={255} value={rgb.g} onChange={(v) => handleSliderChange('rgb', 'g', v)} gradientStyle={gradients.green} />
                    <ColorSlider label="B" min={0} max={255} value={rgb.b} onChange={(v) => handleSliderChange('rgb', 'b', v)} gradientStyle={gradients.blue} />
                  </div>
                )}
                {inputMode === 'hsl' && (
                  <div className="space-y-1">
                    <ColorSlider label="H" min={0} max={360} value={Math.round(hsl.h)} onChange={(v) => handleSliderChange('hsl', 'h', v)} gradientStyle={gradients.hue} />
                    <ColorSlider label="S" min={0} max={100} value={Math.round(hsl.s * 100)} onChange={(v) => handleSliderChange('hsl', 's', v)} gradientStyle={gradients.saturationHsl} />
                    <ColorSlider label="L" min={0} max={100} value={Math.round(hsl.l * 100)} onChange={(v) => handleSliderChange('hsl', 'l', v)} gradientStyle={gradients.luminance} />
                  </div>
                )}
                {inputMode === 'hsv' && (
                  <div className="space-y-1">
                    <ColorSlider label="H" min={0} max={360} value={Math.round(hsv.h)} onChange={(v) => handleSliderChange('hsv', 'h', v)} gradientStyle={gradients.hue} />
                    <ColorSlider label="S" min={0} max={100} value={Math.round(hsv.s * 100)} onChange={(v) => handleSliderChange('hsv', 's', v)} gradientStyle={gradients.saturationHsv} />
                    <ColorSlider label="V" min={0} max={100} value={Math.round(hsv.v * 100)} onChange={(v) => handleSliderChange('hsv', 'v', v)} gradientStyle={gradients.brightness} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div 
            className="flex gap-3 pt-4 border-t mt-4" 
            style={{ borderColor: '#E5E7EB' }}
          >
            <button
              onClick={handleCancel}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-all text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
            >
              <Check size={16} strokeWidth={1.75} />
              Aceptar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(ColorPickerSidebar);