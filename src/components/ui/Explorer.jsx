import React, { useState, memo, useRef, useEffect } from 'react';
import { 
    Layers, Settings, Palette, ShieldCheck, Maximize, X, Plus, Image as ImageIcon, 
    Undo2, Redo2, Eye, Sparkles, Accessibility, TestTube2, Pipette, Wand2, 
    Lock, Star, Unlock, Copy, Trash2, 
    ArrowLeftRight, SlidersHorizontal,
    MoreHorizontal
} from 'lucide-react';
import tinycolor from 'tinycolor2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ColorPalette from '../ColorPalette.jsx';
import { 
    VariationsModal, PaletteContrastChecker, ImagePaletteModal, 
    AIPaletteModal, DisplayModeModal
} from '../modals/index.jsx'; 
import { generationMethods, generateShades, findClosestColorName } from '../../utils/colorUtils.js'; 
import { HexColorPicker } from 'react-colorful';
import ColorActionMenu from './ColorActionMenu.jsx';

// Componente para los botones de acción que aparecen al pasar el mouse
const ActionButtonHover = ({ title, onClick, children, iconColor, hoverBg, onMouseDown }) => (
    <button
        onMouseDown={onMouseDown} // Añadido para dragHandleProps
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={title}
        className={`p-2 rounded-lg transition-colors ${iconColor} ${hoverBg}`}
    >
        {children}
    </button>
);


const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'T0': 'Fondo T0',
    'white': 'Fondo Blanco',
    'black': 'Fondo Negro',
    'default': 'Fondo Armonía',
    'card': 'Fondo Tarjeta'
};

// Función helper para obtener el color de fondo correcto
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

// Pop-over para el selector de color
const ColorPickerPopover = ({ color, onChange, onClose }) => {
    const [localColor, setLocalColor] = useState(color);

    const handleOk = () => {
        onChange(localColor);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onClose}>
            <div className="p-4 rounded-xl border shadow-2xl" 
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                 onClick={(e) => e.stopPropagation()}>
                <HexColorPicker color={localColor} onChange={setLocalColor} />
                <div className="flex items-center gap-2 mt-4">
                    <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: localColor, borderColor: 'var(--border-default)' }}></div>
                    <input 
                        type="text"
                        value={localColor.toUpperCase()}
                        onChange={(e) => setLocalColor(e.target.value)}
                        className="w-full font-mono text-sm px-2 py-1 rounded-md border"
                        style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-default)'}}
                    />
                    <button
                        onClick={handleOk}
                        className="text-sm font-semibold px-4 py-1 rounded-md text-white"
                        style={{ backgroundColor: 'var(--action-primary-default)' }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente de Menú Desplegable ---
const PopoverMenu = ({ children, onClose, align = 'right' }) => {
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

// --- Componente de Botón de Menú ---
const MenuButton = ({ icon, label, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-[var(--text-default)] hover:bg-[var(--bg-muted)] transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);


const Explorer = (props) => {
    const { 
        explorerPalette, reorderExplorerPalette, explorerGrayShades, 
        handleExplorerColorPick, setGrayColor,
        brandColor, updateBrandColor, themeData, insertColorInPalette,
        removeColorFromPalette, explorerMethod, setExplorerMethod, replaceColorInPalette,
        handleUndo, handleRedo, history, historyIndex, 
        // --- MODIFICACIÓN --- simulationMode y applySimulationToPalette ya no se usan aquí directamente
        simulationMode,
        generatePaletteWithAI, showNotification,
        applySimulationToPalette, // Lo necesitamos para el botón "Aplicar" del modo expandido
        onOpenAdjuster,
        onOpenAccessibilityModal,
        onOpenComponentPreviewModal,
        lockedColors,
        toggleLockColor,
        isAdjusterSidebarVisible,
        originalExplorerPalette,
        // --- ¡NUEVO! ---
        isSimulationSidebarVisible,
        onOpenSimulationSidebar
    } = props;
    
    // Estado para los modales
    const [isVariationsVisible, setIsVariationsVisible] = useState(false);
    const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
    const [colorModePreview, setColorModePreview] = useState('card');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [activeShadeIndex, setActiveShadeIndex] = useState(null);
    const [isAIModalVisible, setIsAIModalVisible] = useState(false);
    const [baseColorForShades, setBaseColorForShades] = useState(null);
    const [isMethodMenuVisible, setIsMethodMenuVisible] = useState(false);
    // --- MODIFICACIÓN --- Estado de simulación eliminado
    const [pickerColor, setPickerColor] = useState(null); 
    const [activeColorMenu, setActiveColorMenu] = useState(null); 
    const paletteContainerRef = useRef(null);
    
    const [isToolsMenuVisible, setIsToolsMenuVisible] = useState(false);
    
    // Estado para el formato de texto del color
    const [displayMode, setDisplayMode] = useState('name'); // 'name', 'rgb', 'hsl', 'hsb'
    const [isDisplayModeModalVisible, setIsDisplayModeModalVisible] = useState(false);

    // Devuelve el valor de texto inferior (Nombre, RGB, HSL, HSB)
    const getDisplayValue = (colorStr, mode) => {
        const color = tinycolor(colorStr);
        switch (mode) {
            case 'rgb':
                const { r, g, b } = color.toRgb();
                return `RGB: ${r}, ${g}, ${b}`;
            case 'hsl':
                const { h, s, l } = color.toHsl();
                return `HSL: ${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
            case 'hsb': // HSB (o HSV)
                const { h: hsvH, s: hsvS, v: hsvV } = color.toHsv();
                return `HSB: ${Math.round(hsvH)}, ${Math.round(hsvS * 100)}%, ${Math.round(hsvV * 100)}%`;
            case 'name':
            default:
                return findClosestColorName(colorStr);
        }
    };
    
    // Devuelve el valor H E X siempre, para el texto superior.
    const getHexValue = (colorStr) => {
        return tinycolor(colorStr).toHexString().substring(1).toUpperCase();
    }


    if (!themeData || !themeData.stylePalette || !themeData.grayShades) {
        return null; 
    }
    
    // Asignación de colores y funciones
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
    
    const handleCyclePreviewMode = () => {
        const options = ['card', 'white', 'black', 'T0', 'T950'];
        const currentIndex = options.indexOf(colorModePreview);
        const nextIndex = (currentIndex + 1) % options.length;
        setColorModePreview(options[nextIndex]);
    };

    // --- MODIFICACIÓN ---
    // El estilo de filtro ahora depende del simulationMode del hook, 
    // que es controlado por el nuevo sidebar
    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };
    
    // --- MODIFICACIÓN ---
    // La variable de vista dividida ahora depende de CUALQUIER sidebar abierto
    const isSplitView = isAdjusterSidebarVisible || isSimulationSidebarVisible;


    // Abre el menú de acciones para el modo expandido
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
        
        setActiveColorMenu({
            index,
            style: menuStyle 
        });
    };
    

    return (
        <>
            <section 
                ref={paletteContainerRef}
                className={`transition-all duration-300`} 
                style={{ backgroundColor: colorModeBg, borderColor: 'var(--border-default)' }}
            >
                {/* --- BARRA DE CONTROL --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                    
                    <div className="flex-1 min-w-0">
                         <h2 className="font-bold text-lg" style={{ color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>Modo Color</h2>
                        {isAdjusterSidebarVisible ? (
                            <p className="text-sm mt-1" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Previsualizando ajustes...</p>
                        ) : isSimulationSidebarVisible ? (
                            <p className="text-sm mt-1" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Previsualizando simulación...</p>
                        ) : (
                            <p className="text-sm mt-1" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Arrastra, inserta o quita colores.</p>
                        )}
                    </div>
                    
                    {/* Derecha: Botones de Acción */}
                    <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-2 self-end sm:self-auto w-full sm:w-auto">
                        
                        <button
                            onClick={handleCyclePreviewMode}
                            className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2"
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                            title="Alternar fondo de vista previa"
                        >
                            <Layers size={14} /> <span className="hidden sm:inline">{backgroundModeLabels[colorModePreview]}</span>
                        </button>

                        <button onClick={() => setIsAIModalVisible(true)} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2 bg-purple-600 text-white border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400" title="Generar con IA">
                            <Sparkles size={14} /> <span className="hidden sm:inline">IA</span>
                        </button>

                        <select value={explorerMethod} onChange={(e) => setExplorerMethod(e.target.value)} className="hidden sm:block text-sm font-medium py-2 px-3 rounded-lg bg-[var(--bg-muted)] text-[var(--text-default)] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)]" title="Generar por Método">
                            {generationMethods.map(method => (<option key={method.id} value={method.id}>{method.name}</option>))}
                        </select>
                        
                        <div className="relative sm:hidden">
                            <button onClick={() => setIsMethodMenuVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Wand2 size={16}/>
                            </button>
                             {isMethodMenuVisible && (
                                <PopoverMenu onClose={() => setIsMethodMenuVisible(false)}>
                                    {generationMethods.map(method => (
                                       <button key={method.id} onClick={() => { setExplorerMethod(method.id); setIsMethodMenuVisible(false); }} className={`w-full text-left px-4 py-2 text-sm ${explorerMethod === method.id ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)] rounded-md`}>
                                           {method.name}
                                       </button>
                                   ))}
                                </PopoverMenu>
                            )}
                        </div>

                        <button onClick={() => setIsImageModalVisible(true)} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <ImageIcon size={14} /> <span className="hidden sm:inline">Imagen</span>
                        </button>
                        
                        {/* --- MODIFICACIÓN --- Botones de simulación eliminados de aquí */}
                        
                        <button 
                            onClick={() => setIsExpanded(true)} 
                            className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" 
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                            title="Expandir Paleta"
                        >
                            <Maximize size={14} /> 
                            <span className="hidden sm:inline">Expandir</span>
                        </button>
                        
                        <div className="h-5 w-px bg-[var(--border-default)] mx-1"></div>

                        {/* Menú de Herramientas (...) */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsToolsMenuVisible(p => !p)}
                                className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
                                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                                title="Más herramientas"
                            >
                                <MoreHorizontal size={16}/>
                            </button>
                            {isToolsMenuVisible && (
                                <PopoverMenu onClose={() => setIsToolsMenuVisible(false)}>
                                    <MenuButton icon={<SlidersHorizontal size={16}/>} label="Ajustar Paleta" onClick={() => { onOpenAdjuster(); setIsToolsMenuVisible(false); }} />
                                    {/* --- ¡NUEVO! --- Botón de Daltonismo */}
                                    <MenuButton icon={<Eye size={16}/>} label="Daltonismo" onClick={() => { onOpenSimulationSidebar(); setIsToolsMenuVisible(false); }} />
                                    <MenuButton icon={<Accessibility size={16}/>} label="Accesibilidad" onClick={() => { onOpenAccessibilityModal(); setIsToolsMenuVisible(false); }} />
                                    <MenuButton icon={<TestTube2 size={16}/>} label="Componentes" onClick={() => { onOpenComponentPreviewModal(); setIsToolsMenuVisible(false); }} />
                                    <MenuButton icon={<Palette size={16}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                                    <MenuButton icon={<ShieldCheck size={16}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                                </PopoverMenu>
                            )}
                        </div>
                        
                    </div>
                </div>
                
                {/* --- CONTENEDOR DE LA PALETA PRINCIPAL --- */}
                {/* --- MODIFICACIÓN --- El 'simulationFilterStyle' se aplica condicionalmente abajo */}
                <div>
                    {/* Vista "ANTES" (Paleta Original) */}
                    {isSplitView && (
                        <div 
                            className="h-[37.5vh] overflow-hidden" 
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
                    
                    {/* "DESPUÉS" (Paleta Ajustada) o Paleta Única */}
                    <div 
                        className={`overflow-hidden ${isSplitView ? 'h-[37.5vh]' : 'h-[75vh] rounded-b-md'}`}
                        title={isAdjusterSidebarVisible ? "Paleta Ajustada (Tiempo Real)" : (isSimulationSidebarVisible ? "Paleta Simulada" : "Paleta Principal")}
                    >
                        {/* --- ¡LÓGICA CONDICIONAL AQUÍ! --- */}
                        
                        {/* Si estamos ajustando, mostrar la paleta ajustada (draggable) */}
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
                                                                        <button className={`font-mono text-lg font-bold p-1 rounded-lg transition-colors ${hoverBg}`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setPickerColor({ index, color: displayShade }); }} title="Editar Color">{hexValue}</button>
                                                                        <button className={`text-xs capitalize transition-colors hover:underline px-1 truncate w-full max-w-full`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setIsDisplayModeModalVisible(true); }} title="Cambiar formato de color">{displayValue}</button>
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-1/2 right-0 h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10" style={{ transform: 'translateX(50%)' }}><button onClick={(e) => { e.stopPropagation(); insertColorInPalette(index); }} className="bg-white/90 backdrop-blur-sm rounded-full p-1 text-black shadow-lg hover:scale-110 transition-transform" title="Insertar color"><Plus size={16}/></button></div>
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
                        
                        {/* Si estamos simulando, mostrar la paleta original con filtro (no-draggable) */}
                        {isSimulationSidebarVisible && (
                            <div 
                                className={`flex items-center h-full relative group ${isSplitView ? 'rounded-b-md' : 'rounded-md'}`}
                                style={simulationFilterStyle} // ¡El filtro se aplica AQUÍ!
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
                        
                        {/* Si no hay sidebar abierto, mostrar la paleta principal (draggable) */}
                        {!isAdjusterSidebarVisible && !isSimulationSidebarVisible && (
                             <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="palette-main" direction="horizontal">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className={`flex items-center h-full relative group rounded-md`}>
                                            {explorerPalette.map((shade, index) => {
                                                const originalColor = originalExplorerPalette[index]; // Asumimos que explorerPalette y original son iguales aquí
                                                const isLocked = lockedColors.includes(originalColor);
                                                const displayShade = shade; // Es la paleta normal
                                                
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
                                                                        <button className={`font-mono text-lg font-bold p-1 rounded-lg transition-colors ${hoverBg}`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setPickerColor({ index, color: displayShade }); }} title="Editar Color">{hexValue}</button>
                                                                        <button className={`text-xs capitalize transition-colors hover:underline px-1 truncate w-full max-w-full`} style={{ color: textColor, textShadow: textShadow }} onClick={(e) => { e.stopPropagation(); setIsDisplayModeModalVisible(true); }} title="Cambiar formato de color">{displayValue}</button>
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-1/2 right-0 h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10" style={{ transform: 'translateX(50%)' }}><button onClick={(e) => { e.stopPropagation(); insertColorInPalette(index); }} className="bg-white/90 backdrop-blur-sm rounded-full p-1 text-black shadow-lg hover:scale-110 transition-transform" title="Insertar color"><Plus size={16}/></button></div>
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
                </div>
                
                <div className="mt-6 pt-4 border-t px-4 sm:px-6 pb-2" style={{ borderColor: tinycolor(colorModeBg).isLight() ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                     <ColorPalette
                         isExplorer={true}
                         shades={explorerGrayShades}
                         onShadeCopy={setGrayColor}
                         themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'}
                     />
                </div>
            </section>
            
            {/* --- MENÚ EMERGENTE PARA MODO EXPANDIDO --- */}
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


            {/* --- MODAL DE PICKER --- */}
            {pickerColor && (
                <ColorPickerPopover 
                    color={pickerColor.color}
                    onClose={() => setPickerColor(null)}
                    onChange={(newColor) => {
                        replaceColorInPalette(pickerColor.index, newColor);
                    }}
                />
            )}
            
            {/* --- MODO EXPANDIDO (PANTALLA COMPLETA) --- */}
            {isExpanded && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setActiveShadeIndex(null);}}>
                    <div 
                        className="w-full h-full p-4 flex flex-col items-center justify-center" 
                        onClick={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        {/* Botones de deshacer/rehacer */}
                        <div className="absolute top-4 left-4 flex gap-2 z-30">
                            <button onClick={(e) => { e.stopPropagation(); handleUndo(); }} disabled={!history || historyIndex <= 0} className="text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Deshacer cambio de paleta" ><Undo2 size={24} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleRedo(); }} disabled={!history || historyIndex >= history.length - 1} className="text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Rehacer cambio de paleta" ><Redo2 size={24} /></button>
                        </div>
                        {/* Botón de cerrar */}
                        <button onClick={() => {setIsExpanded(false); setActiveShadeIndex(null);}} className="absolute top-4 right-4 text-white bg-black/20 rounded-full p-2 hover:bg-black/40 transition-colors z-30"><X size={24} /></button>
                        
                        {/* Paleta expandida */}
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
                                                                {...provided.dragHandleProps} // El drag handle props se aplica directamente al div de color
                                                                className="w-full h-full cursor-grab active:cursor-grabbing" 
                                                                style={{backgroundColor: displayShade}}
                                                                onClick={(e) => handleColorBarClick(e, index)} // Usa el menú emergente
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
                                                                    <div className="absolute top-1/2 right-0 h-10 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ transform: 'translateX(50%)' }}>
                                                                        <button onClick={(e) => { e.stopPropagation(); insertColorInPalette(index); }} className="bg-white/80 backdrop-blur-sm rounded-full p-1 text-black shadow-lg hover:scale-110 transition-transform" title="Insertar color"><Plus size={20}/></button>
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
            
            {/* --- MODALES --- */}
            {isAIModalVisible && ( <AIPaletteModal onClose={() => setIsAIModalVisible(false)} onGenerate={generatePaletteWithAI} /> )}
            {isImageModalVisible && ( <ImagePaletteModal onColorSelect={updateBrandColor} onClose={() => setIsImageModalVisible(false)} /> )}
            {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={updateBrandColor} />}
            {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(hex, msg) => showNotification(msg)} />}
            
            {/* Modal de Formato de Visualización */}
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