import React, { useState, memo, useRef, useEffect } from 'react';
import { 
    Palette, X, Plus, 
    Lock, Star, Unlock, Copy, Trash2, 
    ArrowLeftRight,
    ChevronDown,
    Pipette 
} from 'lucide-react';
import tinycolor from 'tinycolor2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ColorPalette from '../ColorPalette.jsx';
import { 
    DisplayModeModal
} from '../modals/index.jsx'; 
import { generateShades, findClosestColorName } from '../../utils/colorUtils.js'; 
import { colorNameList } from '../../utils/colorNameList.js';
// --- ¡ELIMINADO! --- 'HexColorPicker'
// --- ¡ELIMINADO! --- 'ColorActionMenu'
// import ColorActionMenu from './ColorActionMenu.jsx'; // (Se mantiene para 'isExpanded')


// Componente para el menú de añadir color (sin cambios)
const AddColorMenu = ({ onAdd, onClose, maxAdd }) => {
    // ... (código sin cambios) ...
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
    const counts = [1, 2, 3, 4, 5, +10];
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

// Componente para los botones de acción al pasar el ratón (sin cambios)
const ActionButtonHover = ({ title, onClick, children, iconColor, hoverBg, onMouseDown }) => (
    // ... (código sin cambios) ...
    <button
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={title}
        className={`p-2 rounded-lg transition-colors ${iconColor} ${hoverBg}`}
    >
        {children}
    </button>
);

// Función para obtener el color de fondo del preview (sin cambios)
const getPreviewBgColor = (mode, shades, cardColor) => {
    // ... (código sin cambios) ...
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

// --- ¡ELIMINADO! --- 'ColorSlider' y 'ColorPickerPopover'
// (Se movieron a ColorPickerSidebar.jsx)

// --- (Componentes PopoverMenu y MenuButton) ---
// (Se mantienen para el modo 'isExpanded' - sin cambios)
export const PopoverMenu = ({ children, onClose, align = 'right' }) => {
    // ... (código sin cambios) ...
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
    // ... (código sin cambios) ...
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-[var(--text-default)] hover:bg-[var(--bg-muted)] transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);
// --- FIN POPUP/BUTTON ---

// --- ¡ELIMINADO! --- 'sliderStyles'
// (Se movió a ColorPickerSidebar.jsx)


const Explorer = (props) => {
    const { 
        // --- ¡MODIFICADO! ---
        explorerPalette, // (realtime)
        originalExplorerPalette, // (confirmado)
        
        reorderExplorerPalette, 
        explorerGrayShades, 
        handleExplorerColorPick, 
        setGrayColor,
        brandColor, 
        
        updateBrandColor, // (realtime)
        
        themeData, 
        insertColorInPalette,
        insertMultipleColors, 
        removeColorFromPalette, 
        explorerMethod, 
        setExplorerMethod,
        generatePaletteWithAI, 
        showNotification, 
        applySimulationToPalette,
        
        // --- ¡ELIMINADO! --- 'onOpenAdjuster'
        
        onOpenAccessibilityModal, 
        onOpenComponentPreviewModal,
        onOpenSimulationSidebar,
        
        replaceColorInPalette, // (realtime)
        
        handleUndo, 
        handleRedo, 
        history, 
        historyIndex, 
        simulationMode,
        lockedColors,
        toggleLockColor,
        
        // --- ¡ELIMINADO! --- 'isAdjusterSidebarVisible'
        
        isSimulationSidebarVisible,
        isExpanded,
        setIsExpanded,
        colorModePreview,
        
        // --- ¡NUEVO! ---
        onOpenColorPickerSidebar,
        isSplitViewActive,
        paletteLayout, // <-- ¡Prop recibida!
        setActiveColorMenu, // <-- ¡NUEVO! Recibimos el setter de App.jsx
        isColorPickerSidebarVisible // <-- ¡NUEVO! Recibimos la prop de App.jsx
    } = props;
    
    // --- (Estado local sin cambios) ---
    // --- ¡MODIFICACIÓN! ---
    // Restaurar los estados que borré por error
    const [activeShadeIndex, setActiveShadeIndex] = useState(null);
    const [baseColorForShades, setBaseColorForShades] = useState(null);
    
    // --- ¡ELIMINADO! --- 'pickerColor'
    
    // --- ¡ELIMINADO! --- 'activeColorMenu'
    // const [activeColorMenu, setActiveColorMenu] = useState(null); 
    const paletteContainerRef = useRef(null);
    // --- ¡MODIFICACIÓN! ---
    // Restaurar los estados que borré por error
    const [displayMode, setDisplayMode] = useState('name');
    const [isDisplayModeModalVisible, setIsDisplayModeModalVisible] = useState(false);
    const [addMenuState, setAddMenuState] = useState({ isVisible: false, index: 0, style: {} });
    const longPressTimer = useRef();
    const [isLongPress, setIsLongPress] = useState(false);
    
    // --- (getDisplayValue y getHexValue sin cambios) ---
    const getDisplayValue = (colorStr, mode) => {
        // ... (código sin cambios) ...
        const color = tinycolor(colorStr);
        switch (mode) {
            // --- ¡INICIO DE LA MODIFICACIÓN! ---
            // Se añaden llaves { } para crear un bloque de ámbito para 'const'.
            case 'rgb': {
                const { r, g, b } = color.toRgb();
                return `RGB: ${r}, ${g}, ${b}`;
            }
            case 'hsl': {
                const { h, s, l } = color.toHsl();
                return `HSL: ${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
            }
            case 'hsb': {
                const { h: hsvH, s: hsvS, v: hsvV } = color.toHsv();
                return `HSB: ${Math.round(hsvH)}, ${Math.round(hsvS * 100)}%, ${Math.round(hsvV * 100)}%`;
            }
            // --- ¡FIN DE LA MODIFICACIÓN! ---
            case 'name':
            default:
                return findClosestColorName(colorStr);
        }
    };
    const getHexValue = (colorStr) => {
        // ... (código sin cambios) ...
        return tinycolor(colorStr).toHexString().substring(1).toUpperCase();
    }

    // --- (Lógica de themeData, cardColor, etc. sin cambios) ---
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
            // ¡Usa la paleta 'en tiempo real' para las tonalidades!
            setBaseColorForShades(explorerPalette[index]);
        }
    };
    
    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };
    
    // --- ¡MODIFICADO! ---
    // 'isSplitView' ahora depende de la nueva prop
    const isSplitView = isSplitViewActive || isSimulationSidebarVisible;

    // --- (handleColorBarClick, handleAddButtonDown, handleAddButtonUp sin cambios) ---
    const handleColorBarClick = (e, index) => {
        // ... (código sin cambios) ...
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
        // ... (código sin cambios) ...
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
        // ... (código sin cambios) ...
        e.stopPropagation();
        clearTimeout(longPressTimer.current);
        if (!isLongPress) {
            insertColorInPalette(index);
        }
    };

    // --- ¡NUEVO! ---
    // Detecta si el picker está abierto en la vista de layout móvil
    // Declarado ANTES del return
    const mobilePickerOpen = isColorPickerSidebarVisible && paletteLayout === 'horizontal';

    return (
        <>
            {/* --- ¡ELIMINADO! --- <style>{sliderStyles}</style> */}
            
            <section 
                ref={paletteContainerRef}
                // --- ¡MODIFICADO! ---
                // Se elimina el color de fondo de la sección principal
                className={`transition-all duration-300 ${
                    (isSplitView && paletteLayout === 'horizontal') ? 'flex flex-row' : ''
                }`} 
                style={{ borderColor: 'var(--border-default)' }}
            >
                {/* --- SECCIÓN DE VISTA DIVIDIDA (ORIGINAL) --- */}
                {/* Esta lógica se mantiene, pero ahora usa 'originalExplorerPalette' */}
                {isSplitView && (
                    <div 
                        // --- ¡MODIFICADO! ---
                        // Se añade el color de fondo aquí
                        className={`overflow-hidden ${paletteLayout === 'vertical' ? 'h-[calc((100vh-65px)/2)]' : 'w-1/2 h-[calc(100vh-65px)]'}`}
                        title="Paleta Original (Antes de ajustar)"
                        style={{ backgroundColor: colorModeBg }}
                    >
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable 
                                droppableId="palette-original" 
                                // --- ¡MODIFICADO! ---
                                direction={paletteLayout === 'vertical' ? 'horizontal' : 'vertical'}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        // --- ¡MODIFICADO! ---
                                        className={`flex items-center h-full relative ${paletteLayout === 'horizontal' ? 'flex-col' : ''}`}
                                    >
                                        {/* ¡Usa 'originalExplorerPalette' aquí! */}
                                        {originalExplorerPalette.map((shade, index) => (
                                            <Draggable key={"original-" + shade + index} draggableId={"original-" + shade + index} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        // --- ¡MODIFICADO! ---
                                                        className={`relative flex-1 flex items-center justify-center group/item ${paletteLayout === 'vertical' ? 'h-full' : 'w-full'}`}
                                                        style={{ 
                                                            ...provided.draggableProps.style,
                                                            backgroundColor: shade, 
                                                            minWidth: paletteLayout === 'vertical' ? '50px' : '100%',
                                                            minHeight: paletteLayout === 'horizontal' ? '50px' : '100%',
                                                        }}
                                                    >
                                                        {/* ... (Bloque de Texto y Iconos modificado para layout) ... */}
                                                        <div 
                                                            className={`absolute z-10 flex items-center transition-all duration-200 ${
                                                                paletteLayout === 'vertical' 
                                                                ? 'top-6 left-1/2 -translate-x-1/2 w-full px-2 flex-col gap-1' 
                                                                : 'top-1/2 left-4 -translate-y-1/2 flex-row gap-4'
                                                            }`}
                                                            style={{ pointerEvents: 'none' }} 
                                                        >
                                                            <button 
                                                                className={`font-mono text-xl font-bold p-1 rounded-lg transition-colors`} 
                                                                style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF', textShadow: tinycolor(shade).isLight() ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)', pointerEvents: 'none' }}
                                                            >
                                                                {getHexValue(shade)}
                                                            </button>
                                                            <button 
                                                                className={`text-sm capitalize transition-colors px-1 truncate w-full max-w-full ${
                                                                    paletteLayout === 'horizontal' ? 'max-w-xs' : ''
                                                                }`}
                                                                style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF', textShadow: tinycolor(shade).isLight() ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)', pointerEvents: 'none' }}
                                                            >
                                                                {getDisplayValue(shade, displayMode)}
                                                            </button>
                                                        </div>
                                                        {lockedColors.includes(shade) && (
                                                            <div className={`p-1.5 bg-black/30 rounded-full text-white z-10 ${
                                                                paletteLayout === 'vertical' 
                                                                ? 'absolute top-32 left-1/2 -translate-x-1/2' 
                                                                : 'absolute top-1/2 right-4 -translate-y-1/2' // Mover a la derecha en horizontal
                                                            }`} title="Color Bloqueado">
                                                                <Lock size={12} strokeWidth={1.5} />
                                                            </div>
                                                        )}
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
                
                {/* --- SECCIÓN DE PALETA PRINCIPAL (TIEMPO REAL) --- */}
                <div 
                    // --- ¡MODIFICADO! ---
                    // Se aplica la altura dinámica y el color de fondo aquí
                    className={`overflow-hidden ${
                        mobilePickerOpen ? 'h-[calc(50vh-65px)]' // Picker móvil abierto
                        : (isSplitView ? 'h-[calc((100vh-65px)/2)]' // Vista dividida
                        : 'h-[calc(100vh-65px)]') // Normal
                    } ${isSplitView ? 'rounded-b-md' : 'rounded-md'} ${
                        isSplitView && paletteLayout === 'horizontal' ? 'w-1/2 h-[calc(100vh-65px)]' : ''
                    } ${
                        !isSplitView && paletteLayout === 'horizontal' ? '' : '' // Limpieza de clases redundantes
                    }`}
                    style={{ backgroundColor: colorModeBg }}
                    title={isSplitViewActive ? "Paleta Ajustada (Tiempo Real)" : (isSimulationSidebarVisible ? "Paleta Simulada" : "Paleta Principal")}
                >
                    
                    {/* --- VISTA DE SIMULACIÓN (modificada para layout) --- */}
                    {isSimulationSidebarVisible && (
                        <div 
                            className={`flex items-center h-full relative group ${isSplitView ? 'rounded-b-md' : 'rounded-md'} ${paletteLayout === 'horizontal' ? 'flex-col' : ''}`}
                            style={simulationFilterStyle}
                        >
                            {/* ¡Usa 'originalExplorerPalette' para simular! */}
                            {originalExplorerPalette.map((shade, index) => {
                                // ... (código de renderizado modificado para layout) ...
                                const isLight = tinycolor(shade).isLight();
                                const textColor = isLight ? '#000' : '#FFF';
                                const textShadow = isLight ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)';
                                const hexValue = getHexValue(shade);

                                return (
                                    <div 
                                        key={`sim-${index}`} 
                                        className={`relative flex-1 flex items-center justify-center ${paletteLayout === 'vertical' ? 'h-full' : 'w-full'}`} 
                                        style={{ 
                                            backgroundColor: shade, 
                                            minWidth: paletteLayout === 'vertical' ? '50px' : '100%',
                                            minHeight: paletteLayout === 'horizontal' ? '50px' : '100%',
                                        }}
                                    >
                                        <div 
                                            className={`absolute z-10 flex items-center transition-all duration-200 ${
                                                paletteLayout === 'vertical' 
                                                ? 'top-6 left-1/2 -translate-x-1/2 w-full px-2 flex-col gap-1' 
                                                : 'top-1/2 left-4 -translate-y-1/2 flex-row gap-4'
                                            }`}
                                            style={{ pointerEvents: 'none' }} 
                                        >
                                            <button 
                                                className={`font-mono text-xl font-bold p-1 rounded-lg transition-colors`} 
                                                style={{ color: textColor, textShadow: textShadow, pointerEvents: 'none' }}
                                            >
                                                {hexValue}
                                            </button>
                                            <button 
                                                className={`text-sm capitalize transition-colors px-1 truncate w-full max-w-full ${
                                                    paletteLayout === 'horizontal' ? 'max-w-xs' : ''
                                                }`} 
                                                style={{ color: textColor, textShadow: textShadow, pointerEvents: 'none' }}
                                            >
                                                {getDisplayValue(shade, displayMode)}
                                            </button>
                                        </div>
                                        {lockedColors.includes(shade) && (
                                            <div className={`p-1.5 bg-black/30 rounded-full text-white z-10 ${
                                                paletteLayout === 'vertical' 
                                                ? 'absolute top-32 left-1/2 -translate-x-1/2' 
                                                : 'absolute top-1/2 right-4 -translate-y-1/2'
                                            }`} title="Color Bloqueado">
                                                <Lock size={12} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* --- VISTA NORMAL O DE AJUSTE (TIEMPO REAL) --- */}
                    {!isSimulationSidebarVisible && (
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable 
                                droppableId="palette-main" 
                                // --- ¡MODIFICADO! ---
                                direction={paletteLayout === 'vertical' ? 'horizontal' : 'vertical'}
                            >
                                {(provided) => (
                                    <div 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps} 
                                        // --- ¡MODIFICADO! ---
                                        // Se añade 'overflow-y-auto' cuando está en 'flex-col' (móvil)
                                        className={`flex items-center h-full relative group ${isSplitView ? 'rounded-b-md' : 'rounded-md'} ${paletteLayout === 'horizontal' ? 'flex-col overflow-y-auto' : ''}`}
                                    >
                                        
                                        {/* ¡Usa 'explorerPalette' (tiempo real) aquí! */}
                                        {explorerPalette.map((shade, index) => {
                                            const originalColor = (originalExplorerPalette && originalExplorerPalette[index]) ? originalExplorerPalette[index] : shade;
                                            const isLocked = lockedColors.includes(originalColor);
                                            
                                            // ¡MODIFICADO! 'displayShade' es el color en tiempo real
                                            // 'isLocked' usa el color original
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
                                                        // --- ¡MODIFICADO! ---
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className={`relative flex-1 flex items-center justify-center group/color-wrapper ${paletteLayout === 'vertical' ? 'h-full' : 'w-full'}`} style={{...provided.draggableProps.style}}>
                                                            <div 
                                                                // --- ¡MODIFICADO! ---
                                                                className={`relative group/item w-full h-full flex items-center justify-center transition-colors duration-100 ease-in-out ${paletteLayout === 'vertical' ? 'min-w-[50px]' : 'min-h-[50px]'}`} 
                                                                style={{ 
                                                                    backgroundColor: displayShade, 
                                                                    minWidth: paletteLayout === 'vertical' ? '50px' : '100%',
                                                                    minHeight: paletteLayout === 'horizontal' ? '50px' : '100%',
                                                                }}
                                                                title={displayShade.toUpperCase()}
                                                                onClick={(e) => handleColorBarClick(e, index)} // <-- ¡MODIFICACIÓN! Añadido OnClick
                                                            >
                                                                
                                                                {/* --- ¡INICIO DE MODIFICACIÓN DE LAYOUT! --- */}
                                                                
                                                                {/* Contenedor de Información Estática (Texto, Lock, Star) */}
                                                                <div 
                                                                    className={`absolute z-10 flex items-center transition-all duration-200 ${
                                                                        paletteLayout === 'vertical' 
                                                                        ? 'top-6 left-1/2 -translate-x-1/2 w-full px-2 flex-col gap-1' 
                                                                        : 'top-1/2 left-4 -translate-y-1/2 flex-row gap-4'
                                                                    }`}
                                                                >
                                                                    {/* --- ¡MODIFICADO! --- */}
                                                                    {/* Llama a 'onOpenColorPickerSidebar' */}
                                                                    <button 
                                                                        className={`font-mono text-xl font-bold p-1 rounded-lg transition-colors ${hoverBg}`} 
                                                                        style={{ color: textColor, textShadow: textShadow, pointerEvents: 'auto' }} 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // ¡Llama a la prop de App.jsx!
                                                                            onOpenColorPickerSidebar(index, originalColor); 
                                                                        }} 
                                                                        title="Editar Color"
                                                                    >
                                                                        {hexValue}
                                                                    </button>
                                                                    <button 
                                                                        className={`text-sm capitalize transition-colors hover:underline px-1 truncate w-full max-w-full ${
                                                                            paletteLayout === 'horizontal' ? 'max-w-xs' : '' // Limitar ancho en horizontal
                                                                        }`} 
                                                                        style={{ color: textColor, textShadow: textShadow, pointerEvents: 'auto' }} 
                                                                        onClick={(e) => { e.stopPropagation(); setIsDisplayModeModalVisible(true); }} 
                                                                        title="Cambiar formato de color"
                                                                    >
                                                                        {displayValue}
                                                                    </button>

                                                                    {/* Iconos estáticos */}
                                                                    {displayShade === brandColor && (
                                                                        <div className={`p-1.5 bg-black/30 rounded-full z-10 ${iconColor} opacity-100 transition-opacity duration-200`} title="Color de Marca Actual">
                                                                            <Star size={12} className="fill-current" strokeWidth={1.5} />
                                                                        </div>
                                                                    )}
                                                                    {isLocked && (
                                                                        <div className={`p-1.5 bg-black/30 rounded-full z-10 ${iconColor} opacity-100 transition-opacity duration-200`} title="Color Bloqueado">
                                                                            <Lock size={12} strokeWidth={1.5} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Botones de hover */}
                                                                <div 
                                                                    className={`absolute z-20 flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 ${
                                                                        'hidden md:flex' // <-- ¡MODIFICACIÓN! Ocultar en móvil
                                                                    } ${
                                                                        paletteLayout === 'vertical'
                                                                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col'
                                                                        : 'top-1/2 right-4 -translate-y-1/2 flex-row'
                                                                    }`}
                                                                >
                                                                    <div title="Arrastrar para mover" className={`p-2 rounded-lg cursor-grab ${iconColor} ${hoverBg}`} {...provided.dragHandleProps} onClick={(e) => e.stopPropagation()}>
                                                                        <ArrowLeftRight size={18} strokeWidth={1.5} />
                                                                    </div>
                                                                    <ActionButtonHover title="Usar como Marca" onClick={() => handleExplorerColorPick(displayShade)} iconColor={iconColor} hoverBg={hoverBg}><Star size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Ver Tonalidades" onClick={() => toggleShades(index)} iconColor={iconColor} hoverBg={hoverBg}><Palette size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title="Copiar H E X" onClick={() => { navigator.clipboard.writeText(hexValue); showNotification(`H E X ${hexValue} copiado!`); }} iconColor={iconColor} hoverBg={hoverBg}><Copy size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                    <ActionButtonHover title={isLocked ? "Desbloquear" : "Bloquear"} onClick={() => toggleLockColor(originalColor)} iconColor={iconColor} hoverBg={hoverBg}>{isLocked ? <Lock size={18} strokeWidth={1.5} /> : <Unlock size={18} strokeWidth={1.5} />}</ActionButtonHover>
                                                                    <ActionButtonHover title="Eliminar Color" onClick={() => removeColorFromPalette(index)} iconColor={iconColor} hoverBg={hoverBg}><Trash2 size={18} strokeWidth={1.5} /></ActionButtonHover>
                                                                </div>

                                                                {/* --- ¡FIN DE MODIFICACIÓN DE LAYOUT! --- */}
                                                            </div>
                                                            
                                                            {/* Botón de Añadir (con posición modificada) */}
                                                            <div 
                                                                // --- ¡MODIFICADO! ---
                                                                className={`absolute h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10 ${
                                                                    paletteLayout === 'vertical'
                                                                    ? 'top-1/2 right-0 -translate-y-1/2 translate-x-1/2' // Posición vertical
                                                                    : 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' // Posición horizontal
                                                                }`}
                                                                style={paletteLayout === 'horizontal' ? { height: '20px', width: '100%' } : {}}
                                                            >
                                                                <button 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onMouseDown={(e) => handleAddButtonDown(e, index)}
                                                                    onMouseUp={(e) => handleAddButtonUp(e, index)}
                                                                    onTouchStart={(e) => handleAddButtonDown(e, index)}
                                                                    onTouchEnd={(e) => handleAddButtonUp(e, index)}
                                                                    onMouseLeave={() => clearTimeout(longPressTimer.current)}
                                                                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 border border-black/20 text-black shadow-lg hover:scale-110 transition-transform" 
                                                                    title="Añadir color (mantén presionado para más)"
                                                                    // --- ¡MODIFICADO! ---
                                                                    style={paletteLayout === 'horizontal' ? { transform: 'rotate(90deg)' } : {}} // Girar el icono
                                                                >
                                                                    <Plus size={16}/>
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Tonalidades (con dirección modificada) */}
                                                            {activeShadeIndex === index && (
                                                                <div 
                                                                    // --- ¡MODIFICADO! ---
                                                                    className={`absolute inset-0 flex z-30 animate-fade-in ${
                                                                        paletteLayout === 'vertical' ? 'flex-col' : 'flex-row'
                                                                    }`} 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {generateShades(baseColorForShades).map((shade, shadeIndex) => (
                                                                        <div 
                                                                            key={shadeIndex} 
                                                                            className="flex-1 hover:brightness-125 cursor-pointer transition-all flex items-center justify-center relative group/shade" 
                                                                            style={{ backgroundColor: shade }} 
                                                                            onClick={(e) => { e.stopPropagation(); confirmColorInPalette(index, shade); setActiveShadeIndex(null); }} 
                                                                            title={`Usar ${shade.toUpperCase()}`} 
                                                                        >
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
                    )}
                    
                </div>
                
            </section>
            
            {/* --- RESTO DEL ARCHIVO (MODALES Y POP-UPS) --- */}
            
            {/* ... (AddColorMenu sin cambios) ... */}
            {addMenuState.isVisible && (
                <div 
                    className="fixed z-[60]" 
                    style={addMenuState.style}
                >
                    <AddColorMenu
                        onClose={() => setAddMenuState({ isVisible: false, index: 0, style: {} })}
                        onAdd={(count) => insertMultipleColors(addMenuState.index, count)}
                        maxAdd={15 - explorerPalette.length}
                    />
                </div>
            )}
            
            {/* --- ¡ELIMINADO! --- 
                Se elimina el renderizado de ColorActionMenu de aquí.
                Ahora se maneja en App.jsx
            */}

            {/* --- ¡ELIMINADO! --- 'pickerColor' y 'ColorPickerPopover' */}
            
            {/* ... (Modo 'isExpanded' sin cambios, sigue usando 'activeColorMenu') ... */}
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
                                            const displayShade = color; // Siempre el de tiempo real
                                            
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
                                                            
                                                            {/* ¡NOTA! Este 'activeColorMenu' es SÓLO para el modo expandido (pantalla completa).
                                                              El 'activeColorMenu' principal se renderiza en App.jsx.
                                                              Esta lógica se mantiene.
                                                            */}
                                                            {activeColorMenu?.index !== index && (
                                                                <>
                                                                    <div 
                                                                        className="absolute top-6 left-1/2 -translate-x-1/2 w-full px-2 flex flex-col items-center gap-1 opacity-100 z-10"
                                                                        style={{ pointerEvents: 'none' }}
                                                                    >
                                                                        <p className="font-mono text-xl font-bold" style={{ color: tinycolor(displayShade).isLight() ? '#000' : '#FFF', textShadow: tinycolor(displayShade).isLight() ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)' }}>
                                                                            {getHexValue(displayShade)}
                                                                        </p>
                                                                        <p className="text-sm capitalize" style={{ color: tinycolor(displayShade).isLight() ? '#000' : '#FFF', textShadow: tinycolor(displayShade).isLight() ? '0 1px 2px rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2)' }}>
                                                                            {getDisplayValue(displayShade, displayMode)}
                                                                        </p>
                                                                    </div>
                                                                
                                                                    {displayShade === brandColor && (
                                                                        <div className="absolute top-24 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color de Marca Actual">
                                                                            <Star size={14} className="fill-white" />
                                                                        </div>
                                                                    )}
                                                                    {isLocked && (
                                                                        <div className="absolute top-32 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado">
                                                                            <Lock size={12} />
                                                                        </div>
                                                                    )}

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
                                                                        <div key={shadeIndex} className="flex-1 hover:brightness-125 cursor-pointer transition-all flex items-center justify-center relative group/shade" style={{ backgroundColor: shade }} onClick={(e) => { e.stopPropagation(); confirmColorInPalette(index, shade); setActiveShadeIndex(null); }} title={`Usar ${shade.toUpperCase()}`} >
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
            
            {/* ... (DisplayModeModal sin cambios) ... */}
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