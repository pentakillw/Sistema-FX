import React, { useState, memo, useRef } from 'react';
// --- MODIFICADO --- Importamos Lock y Star
import { Layers, Settings, Palette, ShieldCheck, Maximize, X, Plus, Image as ImageIcon, Undo2, Redo2, Eye, Sparkles, Accessibility, TestTube2, Pipette, Wand2, Lock, Star } from 'lucide-react';
import tinycolor from 'tinycolor2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ColorPalette from '../ColorPalette.jsx';
import { VariationsModal, PaletteContrastChecker, ImagePaletteModal, AIPaletteModal, AccessibilityModal, ComponentPreviewModal } from '../modals/index.jsx';
import { generationMethods, generateShades } from '../../utils/colorUtils.js';
import { HexColorPicker } from 'react-colorful';
import ColorActionMenu from './ColorActionMenu.jsx';

const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'T0': 'Fondo T0',
    'white': 'Fondo Blanco',
    'black': 'Fondo Negro',
    'default': 'Fondo Armonía',
    'card': 'Fondo Tarjeta'
};

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

const ColorPickerPopover = ({ color, onChange, onClose }) => {
    const [localColor, setLocalColor] = useState(color);

    const handleOk = () => {
        onChange(localColor);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={handleOk}>
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


const Explorer = (props) => {
    const {
        explorerPalette, reorderExplorerPalette, explorerGrayShades, 
        handleExplorerColorPick, setGrayColor,
        brandColor, updateBrandColor, themeData, insertColorInPalette,
        removeColorFromPalette, explorerMethod, setExplorerMethod, replaceColorInPalette,
        handleUndo, handleRedo, history, historyIndex, simulationMode,
        setSimulationMode, generatePaletteWithAI, showNotification,
        applySimulationToPalette,
        onOpenAdjuster,
        onOpenAccessibilityModal,
        onOpenComponentPreviewModal,
        lockedColors,
        toggleLockColor,
    } = props;
    
    const [isVariationsVisible, setIsVariationsVisible] = useState(false);
    const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
    const [colorModePreview, setColorModePreview] = useState('card');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [activeShadeIndex, setActiveShadeIndex] = useState(null);
    const [isAIModalVisible, setIsAIModalVisible] = useState(false);
    const [baseColorForShades, setBaseColorForShades] = useState(null);
    const [isMethodMenuVisible, setIsMethodMenuVisible] = useState(false);
    const [isSimulationMenuVisible, setIsSimulationMenuVisible] = useState(false);
    const [pickerColor, setPickerColor] = useState(null); 
    const [activeColorMenu, setActiveColorMenu] = useState(null); 
    const paletteContainerRef = useRef(null);


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
    
    const handleCyclePreviewMode = () => {
        const options = ['card', 'white', 'black', 'T0', 'T950'];
        const currentIndex = options.indexOf(colorModePreview);
        const nextIndex = (currentIndex + 1) % options.length;
        setColorModePreview(options[nextIndex]);
    };

    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };
    
    const simulationOptions = [
        { value: "none", label: "Normal" }, { value: "protanopia", label: "Protanopia" },
        { value: "deuteranopia", label: "Deuteranopia" }, { value: "tritanopia", label: "Tritanopia" },
        { value: "achromatopsia", label: "Acromatopsia" }, { value: "protanomaly", label: "Protanomalía" },
        { value: "deuteranomaly", label: "Deuteranomalía" }, { value: "tritanomaly", label: "Tritanomalía" },
        { value: "achromatomaly", label: "Acromatomalía" }
    ];

    // --- MODIFICACIÓN ---
    // Esta función ahora detecta el tamaño de la ventana.
    // En móvil, no calcula 'top' ni 'left' (el CSS lo fija abajo).
    // En escritorio, calcula 'top' y 'left' como antes.
    const handleColorBarClick = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let menuStyle = {};

        // Solo calcula la posición absoluta en pantallas 'md' (768px) o más grandes
        if (window.innerWidth >= 768) {
            menuStyle = {
                top: `${rect.bottom + window.scrollY + 8}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)',
            };
        }
        
        setActiveColorMenu({
            index,
            style: menuStyle // Pasa el objeto de estilo (vacío en móvil)
        });
    };


    return (
        <>
            <section 
                ref={paletteContainerRef}
                className={`p-4 sm:p-6 rounded-xl border mb-8 transition-all duration-300`} 
                style={{ backgroundColor: colorModeBg, borderColor: 'var(--border-default)' }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg" style={{ color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>Modo Color</h2>
                        <p className="text-sm mt-1" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Arrastra, inserta o quita colores para crear tu paleta.</p>
                    </div>
                    
                    <div className="flex items-center flex-wrap justify-end gap-2 self-end sm:self-auto">
                        <button
                            onClick={handleCyclePreviewMode}
                            className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2"
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                            title="Alternar fondo de vista previa"
                        >
                            <Layers size={14} /> <span className="hidden sm:inline">{backgroundModeLabels[colorModePreview]}</span>
                        </button>
                        <div className="h-5 w-px bg-[var(--border-default)]"></div>
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
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg z-50" onMouseLeave={() => setIsMethodMenuVisible(false)}>
                                    {generationMethods.map(method => (
                                       <button key={method.id} onClick={() => { setExplorerMethod(method.id); setIsMethodMenuVisible(false); }} className={`w-full text-left px-4 py-2 text-sm ${explorerMethod === method.id ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)]`}>
                                           {method.name}
                                       </button>
                                   ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setIsImageModalVisible(true)} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <ImageIcon size={14} /> <span className="hidden sm:inline">Imagen</span>
                        </button>
                        
                        <div className="relative group hidden sm:block">
                            <Eye size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"/>
                            <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value)} className="text-sm font-medium py-2 pl-9 pr-3 rounded-lg appearance-none bg-[var(--bg-muted)] text-[var(--text-default)] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)]" title="Simulador de Daltonismo">
                                {simulationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                         <div className="relative sm:hidden">
                            <button onClick={() => setIsSimulationMenuVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Eye size={16}/>
                            </button>
                             {isSimulationMenuVisible && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg z-50" onMouseLeave={() => setIsSimulationMenuVisible(false)}>
                                    {simulationOptions.map(opt => (
                                       <button key={opt.value} onClick={() => { setSimulationMode(opt.value); setIsSimulationMenuVisible(false); }} className={`w-full text-left px-4 py-2 text-sm ${simulationMode === opt.value ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)]`}>
                                           {opt.label}
                                       </button>
                                   ))}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={applySimulationToPalette} 
                            disabled={simulationMode === 'none'}
                            className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                            title="Aplicar filtro a la paleta"
                        >
                            <Pipette size={14} /> <span className="hidden sm:inline">Aplicar</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsExpanded(true)} 
                            className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" 
                            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                            title="Expandir Paleta"
                        >
                            <Maximize size={14} /> 
                            <span className="hidden sm:inline">Expandir</span>
                        </button>
                    </div>
                </div>


                <div style={simulationFilterStyle}>
                    <div className="overflow-x-auto sm:overflow-x-visible pb-2 -mb-2">
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="palette-main" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex items-center rounded-md h-48 relative group"
                                        style={{ minWidth: `${explorerPalette.length * 50}px` }}
                                    >
                                        {explorerPalette.map((shade, index) => (
                                            <Draggable key={"main-" + shade + index} draggableId={"main-" + shade + index} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="relative h-full flex-1 flex items-center justify-center group/color-wrapper"
                                                        style={{...provided.draggableProps.style}}
                                                    >
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="relative group/item h-full w-full cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform duration-100 ease-in-out"
                                                            style={{ backgroundColor: shade, minWidth: '50px' }}
                                                            onClick={(e) => handleColorBarClick(e, index)}
                                                            title={`Acciones para ${shade.toUpperCase()}`}
                                                        >
                                                            {/* --- NUEVO: Indicador de Color de Marca --- */}
                                                            {shade === brandColor && (
                                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1 bg-black/30 rounded-full text-white z-10" title="Color de Marca Actual">
                                                                    <Star size={10} className="fill-white" />
                                                                </div>
                                                            )}
                                                            
                                                            {lockedColors.includes(shade) && (
                                                                <div className="absolute top-2 left-2 p-1 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado">
                                                                    <Lock size={10} />
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] font-mono opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-20" style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF' }}>
                                                                {shade.substring(1).toUpperCase()}
                                                            </span>
                                                           <button 
                                                                onClick={(e) => {e.stopPropagation(); removeColorFromPalette(index);}}
                                                                className="absolute top-1 right-1 p-0.5 bg-black/30 rounded-full text-white opacity-0 group-hover/item:opacity-100 hover:bg-black/60 transition-opacity z-20"
                                                                title="Quitar color"
                                                            >
                                                                <X size={12}/>
                                                            </button>
                                                        </div>

                                                        <div className="absolute top-0 right-0 h-full w-5 flex items-center justify-center opacity-0 group-hover/color-wrapper:opacity-100 transition-opacity z-10" style={{ transform: 'translateX(50%)' }}>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); insertColorInPalette(index); }} 
                                                                className="bg-white/90 backdrop-blur-sm rounded-full p-0.5 text-black shadow-lg hover:scale-110 transition-transform"
                                                                title="Insertar color"
                                                            >
                                                                <Plus size={14}/>
                                                            </button>
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
                </div>
                
                <div className="mt-6 pt-4 border-t" style={{ borderColor: tinycolor(colorModeBg).isLight() ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-4">
                        <p className="text-sm font-semibold self-start sm:self-center" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Escala de Grises Sugerida</p>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                             <button onClick={onOpenAccessibilityModal} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Accessibility size={14}/> <span className="hidden sm:inline">Accesibilidad</span>
                            </button>
                            <button onClick={onOpenComponentPreviewModal} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <TestTube2 size={14}/> <span className="hidden sm:inline">Componentes</span>
                            </button>
                             <div className="h-5 w-px bg-[var(--border-default)] hidden sm:block"></div>
                            <button onClick={onOpenAdjuster} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Settings size={14} /> <span className="hidden sm:inline">Ajustar</span>
                            </button>
                            <button onClick={() => setIsVariationsVisible(true)} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <Palette size={14} /> <span className="hidden sm:inline">Variaciones</span>
                            </button>
                            <button onClick={() => setIsContrastCheckerVisible(true)} className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                                <ShieldCheck size={14} /> <span className="hidden sm:inline">Contraste</span>
                            </button>
                        </div>
                     </div>
                    <div style={simulationFilterStyle}>
                        <ColorPalette
                            isExplorer={true}
                            shades={explorerGrayShades}
                            onShadeCopy={setGrayColor}
                            themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'}
                        />
                    </div>
                </div>
            </section>
            
            {activeColorMenu && (
                <ColorActionMenu
                    // --- MODIFICADO --- Se pasa el 'style' calculado
                    style={activeColorMenu.style}
                    color={explorerPalette[activeColorMenu.index]}
                    isLocked={lockedColors.includes(explorerPalette[activeColorMenu.index])}
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
                        toggleLockColor(explorerPalette[activeColorMenu.index]);
                    }}
                />
            )}


            {pickerColor && (
                <ColorPickerPopover 
                    color={pickerColor.color}
                    onClose={() => setPickerColor(null)}
                    onChange={(newColor) => {
                        replaceColorInPalette(pickerColor.index, newColor);
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
                                        {explorerPalette.map((color, index) => (
                                            <Draggable key={"expanded-" + color + index} draggableId={"expanded-" + color + index} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} className="relative group h-full flex flex-col items-center justify-end text-white font-bold text-lg" style={{...provided.draggableProps.style, minWidth: '100px', flex: '1 1 0px' }} >
                                                        <div 
                                                            {...provided.dragHandleProps} 
                                                            className="w-full h-full cursor-grab active:cursor-grabbing" 
                                                            style={{backgroundColor: color}}
                                                            onClick={(e) => handleColorBarClick(e, index)}
                                                        ></div>
                                                        
                                                        {activeColorMenu?.index !== index && (
                                                            <>
                                                                {/* --- NUEVO: Indicador de Color de Marca --- */}
                                                                {color === brandColor && (
                                                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 p-1.5 bg-black/30 rounded-full text-white z-10" title="Color de Marca Actual">
                                                                        <Star size={14} className="fill-white" />
                                                                    </div>
                                                                )}
                                                                {lockedColors.includes(color) && (
                                                                    <div className="absolute top-2 left-2 p-1 bg-black/30 rounded-full text-white z-10" title="Color Bloqueado">
                                                                        <Lock size={12} />
                                                                    </div>
                                                                )}
                                                                <div className="text-center transition-opacity duration-300 pointer-events-none absolute bottom-4">
                                                                    <p className="font-mono text-sm hidden sm:block" style={{ color: tinycolor(color).isLight() ? '#000' : '#FFF' }}>{color.toUpperCase()}</p>
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
                                                                        {shade.toLowerCase() === color.toLowerCase() && <div className="w-2 h-2 rounded-full bg-white/70 ring-2 ring-black/20 pointer-events-none"></div>}
                                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm bg-black/50 px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover/shade:opacity-100" style={{color: tinycolor(shade).isLight() ? '#000' : '#FFF'}}>{shade.toUpperCase()}</div>
                                                                    </div>
                                                                ))}
                                                                 <button onClick={(e) => { e.stopPropagation(); toggleShades(null); }} className="absolute top-2 left-2 p-1 bg-black/20 rounded-full text-white hover:bg-black/50" title="Ocultar tonalidades"><X size={16} /></button>
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
                </div>
            )}
            
            {isAIModalVisible && ( <AIPaletteModal onClose={() => setIsAIModalVisible(false)} onGenerate={generatePaletteWithAI} /> )}
            {isImageModalVisible && ( <ImagePaletteModal onColorSelect={updateBrandColor} onClose={() => setIsImageModalVisible(false)} /> )}
            {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={updateBrandColor} />}
            {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(hex, msg) => showNotification(msg)} />}
        </>
    );
};

export default memo(Explorer);
