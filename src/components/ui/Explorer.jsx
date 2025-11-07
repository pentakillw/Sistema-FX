import React, { useState, memo, useRef, useEffect } from 'react';
import { 
    Palette, X, Plus, 
    Lock, Star, Unlock, Copy, Trash2, 
    ArrowLeftRight,
    ChevronDown,
    Pipette // Añadido para Eyedropper
} from 'lucide-react';
import tinycolor from 'tinycolor2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ColorPalette from '../ColorPalette.jsx';
import { 
    DisplayModeModal
} from '../modals/index.jsx'; 
// --- ¡CORRECCIÓN DE IMPORTACIÓN! ---
import { generateShades, findClosestColorName } from '../../utils/colorUtils.js'; 
import { colorNameList } from '../../utils/colorNameList.js';
// --- FIN DE CORRECCIÓN ---
import { HexColorPicker } from 'react-colorful';
import ColorActionMenu from './ColorActionMenu.jsx';

// --- (Componente AddColorMenu sin cambios) ---
const AddColorMenu = ({ onAdd, onClose, maxAdd }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
    const counts = [1, 2, 3, 4, 5, +10, +15];
    return (
        <div 
            ref={menuRef}
            className="absolute z-50 flex flex-col items-center p-2 rounded-lg shadow-xl gap-1"
            style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)',
                transform: 'translate(-50%, -100%)', 
                marginTop: '-10px'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {counts.map(count => (
                <button
                    key={count}
                    disabled={count > maxAdd}
                    onClick={() => { onAdd(count); onClose(); }}
                    className="w-8 h-8 flex items-center justify-center font-semibold text-sm rounded-full bg-[var(--bg-muted)] text-[var(--text-default)] hover:bg-[var(--action-primary-default)] hover:text-white disabled:opacity-30"
                    title={`Añadir ${count} ${count > 1 ? 'colores' : 'color'}`}
                >
                    {count}
                </button>
            ))}
        </div>
    );
};

// --- (Componente ActionButtonHover sin cambios) ---
const ActionButtonHover = ({ title, onClick, children, iconColor, hoverBg, onMouseDown }) => (
    <button
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={title}
        className={`p-2 rounded-lg transition-colors ${iconColor} ${hoverBg}`}
    >
        {children}
    </button>
);

// --- (Función getPreviewBgColor sin cambios) ---
const getPreviewBgColor = (mode, shades, cardColor) => {
    if (!shades || shades.length === 0) return '#FFFFFF';
    switch (mode) {
        case 'T950': return shades[shades.length - 1];
        case 'T0': return shades[0];
        case 'white': return '#FFFFFF';
        case 'black': return '#000000';
        case 'card': return cardColor;
        default: return shades[shades.length - 1];
    }
}

// --- Componente de Slider ---
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
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-[var(--text-default)]">{label}</label>
                <input
                    type="number"
                    value={Math.round(value)}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    className="w-12 text-center py-0.5 px-1 rounded border"
                    style={{ 
                        backgroundColor: 'var(--bg-muted)', 
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-default)'
                    }}
                />
            </div>
            <div className="relative h-4 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleSliderChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider"
                    style={{ background: gradientStyle }}
                />
            </div>
        </div>
    );
};


// --- Pop-over para el selector de color (Con Sliders, Eyedropper, y corrección de CMYK) ---
const ColorPickerPopover = ({ color, onClose, style, onConfirm, onRealtimeChange }) => {
    const [localColor, setLocalColor] = useState(color);
    const [inputMode, setInputMode] = useState('hex');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [isPicking, setIsPicking] = useState(false);

    useEffect(() => {
        setLocalColor(color);
    }, [color]);

    const handlePickerChange = (newColor) => {
        setLocalColor(newColor);
        // --- ¡AÑADIDO! --- Actualiza en tiempo real
        if (onRealtimeChange) {
            onRealtimeChange(newColor);
        }
    };

    // --- Handlers para el input de texto (solo modo HEX y NAME) ---
    const handleTextChange = (e) => {
        const newColorStr = e.target.value;
        setLocalColor(newColorStr);
        // --- ¡AÑADIDO! --- Actualiza en tiempo real
        if (tinycolor(newColorStr).isValid() && onRealtimeChange) {
            onRealtimeChange(newColorStr);
        }
    };
    const handleTextBlur = (e) => {
        if (!tinycolor(e.target.value).isValid()) {
            setLocalColor(color); 
        }
        // --- ¡ELIMINADO! --- Ya no se confirma al salir
    };
    const handleTextKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (tinycolor(e.target.value).isValid()) {
                // --- ¡MODIFICADO! --- Al presionar Enter, confirmamos y cerramos
                onConfirm(e.target.value); // Llama a onConfirm (Aceptar)
                onClose();
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
    // --- Fin Handlers HEX ---


    // --- Handlers para Sliders ---
    const colorTiny = tinycolor(localColor);
    const rgb = colorTiny.toRgb();
    const hsl = colorTiny.toHsl();
    const hsv = colorTiny.toHsv();
    // const cmyk = colorTiny.toCmyk(); // <-- ¡ELIMINADO! Esta línea causaba el error.

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
            setLocalColor(newHex);
            // --- ¡AÑADIDO! --- Actualiza en tiempo real
            if (onRealtimeChange) onRealtimeChange(newHex);
        }
    };
    
    // --- Gradientes para los sliders ---
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

    // --- ¡MODIFICADO! ---
    const inputModes = ['hex', 'rgb', 'hsl', 'hsv', 'name']; // 'cmyk' eliminado

    // --- Lógica del Eyedropper ---
    const openEyedropper = async () => {
        if (!('EyeDropper' in window)) {
            console.warn('Eyedropper API no soportada');
            return;
        }
        try {
            const eyeDropper = new window.EyeDropper();
            setIsPicking(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            const { sRGBHex } = await eyeDropper.open();
            setIsPicking(false);
            handlePickerChange(sRGBHex);
        } catch (e) {
            setIsPicking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70]" onClick={onClose} style={{ visibility: isPicking ? 'hidden' : 'visible' }}>
            <div
                className="fixed z-[71] p-4 rounded-xl border shadow-2xl w-64"
                style={{
                    ...style,
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-default)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <HexColorPicker color={localColor} onChange={handlePickerChange} />
                
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-6 h-6 rounded-md border" 
                            style={{ 
                                backgroundColor: localColor, 
                                borderColor: 'var(--border-default)' 
                            }}
                        />
                        
                        <button
                            onClick={openEyedropper}
                            className="p-1 rounded-md border"
                            style={{ 
                                backgroundColor: 'var(--bg-muted)', 
                                borderColor: 'var(--border-default)', 
                                color: 'var(--text-default)'
                            }}
                            title="Seleccionar color (Eyedropper)"
                        >
                            <Pipette size={16} />
                        </button>
                        
                        {inputMode === 'hex' && (
                            <input 
                                type="text"
                                value={getFormattedColor('hex')}
                                onChange={handleTextChange}
                                onBlur={handleTextBlur}
                                onKeyDown={handleTextKeyDown}
                                className="w-full font-mono text-sm px-2 py-1 rounded-md border"
                                style={{ 
                                    backgroundColor: 'var(--bg-muted)', 
                                    borderColor: 'var(--border-default)', 
                                    color: 'var(--text-default)'
                                }}
                            />
                        )}
                        
                        {inputMode === 'name' && (
                            <input 
                                type="text"
                                value={getFormattedColor('name')}
                                readOnly
                                className="w-full text-sm px-2 py-1 rounded-md border"
                                style={{ 
                                    backgroundColor: 'var(--bg-muted)', 
                                    borderColor: 'var(--border-default)', 
                                    color: 'var(--text-default)',
                                    cursor: 'default'
                                }}
                            />
                        )}
                        
                        {inputMode !== 'hex' && inputMode !== 'name' && (
                            <span className="flex-1 font-mono text-sm font-medium text-[var(--text-default)]">
                                {getFormattedColor('hex')}
                            </span>
                        )}
                        
                        <div className="relative">
                            <button
                                onClick={() => setIsModeMenuOpen(p => !p)}
                                className="p-1 rounded-md border"
                                style={{ 
                                    backgroundColor: 'var(--bg-muted)', 
                                    borderColor: 'var(--border-default)', 
                                    color: 'var(--text-default)'
                                }}
                                title="Cambiar modo de input"
                            >
                                <ChevronDown size={16} />
                            </button>
                            {isModeMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-24 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 p-1">
                                    {inputModes.map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setInputMode(mode);
                                                setIsModeMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-2 py-1 text-sm rounded ${inputMode === mode ? 'font-bold bg-[var(--bg-muted)]' : ''} hover:bg-[var(--bg-muted)]`}
                                            style={{ color: 'var(--text-default)' }}
                                        >
                                            {mode.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- ¡MODIFICADO! Botones de Cancelar/Aceptar --- */}
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={onClose} // "Cancelar" ahora solo llama a onClose
                            className="w-full text-center font-semibold text-sm py-2 rounded-md border"
                            style={{ 
                                backgroundColor: 'var(--bg-muted)', 
                                borderColor: 'var(--border-default)', 
                                color: 'var(--text-default)'
                            }}
                            title="Cancelar cambios"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm(localColor); // "Aceptar" llama a onConfirm
                                onClose();
                            }}
                            className="w-full text-center font-semibold text-sm py-2 rounded-md border"
                            style={{ 
                                backgroundColor: 'var(--action-primary-default)', 
                                borderColor: 'transparent', 
                                color: 'white'
                            }}
                            title="Confirmar cambio"
                        >
                            Aceptar
                        </button>
                    </div>
                    {/* --- FIN MODIFICADO --- */}

                    {/* --- Sliders (con un 'pt-2' añadido para separar) --- */}
                    <div className="pt-2">
                        {inputMode === 'rgb' && (
                            <div className="space-y-2 pt-2">
                                <ColorSlider label="R" min={0} max={255} value={rgb.r} onChange={(v) => handleSliderChange('rgb', 'r', v)} gradientStyle={gradients.red} />
                                <ColorSlider label="G" min={0} max={255} value={rgb.g} onChange={(v) => handleSliderChange('rgb', 'g', v)} gradientStyle={gradients.green} />
                                <ColorSlider label="B" min={0} max={255} value={rgb.b} onChange={(v) => handleSliderChange('rgb', 'b', v)} gradientStyle={gradients.blue} />
                            </div>
                        )}
                        {inputMode === 'hsl' && (
                            <div className="space-y-2 pt-2">
                                <ColorSlider label="H" min={0} max={360} value={Math.round(hsl.h)} onChange={(v) => handleSliderChange('hsl', 'h', v)} gradientStyle={gradients.hue} />
                                <ColorSlider label="S" min={0} max={100} value={Math.round(hsl.s * 100)} onChange={(v) => handleSliderChange('hsl', 's', v)} gradientStyle={gradients.saturationHsl} />
                                <ColorSlider label="L" min={0} max={100} value={Math.round(hsl.l * 100)} onChange={(v) => handleSliderChange('hsl', 'l', v)} gradientStyle={gradients.luminance} />
                            </div>
                        )}
                        {inputMode === 'hsv' && (
                            <div className="space-y-2 pt-2">
                                <ColorSlider label="H" min={0} max={360} value={Math.round(hsv.h)} onChange={(v) => handleSliderChange('hsv', 'h', v)} gradientStyle={gradients.hue} />
                                <ColorSlider label="S" min={0} max={100} value={Math.round(hsv.s * 100)} onChange={(v) => handleSliderChange('hsv', 's', v)} gradientStyle={gradients.saturationHsv} />
                                <ColorSlider label="V" min={0} max={100} value={Math.round(hsv.v * 100)} onChange={(v) => handleSliderChange('hsv', 'v', v)} gradientStyle={gradients.brightness} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- FIN DEL COMPONENTE MODIFICADO ---

// --- (Componentes PopoverMenu y MenuButton sin cambios) ---
export const PopoverMenu = ({ children, onClose, align = 'right' }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 p-2 space-y-1`}
            onClick={(e) => { e.stopPropagation(); }}
        >
            {children}
        </div>
    );
};

export const MenuButton = ({ icon, label, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-[var(--text-default)] hover:bg-[var(--bg-muted)] transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);


// --- Estilos para los sliders de color ---
const sliderStyles = `
  .custom-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 5px;
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
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid var(--border-default);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    margin-top: -4px; /* Centrar el thumb en el track */
  }
  .custom-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid var(--border-default);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;


const Explorer = (props) => {
    // --- (Props sin cambios) ---
    const { 
        explorerPalette, reorderExplorerPalette, explorerGrayShades, 
        handleExplorerColorPick, setGrayColor,
        brandColor, updateBrandColor, themeData, insertColorInPalette,
        insertMultipleColors, 
        removeColorFromPalette, 
        explorerMethod, setExplorerMethod,
        generatePaletteWithAI, showNotification, applySimulationToPalette,
        onOpenAdjuster, onOpenAccessibilityModal, onOpenComponentPreviewModal,
        onOpenSimulationSidebar,
        replaceColorInPalette,
        handleUndo, handleRedo, history, historyIndex, 
        simulationMode,
        lockedColors,
        toggleLockColor,
        isAdjusterSidebarVisible,
        originalExplorerPalette,
        isSimulationSidebarVisible,
        isExpanded,
        setIsExpanded,
        colorModePreview
    } = props;
    
    // --- (Estado local sin cambios) ---
    const [activeShadeIndex, setActiveShadeIndex] = useState(null);
    const [baseColorForShades, setBaseColorForShades] = useState(null);
    const [pickerColor, setPickerColor] = useState(null);
    const [activeColorMenu, setActiveColorMenu] = useState(null); 
    const paletteContainerRef = useRef(null);
    const [displayMode, setDisplayMode] = useState('name');
    const [isDisplayModeModalVisible, setIsDisplayModeModalVisible] = useState(false);
    const [addMenuState, setAddMenuState] = useState({ isVisible: false, index: 0, style: {} });
    const longPressTimer = useRef();
    const [isLongPress, setIsLongPress] = useState(false);
    
    // --- (Funciones getDisplayValue y getHexValue sin cambios) ---
    const getDisplayValue = (colorStr, mode) => {
        const color = tinycolor(colorStr);
        switch (mode) {
            case 'rgb':
                const { r, g, b } = color.toRgb();
                return `RGB: ${r}, ${g}, ${b}`;
            case 'hsl':
                const { h, s, l } = color.toHsl();
                return `HSL: ${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
            case 'hsb':
                const { h: hsvH, s: hsvS, v: hsvV } = color.toHsv();
                return `HSB: ${Math.round(hsvH)}, ${Math.round(hsvS * 100)}%, ${Math.round(hsvV * 100)}%`;
            case 'name':
            default:
                return findClosestColorName(colorStr);
        }
    };
    const getHexValue = (colorStr) => {
        return tinycolor(colorStr).toHexString().substring(1).toUpperCase();
    }

    // --- (Lógica de themeData, cardColor, colorModeBg, onDragEnd, etc. sin cambios) ---
    if (!themeData || !themeData.stylePalette || !themeData.grayShades) {
        return null; 
    }
    const cardColor = themeData.stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color;
    const colorModeBg = getPreviewBgColor(colorModePreview, themeData.grayShades, cardColor);
    const onDragEnd = (result) => {
        if (!result.destination) return;
        reorderExplorerPalette(result.source.index, result.destination.index);
    };
    const toggleShades = (index) => {
        if (activeShadeIndex === index) {
            setActiveShadeIndex(null);
            setBaseColorForShades(null);
        } else {
            setActiveShadeIndex(index);
            setBaseColorForShades(explorerPalette[index]);
        }
    };
    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };
    const isSplitView = isAdjusterSidebarVisible || isSimulationSidebarVisible;

    // --- (Funciones handleColorBarClick, handleAddButtonDown, handleAddButtonUp sin cambios) ---
    const handleColorBarClick = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let menuStyle = {};
        if (window.innerWidth >= 768) {
            menuStyle = {
                top: `${rect.bottom + window.scrollY + 8}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)',
            };
        }
        setActiveColorMenu({ index, style: menuStyle });
    };
    const handleAddButtonDown = (e, index) => {
        e.stopPropagation();
        setIsLongPress(false);
        const rect = e.currentTarget.getBoundingClientRect();
        const style = {
            top: `${rect.top + window.scrollY}px`,
            left: `${rect.left + window.scrollX + rect.width / 2}px`,
        };
        longPressTimer.current = setTimeout(() => {
            setIsLongPress(true);
            setAddMenuState({ isVisible: true, index, style });
        }, 400);
    };
    const handleAddButtonUp = (e, index) => {
        e.stopPropagation();
        clearTimeout(longPressTimer.current);
        if (!isLongPress) {
            insertColorInPalette(index);
        }
    };

    return (
        <>
            <style>{sliderStyles}</style>
            
            <section 
                ref={paletteContainerRef}
                className={`transition-all duration-300`} 
                style={{ backgroundColor: colorModeBg, borderColor: 'var(--border-default)' }}
            >
                {/* ... (Tu Header de Explorer va aquí, si lo tienes) ... */}
                
                {isSplitView && (
                    <div 
                        className="h-[calc((100vh-65px)/2)] overflow-hidden" 
                        title="Paleta Original (Antes de ajustar)"
                    >
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="palette-original" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex items-center h-full relative"
                                    >
                                        {originalExplorerPalette.map((shade, index) => (
                                            <Draggable key={"original-" + shade + index} draggableId={"original-" + shade + index} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="relative h-full flex-1 flex items-center justify-center group/item"
                                                        style={{ 
                                                            ...provided.draggableProps.style,
                                                            backgroundColor: shade, 
                                                            minWidth: '50px' 
                                                        }}
                                                    >
                                                        {lockedColors.includes(shade) && (
                                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado">
                                                                <Lock size={12} strokeWidth={1.5} />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-2 flex flex-col items-center gap-1 z-10">
                                                            <span 
                                                                className="font-mono text-lg font-bold p-1 rounded-lg"
                                                                style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF', textShadow: tinycolor(shade).isLight() ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)' }}
                                                            >
                                                                {getHexValue(shade)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )}
                
                <div 
                    className={`overflow-hidden ${isSplitView ? 'h-[calc((100vh-65px)/2)]' : 'h-[calc(100vh-65px)] rounded-b-md'}`}
                    title={isAdjusterSidebarVisible ? "Paleta Ajustada (Tiempo Real)" : (isSimulationSidebarVisible ? "Paleta Simulada" : "Paleta Principal")}
                >
                    
                    {isAdjusterSidebarVisible && (
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="palette-main" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex items-center h-full relative group ${isSplitView ? 'rounded-b-md' : 'rounded-md'}`}
                                    >
                                        {explorerPalette.map((shade, index) => {
                                            const originalColor = originalExplorerPalette[index];
                                            const isLocked = lockedColors.includes(originalColor);
                                            const displayShade = isLocked ? originalColor : shade;
                                            const isLight = tinycolor(displayShade).isLight();
                                            const iconColor = isLight ? 'text-gray-900' : 'text-white';
                                            const hoverBg = isLight ? 'hover:bg-black/10' : 'hover:bg-white/20'; 
                                            const textColor = isLight ? '#000' : '#FFF';
                                            const textShadow = isLight ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)';
                                            const hexValue = getHexValue(displayShade);
                                            const displayValue = getDisplayValue(displayShade, displayMode);
                                            
                                            return (
                                                <Draggable key={"main-" + originalColor + index} draggableId={"main-" + originalColor + index} index={index}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="relative h-full flex-1 flex items-center justify-center group/color-wrapper" style={{...provided.draggableProps.style}}>
                                                            <div className="relative group/item h-full w-full flex items-center justify-center transition-colors duration-100 ease-in-out" style={{ backgroundColor: displayShade, minWidth: '50px' }} title={displayShade.toUpperCase()}>
                                                                {displayShade === brandColor && (<div className={`absolute top-3 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full z-10 ${iconColor}`} title="Color de Marca Actual"><Star size={12} className="fill-current" strokeWidth={1.5} /></div>)}
                                                                {isLocked && (<div className={`absolute top-12 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full z-10 ${iconColor}`} title="Color Bloqueado"><Lock size={12} strokeWidth={1.5} /></div>)}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-20">
                                                                    <div title="Arrastrar para mover" className={`p-2 rounded-lg cursor-grab ${iconColor} ${hoverBg}`} {...provided.dragHandleProps} onClick={(e) => e.stopPropagation()}>
                                                                        <ArrowLeftRight size={18} strokeWidth={1.5} />
                                                                    </div>
                                                                    <ActionButtonHover title="Usar como Marca" onClick={() => handleExplorerColorPick(displayShade)} iconColor={iconColor} hoverBg={hoverBg}><Star size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Ver Tonalidades" onClick={() => toggleShades(index)} iconColor={iconColor} hoverBg={hoverBg}><Palette size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Copiar H E X" onClick={() => { navigator.clipboard.writeText(hexValue); showNotification(`H E X ${hexValue} copiado!`); }} iconColor={iconColor} hoverBg={hoverBg}><Copy size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title={isLocked ? "Desbloquear" : "Bloquear"} onClick={() => toggleLockColor(originalColor)} iconColor={iconColor} hoverBg={hoverBg}>{isLocked ? <Lock size={18} strokeWidth={1.5} /> : <Unlock size={18} strokeWidth={1.5} />}</ActionButtonHover>
                                                                    <ActionButtonHover title="Eliminar Color" onClick={() => removeColorFromPalette(index)} iconColor={iconColor} hoverBg={hoverBg}><Trash2 size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                </div>
                                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-2 flex flex-col items-center gap-1 opacity-100 transition-opacity duration-200 z-10">
                                                                    <button 
                                                                        className={`font-mono text-lg font-bold p-1 rounded-lg transition-colors ${hoverBg}`} 
                                                                        style={{ color: textColor, textShadow: textShadow }} 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            let pickerStyle = {
                                                                                top: `${rect.top + window.scrollY - 10}px`,
                                                                                left: `${rect.left + window.scrollX + rect.width / 2}px`,
                                                                                transform: 'translate(-50%, -100%)',
                                                                            };
                                                                            if (window.innerWidth < 768) {
                                                                                pickerStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                                                                            }
                                                                            setPickerColor({ index, color: displayShade, style: pickerStyle }); 
                                                                        }} 
                                                                        title="Editar Color"
                                                                    >
                                                                        {hexValue}
                                                                    </button>
                                                                    <button className={`text-xs capitalize transition-colors hover:underline px-1 truncate w-full max-w-full`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setIsDisplayModeModalVisible(true); }} title="Cambiar formato de color">{displayValue}</button>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-1/2 right-0 h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10" style={{ transform: 'translate(50%, -50%)' }}>
                                                                <button 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onMouseDown={(e) => handleAddButtonDown(e, index)}
                                                                    onMouseUp={(e) => handleAddButtonUp(e, index)}
                                                                    onTouchStart={(e) => handleAddButtonDown(e, index)}
                                                                    onTouchEnd={(e) => handleAddButtonUp(e, index)}
                                                                    onMouseLeave={() => clearTimeout(longPressTimer.current)}
                                                                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 border border-black/20 text-black shadow-lg hover:scale-110 transition-transform" 
                                                                    title="Añadir color (mantén presionado para más)"
                                                                >
                                                                    <Plus size={16}/>
                                                                </button>
                                                            </div>
                                                            {activeShadeIndex === index && (<div className="absolute inset-0 flex flex-col z-30 animate-fade-in" onClick={(e) => e.stopPropagation()}>{generateShades(baseColorForShades).map((shade, shadeIndex) => (<div key={shadeIndex} className="flex-1 hover:brightness-125 cursor-pointer transition-all flex items-center justify-center relative group/shade" style={{ backgroundColor: shade }} onClick={(e) => { e.stopPropagation(); replaceColorInPalette(index, shade); setActiveShadeIndex(null); }} title={`Usar ${shade.toUpperCase()}`} >{shade.toLowerCase() === baseColorForShades.toLowerCase() && <div className="w-2 h-2 rounded-full bg-white/70 ring-2 ring-black/20 pointer-events-none"></div>}<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm bg-black/50 px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover/shade:opacity-100" style={{color: tinycolor(shade).isLight() ? '#000' : '#FFF'}}>{shade.toUpperCase()}</div></div>))}<button onClick={(e) => { e.stopPropagation(); toggleShades(null); }} className="absolute top-2 left-2 p-1 bg-black/20 rounded-full text-white hover:bg-black/50" title="Ocultar tonalidades"><X size={16} /></button></div>)}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                    
                    {isSimulationSidebarVisible && (
                        <div 
                            className={`flex items-center h-full relative group ${isSplitView ? 'rounded-b-md' : 'rounded-md'}`}
                            style={simulationFilterStyle}
                        >
                            {originalExplorerPalette.map((shade, index) => {
                                const isLight = tinycolor(shade).isLight();
                                const textColor = isLight ? '#000' : '#FFF';
                                const textShadow = isLight ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)';
                                const hexValue = getHexValue(shade);

                                return (
                                    <div key={`sim-${index}`} className="relative h-full flex-1 flex items-center justify-center" style={{ backgroundColor: shade, minWidth: '50px' }}>
                                        {lockedColors.includes(shade) && (<div className="absolute top-3 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado"><Lock size={12} strokeWidth={1.5} /></div>)}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-2 flex flex-col items-center gap-1 z-10">
                                            <span className="font-mono text-lg font-bold p-1 rounded-lg" style={{ color: textColor, textShadow: textShadow }}>
                                                {hexValue}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {!isAdjusterSidebarVisible && !isSimulationSidebarVisible && (
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="palette-main" direction="horizontal">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex items-center h-full relative group rounded-md`}>
                                        {explorerPalette.map((shade, index) => {
                                            const originalColor = (originalExplorerPalette && originalExplorerPalette[index]) ? originalExplorerPalette[index] : shade;
                                            const isLocked = lockedColors.includes(originalColor);
                                            const displayShade = shade;
                                            const isLight = tinycolor(displayShade).isLight();
                                            const iconColor = isLight ? 'text-gray-900' : 'text-white';
                                            const hoverBg = isLight ? 'hover:bg-black/10' : 'hover:bg-white/20'; 
                                            const textColor = isLight ? '#000' : '#FFF';
                                            const textShadow = isLight ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)';
                                            const hexValue = getHexValue(displayShade);
                                            const displayValue = getDisplayValue(displayShade, displayMode);

                                            return (
                                                <Draggable key={"main-" + originalColor + index} draggableId={"main-" + originalColor + index} index={index}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="relative h-full flex-1 flex items-center justify-center group/color-wrapper" style={{...provided.draggableProps.style}}>
                                                            <div className="relative group/item h-full w-full flex items-center justify-center transition-colors duration-100 ease-in-out" style={{ backgroundColor: displayShade, minWidth: '50px' }} title={displayShade.toUpperCase()}>
                                                                {displayShade === brandColor && (<div className={`absolute top-3 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full z-10 ${iconColor}`} title="Color de Marca Actual"><Star size={12} className="fill-current" strokeWidth={1.5} /></div>)}
                                                                {isLocked && (<div className={`absolute top-12 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full z-10 ${iconColor}`} title="Color Bloqueado"><Lock size={12} strokeWidth={1.5} /></div>)}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-20">
                                                                    <div title="Arrastrar para mover" className={`p-2 rounded-lg cursor-grab ${iconColor} ${hoverBg}`} {...provided.dragHandleProps} onClick={(e) => e.stopPropagation()}>
                                                                        <ArrowLeftRight size={18} strokeWidth={1.5} />
                                                                    </div>
                                                                    <ActionButtonHover title="Usar como Marca" onClick={() => handleExplorerColorPick(displayShade)} iconColor={iconColor} hoverBg={hoverBg}><Star size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Ver Tonalidades" onClick={() => toggleShades(index)} iconColor={iconColor} hoverBg={hoverBg}><Palette size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Copiar H E X" onClick={() => { navigator.clipboard.writeText(hexValue); showNotification(`H E X ${hexValue} copiado!`); }} iconColor={iconColor} hoverBg={hoverBg}><Copy size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title={isLocked ? "Desbloquear" : "Bloquear"} onClick={() => toggleLockColor(originalColor)} iconColor={iconColor} hoverBg={hoverBg}>{isLocked ? <Lock size={18} strokeWidth={1.5} /> : <Unlock size={18} strokeWidth={1.5} />}</ActionButtonHover>
                                                                    <ActionButtonHover title="Eliminar Color" onClick={() => removeColorFromPalette(index)} iconColor={iconColor} hoverBg={hoverBg}><Trash2 size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                </div>
                                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-2 flex flex-col items-center gap-1 opacity-100 transition-opacity duration-200 z-10">
                                                                    <button 
                                                                        className={`font-mono text-lg font-bold p-1 rounded-lg transition-colors ${hoverBg}`} 
                                                                        style={{ color: textColor, textShadow: textShadow }} 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            let pickerStyle = {
                                                                                top: `${rect.top + window.scrollY - 10}px`,
                                                                                left: `${rect.left + window.scrollX + rect.width / 2}px`,
                                                                                transform: 'translate(-50%, -100%)',
                                                                            };
                                                                            if (window.innerWidth < 768) {
                                                                                pickerStyle = {
                                                                                    top: '50%',
                                                                                    left: '50%',
                                                                                    transform: 'translate(-50%, -50%)',
                                                                                };
                                                                            }
                                                                            setPickerColor({ index, color: displayShade, style: pickerStyle }); 
                                                                        }} 
                                                                        title="Editar Color"
                                                                    >
                                                                        {hexValue}
                                                                    </button>
                                                                    <button className={`text-xs capitalize transition-colors hover:underline px-1 truncate w-full max-w-full`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setIsDisplayModeModalVisible(true); }} title="Cambiar formato de color">{displayValue}</button>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-1/2 right-0 h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10" style={{ transform: 'translate(50%, -50%)' }}>
                                                                <button 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onMouseDown={(e) => handleAddButtonDown(e, index)}
                                                                    onMouseUp={(e) => handleAddButtonUp(e, index)}
                                                                    onTouchStart={(e) => handleAddButtonDown(e, index)}
                                                                    onTouchEnd={(e) => handleAddButtonUp(e, index)}
                                                                    onMouseLeave={() => clearTimeout(longPressTimer.current)}
                                                                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 border border-black/20 text-black shadow-lg hover:scale-110 transition-transform" 
                                                                    title="Añadir color (mantén presionado para más)"
                                                                >
                                                                    <Plus size={16}/>
                                                                </button>
                                                            </div>
                                                            {activeShadeIndex === index && (<div className="absolute inset-0 flex flex-col z-30 animate-fade-in" onClick={(e) => e.stopPropagation()}>{generateShades(baseColorForShades).map((shade, shadeIndex) => (<div key={shadeIndex} className="flex-1 hover:brightness-125 cursor-pointer transition-all flex items-center justify-center relative group/shade" style={{ backgroundColor: shade }} onClick={(e) => { e.stopPropagation(); replaceColorInPalette(index, shade); setActiveShadeIndex(null); }} title={`Usar ${shade.toUpperCase()}`} >{shade.toLowerCase() === baseColorForShades.toLowerCase() && <div className="w-2 h-2 rounded-full bg-white/70 ring-2 ring-black/20 pointer-events-none"></div>}<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm bg-black/50 px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover/shade:opacity-100" style={{color: tinycolor(shade).isLight() ? '#000' : '#FFF'}}>{shade.toUpperCase()}</div></div>))}<button onClick={(e) => { e.stopPropagation(); toggleShades(null); }} className="absolute top-2 left-2 p-1 bg-black/20 rounded-full text-white hover:bg-black/50" title="Ocultar tonalidades"><X size={16} /></button></div>)}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                    
                </div>
                
            </section>
            
            {addMenuState.isVisible && (
                <div 
                    className="fixed z-[60]" 
                    style={addMenuState.style}
                >
                    <AddColorMenu
                        onClose={() => setAddMenuState({ isVisible: false, index: 0, style: {} })}
                        onAdd={(count) => insertMultipleColors(addMenuState.index, count)}
                        maxAdd={20 - explorerPalette.length}
                    />
                </div>
            )}
            
            {activeColorMenu && (
                <ColorActionMenu
                    style={activeColorMenu.style}
                    color={explorerPalette[activeColorMenu.index]}
                    isLocked={lockedColors.includes(originalExplorerPalette[activeColorMenu.index])}
                    onClose={() => setActiveColorMenu(null)}
                    onSetAsBrand={() => {
                        handleExplorerColorPick(explorerPalette[activeColorMenu.index]);
                        setActiveColorMenu(null);
                    }}
                    onOpenPicker={() => {
                        setPickerColor({ index: activeColorMenu.index, color: explorerPalette[activeColorMenu.index] });
                        setActiveColorMenu(null);
                    }}
                    onRemove={() => {
                        removeColorFromPalette(activeColorMenu.index);
                        setActiveColorMenu(null);
                    }}
                    onCopy={() => {
                        const color = explorerPalette[activeColorMenu.index];
                        navigator.clipboard.writeText(color);
                        showNotification(`Color ${color.toUpperCase()} copiado!`);
                        setActiveColorMenu(null);
                    }}
                    onToggleLock={() => {
                        toggleLockColor(originalExplorerPalette[activeColorMenu.index]);
                    }}
                />
            )}

            {pickerColor && (
                <ColorPickerPopover 
                    color={pickerColor.color}
                    style={pickerColor.style} 
                    onClose={() => {
                        // --- ¡MODIFICADO! --- Al cerrar (Cancelar), revertimos al color original
                        replaceColorInPalette(pickerColor.index, pickerColor.color);
                        setPickerColor(null);
                    }}
                    // --- ¡AÑADIDO! --- Pasa la función de tiempo real
                    onRealtimeChange={(newColor) => {
                        replaceColorInPalette(pickerColor.index, newColor);
                    }}
                    // --- ¡MODIFICADO! --- onConfirm es Aceptar
                    onConfirm={(newColor) => { 
                        replaceColorInPalette(pickerColor.index, newColor);
                        // (onClose se llama dentro del popover, así que no necesitamos setPickerColor(null) aquí)
                    }}
                />
            )}
            
            {isExpanded && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setActiveShadeIndex(null);}}>
                    <div 
                        className="w-full h-full p-4 flex flex-col items-center justify-center" 
                        onClick={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-4 left-4 flex gap-2 z-30">
                            <button onClick={(e) => { e.stopPropagation(); handleUndo(); }} disabled={!history || historyIndex <= 0} className="text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Deshacer cambio de paleta" ><Undo2 size={24} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleRedo(); }} disabled={!history || historyIndex >= history.length - 1} className="text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Rehacer cambio de paleta" ><Redo2 size={24} /></button>
                        </div>
                        <button onClick={() => {setIsExpanded(false); setActiveShadeIndex(null);}} className="absolute top-4 right-4 text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors z-30"><X size={24} /></button>
                        
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="palette-expanded" direction="horizontal">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="w-full h-full flex items-center overflow-x-auto" style={simulationFilterStyle}>
                                        {explorerPalette.map((color, index) => {
                                            const originalColor = originalExplorerPalette[index];
                                            const isLocked = lockedColors.includes(originalColor);
                                            const displayShade = isLocked ? originalColor : color;
                                            
                                            return (
                                                <Draggable key={"expanded-" + originalColor + index} draggableId={"expanded-" + originalColor + index} index={index}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="relative group h-full flex flex-col items-center justify-end text-white font-bold text-lg" style={{...provided.draggableProps.style, minWidth: '100px', flex: '1 1 0px' }} >
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                className="w-full h-full cursor-grab active:cursor-grabbing" 
                                                                style={{backgroundColor: displayShade}}
                                                                onClick={(e) => handleColorBarClick(e, index)}
                                                            ></div>
                                                            
                                                            {activeColorMenu?.index !== index && (
                                                                <>
                                                                    {displayShade === brandColor && (
                                                                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color de Marca Actual">
                                                                            <Star size={14} className="fill-white" />
                                                                        </div>
                                                                    )}
                                                                    {isLocked && (
                                                                        <div className="absolute top-2 left-2 p-1 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado">
                                                                            <Lock size={12} />
                                                                        </div>
                                                                    )}
                                                                    <div className="text-center transition-opacity duration-300 pointer-events-none absolute bottom-4">
                                                                        <p className="font-mono text-sm hidden sm:block" style={{ color: tinycolor(displayShade).isLight() ? '#000' : '#FFF' }}>{displayShade.toUpperCase()}</p>
                                                                    </div>
                                                                    <button onClick={(e) => {e.stopPropagation(); removeColorFromPalette(index);}} className="absolute top-2 right-2 p-1 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all" title="Quitar color"><X size={16}/></button>
                                                                    <div className="absolute top-1/2 right-0 h-10 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ transform: 'translate(50%, -50%)' }}>
                                                                        <button 
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onMouseDown={(e) => handleAddButtonDown(e, index)}
                                                                            onMouseUp={(e) => handleAddButtonUp(e, index)}
                                                                            onTouchStart={(e) => handleAddButtonDown(e, index)}
                                                                            onTouchEnd={(e) => handleAddButtonUp(e, index)}
                                                                            onMouseLeave={() => clearTimeout(longPressTimer.current)}
                                                                            className="bg-white/80 backdrop-blur-sm rounded-full p-2 border border-black/20 text-black shadow-lg hover:scale-110 transition-transform" 
                                                                            title="Añadir color (mantén presionado para más)"
                                                                        >
                                                                            <Plus size={20}/>
                                                                        </button>
                                                                    </div>
                                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={(e) => { e.stopPropagation(); toggleShades(index); }} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40" title="Ver tonalidades"><div className="w-2 h-2 bg-white rounded-full"></div></button>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {activeShadeIndex === index && (
                                                                <div className="absolute inset-0 flex flex-col z-20 animate-fade-in">
                                                                    {generateShades(baseColorForShades).map((shade, shadeIndex) => (
                                                                        <div key={shadeIndex} className="flex-1 hover:brightness-125 cursor-pointer transition-all flex items-center justify-center relative group/shade" style={{ backgroundColor: shade }} onClick={(e) => { e.stopPropagation(); replaceColorInPalette(index, shade); setActiveShadeIndex(null); }} title={`Usar ${shade.toUpperCase()}`} >
                                                                            {shade.toLowerCase() === baseColorForShades.toLowerCase() && <div className="w-2 h-2 rounded-full bg-white/70 ring-2 ring-black/20 pointer-events-none"></div>}
                                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm bg-black/50 px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover/shade:opacity-100" style={{color: tinycolor(shade).isLight() ? '#000' : '#FFF'}}>{shade.toUpperCase()}</div>
                                                                        </div>
                                                                    ))}
                                                                     <button onClick={(e) => { e.stopPropagation(); toggleShades(null); }} className="absolute top-2 left-2 p-1 bg-black/20 rounded-full text-white hover:bg-black/50" title="Ocultar tonalidades"><X size={16} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            )}
            
            {isDisplayModeModalVisible && (
                <DisplayModeModal
                    currentMode={displayMode}
                    onModeChange={setDisplayMode}
                    onClose={() => setIsDisplayModeModalVisible(false)}
                />
            )}
        </>
    );
};

export default memo(Explorer);