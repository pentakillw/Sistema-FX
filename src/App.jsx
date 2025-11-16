import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts, generationMethods } from './utils/colorUtils.js';
import Explorer from './components/ui/Explorer.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { 
    ExportModal, AccessibilityModal, ComponentPreviewModal, 
    HistoryModal, HelpModal, ConfirmDeleteModal,
    AIPaletteModal, ImagePaletteModal, VariationsModal, PaletteContrastChecker
} from './components/modals/index.jsx';
import { 
    Settings, Type, Upload, Download, RefreshCcw, HelpCircle, 
    User, LogOut, LogIn, Save, FolderOpen,
    Undo2, Redo2, Clock, Sun, Moon, FileCode, Sparkles,
    Wand2, Image as ImageIcon, 
    SlidersHorizontal, Eye, 
    MoreHorizontal, Palette, ShieldCheck, Accessibility, TestTube2,
    Columns3, Rows3
} from 'lucide-react';

import ColorBlindnessSidebar from './components/ui/ColorBlindnessSidebar.jsx';
import SavePaletteSidebar from './components/ui/SavePaletteSidebar.jsx';
import MyPalettesSidebar from './components/ui/MyPalettesSidebar.jsx';
import ColorPickerSidebar from './components/ui/ColorPickerSidebar.jsx';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx';

import ColorActionMenu from './components/ui/ColorActionMenu.jsx'; // <-- ¡NUEVO! Importar el menú aquí

import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx'; 
import TermsOfServicePage from './components/TermsOfServicePage.jsx'; 
import { supabase } from './supabaseClient.js';

// --- ¡COMPONENTE MODIFICADO! ---
// Se elimina la prop `direction` y se añaden clases responsivas
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
            // --- ¡MODIFICADO! ---
            // 'bottom-full' (hacia arriba) por defecto para la barra de navegación móvil.
            // 'md:top-full' (hacia abajo) para la barra de navegación de escritorio.
            // 'md:bottom-auto' resetea la posición 'bottom'.
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} bottom-full mb-2 md:top-full md:mt-2 md:bottom-auto w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 space-y-1 max-h-[60vh] overflow-y-auto`}
            onClick={(e) => { e.stopPropagation(); }}
        >
            {children}
        </div>
    );
};
// --- FIN DE MODIFICACIÓN ---

const MenuButton = ({ icon, label, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-800 hover:bg-gray-100 transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

// --- Funciones simuladas para Capacitor (sin cambios) ---
const Capacitor = {
  isNativePlatform: () => false
};
const Share = {
  share: async () => {
    console.warn("La función de compartir nativa solo está disponible en dispositivos móviles.");
    return Promise.resolve();
  }
};
// --- Fin de funciones simuladas ---

// --- Lógica movida de Explorer (sin cambios) ---
const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'T0': 'Fondo T0',
    'white': 'Fondo Blanco',
    'black': 'Fondo Negro',
    'default': 'Fondo Armonía',
    'card': 'Fondo Tarjeta'
};
// --- FIN LÓGICA MOVIDA ---

const MainApp = memo(({ hook, isNative, user, onLogout, onNavigate }) => {
  const { 
    themeData, font, setFont, brandColor, grayColor, isGrayAuto,
    updateBrandColor, 
    confirmBrandColor, 
    replaceColorInPalette, 
    confirmColorInPalette, 
    saveCurrentStateToHistory, 
    cancelBrandColorUpdate, 
    setGrayColor, setIsGrayAuto,
    handleImport, handleReset, showNotification, 
    handleRandomTheme, handleThemeToggle, 
    handleUndo, handleRedo, history, historyIndex, goToHistoryState,
    lightPreviewMode, setLightPreviewMode, 
    darkPreviewMode, setDarkPreviewMode,
    semanticPreviewMode, setSemanticPreviewMode,
    fxSeparator, setFxSeparator, useFxQuotes, setUseFxQuotes,
    simulationMode, cyclePreviewMode, 
    explorerPalette, 
    originalExplorerPalette, 
    reorderExplorerPalette, 
    explorerGrayShades, 
    handleExplorerColorPick, 
    paletteAdjustments,
    setPaletteAdjustments,
    commitPaletteAdjustments,
    cancelPaletteAdjustments,
    insertColorInPalette, 
    removeColorFromPalette, 
    explorerMethod,
    insertMultipleColors, 
    setExplorerMethod, 
    setSimulationMode, 
    generatePaletteWithAI, 
    applySimulationToPalette, 
    lockedColors,
    toggleLockColor,
    savedPalettes,
    currentPaletteId,
    isLoadingPalettes,
    isSavingPalette,
    deletingPaletteId,
    handleSavePalette,
    handleLoadPalette,
    handleDeletePalette,
    handleSharePalette,
    handleDuplicatePalette,
    handleUpdatePaletteName,
    handleLoadSpecificPalette,
    projects,
    collections,
    filters,
    setFilters,
    handleCreateProject,
    handleUpdateProjectName,
    handleDeleteProject,
    handleCreateCollection,
    handleUpdateCollectionName,
    handleDeleteCollection,
    tags, 
    handleCreateTag 
  } = hook;

  // --- (Estado de Modales sin cambios) ---
  const [isVariationsVisible, setIsVariationsVisible] = useState(false);
  const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
  const [colorModePreview, setColorModePreview] = useState('card');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isMethodMenuVisible, setIsMethodMenuVisible] = useState(false);
  const [isToolsMenuVisible, setIsToolsMenuVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  
  const [activeColorMenu, setActiveColorMenu] = useState(null); // <-- ¡NUEVO! Mover el estado aquí

  // --- ¡MODIFICADO! ---
  // El layout por defecto es 'horizontal' (stack) en móvil, 'vertical' (slices) en desktop.
  const [paletteLayout, setPaletteLayout] = useState(window.innerWidth < 768 ? 'horizontal' : 'vertical');

  const [isAdjusterSidebarVisible, setIsAdjusterSidebarVisible] = useState(false);
  const [isSimulationSidebarVisible, setIsSimulationSidebarVisible] = useState(false);
  const [isSaveSidebarVisible, setIsSaveSidebarVisible] = useState(false);
  const [isMyPalettesSidebarVisible, setIsMyPalettesSidebarVisible] = useState(false);
  
  const [isColorPickerSidebarVisible, setIsColorPickerSidebarVisible] = useState(false);
  const [colorPickerSidebarData, setColorPickerSidebarData] = useState(null); 
  const [isSplitViewActive, setIsSplitViewActive] = useState(false); 
  
  const [exportingPaletteData, setExportingPaletteData] = useState(null);
  
  const [confirmModalState, setConfirmModalState] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const [isConfigMenuVisible, setIsConfigMenuVisible] = useState(false);
  const [isFontMenuVisible, setIsFontMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const importFileRef = useRef(null); 

  // ... (useEffect de 'barra espaciadora' sin cambios) ...
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code !== 'Space') return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'BUTTON')) {
        return;
      }
      e.preventDefault();
      handleRandomTheme();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleRandomTheme]);

  // ... (handleCyclePreviewMode sin cambios) ...
  const handleCyclePreviewMode = () => {
    const options = ['card', 'white', 'black', 'T0', 'T950'];
    const currentIndex = options.indexOf(colorModePreview);
    const nextIndex = (currentIndex + 1) % options.length;
    setColorModePreview(options[nextIndex]);
  };

  // ... (handleNativeExport y handleWebExport sin cambios) ...
  const handleNativeExport = async () => {
    const data = { 
      brandColor: brandColor, 
      grayColor: grayColor, 
      font: font, 
      theme: themeData.theme, 
      isGrayAuto: isGrayAuto,
      explorerPalette: originalExplorerPalette,
      lockedColors: lockedColors,
    };
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      await Share.share({
        title: 'Mi Tema de Color',
        text: 'Aquí está el archivo JSON de mi tema de color.',
        url: `data:application/json;name=mi-tema.json;base64,${base64Data}`,
        dialogTitle: 'Exportar Tema',
      });
    } catch (error) {
       console.log('Share API no disponible o cancelado', error);
       showNotification('La exportación nativa no está disponible en la web.', 'error');
    }
  };
  const handleWebExport = () => {
    const data = { 
      brandColor: brandColor, 
      grayColor: grayColor, 
      font: font, 
      theme: themeData.theme, 
      isGrayAuto: isGrayAuto,
      explorerPalette: originalExplorerPalette,
      lockedColors: lockedColors,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "mi-tema.json";
    link.click();
  };

  // ... (Handlers de menú de config sin cambios) ...
  const handleFontSelect = (fontName) => {
      setFont(fontName);
      setIsFontMenuVisible(false);
      setIsConfigMenuVisible(false);
  };
  const handleImportClick = () => {
      importFileRef.current.click();
      setIsConfigMenuVisible(false);
  };
  const handleExportClick = () => {
      setExportingPaletteData(themeData);
      setIsExportModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleResetClick = () => {
      handleReset();
      setIsConfigMenuVisible(false);
  };
  const handleHelpClick = () => {
      setIsHelpModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleLogoutClick = () => {
      onLogout();
      setIsUserMenuVisible(false);
  };
  
  // ... (closeAllSidebars sin cambios) ...
  const closeAllSidebars = (isConfirming = false) => {
    setIsAdjusterSidebarVisible(false); 
    setIsSimulationSidebarVisible(false);
    setIsSaveSidebarVisible(false);
    setIsMyPalettesSidebarVisible(false);
    setIsColorPickerSidebarVisible(false); 
    setIsSplitViewActive(false); 
    
    if (isColorPickerSidebarVisible && colorPickerSidebarData && !isConfirming) {
      if (colorPickerSidebarData.index === null) {
        hook.cancelBrandColorUpdate(); 
      } else {
        replaceColorInPalette(colorPickerSidebarData.index, colorPickerSidebarData.originalColor);
      }
    }
    
    setColorPickerSidebarData(null); 
    
    if(isAdjusterSidebarVisible) {
        cancelPaletteAdjustments();
    }
    
    setSimulationMode('none'); 
  };

  // ... (handleOpenBrandColorPicker sin cambios) ...
  const handleOpenBrandColorPicker = () => {
    closeAllSidebars();
    setIsAdjusterSidebarVisible(true); 
    setIsSplitViewActive(true); 
  };
  
  // ... (onOpenColorPickerSidebar sin cambios) ...
  const onOpenColorPickerSidebar = (index, originalColor) => {
    closeAllSidebars();
    setColorPickerSidebarData({
        index: index,
        originalColor: originalColor
    });
    setIsColorPickerSidebarVisible(true);
    setIsSplitViewActive(false); 
  };

  // ... (Resto de handlers de sidebars sin cambios) ...
  const handleOpenSimulationSidebar = () => {
    closeAllSidebars();
    setIsSimulationSidebarVisible(true);
  };
  const handleOpenSaveSidebar = () => {
    closeAllSidebars();
    setIsSaveSidebarVisible(true);
  };
  const handleOpenMyPalettesSidebar = () => {
    closeAllSidebars();
    setIsMyPalettesSidebarVisible(true);
  };
  const handleCancelSimulation = () => {
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  const handleApplySimulation = () => {
    applySimulationToPalette();
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  
  // ... (Lógica de Supabase sin cambios) ...
  const onSavePalette = async (saveData) => {
    const success = await handleSavePalette(saveData);
    if (success) {
        setIsSaveSidebarVisible(false); 
    }
  };
  const onLoadPalette = (palette) => {
    handleLoadPalette(palette);
    setIsMyPalettesSidebarVisible(false); 
  };
  const onDeletePalette = (paletteId) => {
    const palette = savedPalettes.find(p => p.id === paletteId);
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Paleta",
        message: `¿De verdad quieres eliminar la paleta "${palette?.name || 'seleccionada'}"? Esta acción no se puede deshacer.`,
        onConfirm: () => {
            handleDeletePalette(paletteId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  const handleExportSpecificPalette = (palette) => {
    const specificThemeData = handleLoadSpecificPalette(palette);
    setExportingPaletteData(specificThemeData);
    setIsExportModalVisible(true);
  };
  const handleDuplicateClick = (paletteId) => {
    handleDuplicatePalette(paletteId);
  };
  const handleUpdateNameClick = (paletteId, newName) => {
    handleUpdatePaletteName(paletteId, newName);
  };
  const onDeleteProject = (projectId, projectName) => {
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Proyecto",
        message: `¿De verdad quieres eliminar el proyecto "${projectName}"? Las paletas dentro de este proyecto NO serán eliminadas, solo desasociadas.`,
        onConfirm: () => {
            handleDeleteProject(projectId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  const onDeleteCollection = (collectionId, collectionName) => {
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Colección",
        message: `¿De verdad quieres eliminar la colección "${collectionName}"? Las paletas dentro de esta colección NO serán eliminadas, solo desasociadas.`,
        onConfirm: () => {
            handleDeleteCollection(collectionId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  // --- FIN LÓGICA SUPABASE ---


  // ... (fallback de 'Cargando...' sin cambios) ...
  if (!themeData || !themeData.stylePalette || !themeData.stylePalette.fullActionColors) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg">Generando sistema de diseño...</p>
      </div>
    );
  }

  // ... (estilo 'pageThemeStyle' sin cambios) ...
  const pageThemeStyle = {
    backgroundColor: '#FFFFFF', 
    color: '#111827', 
    transition: 'background-color 0.3s ease, color 0.3s ease',
    fontFamily: availableFonts[font],
  };

  return (
    <div className="flex flex-col min-h-screen w-full" style={pageThemeStyle}>
      {/* --- (Filtros SVG sin cambios) --- */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="achromatopsia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="protanomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="achromatomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.618, 0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0" /></filter>
        </defs>
      </svg>
      
      <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
      
      {/* --- ¡HEADER MODIFICADO! --- */}
      {/* Movido al fondo en móvil (fixed bottom-0) y vuelve a ser relativo en desktop (md:relative) */}
      {/* Se añade padding inferior 'pb-[env(safe-area-inset-bottom)]' para respetar la barra de iOS */}
      <header 
        className="flex justify-between items-center py-3 px-4 md:px-8 bg-white border-t md:border-t-0 md:border-b border-gray-200 fixed bottom-0 left-0 right-0 z-50 md:relative pb-[env(safe-area-inset-bottom)] md:pb-3"
        style={{ borderColor: 'var(--border-default)'}}
      >
        {/* --- MODIFICADO --- Oculto en móvil (hidden) y visible en desktop (md:flex) */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <img src="https://i.imgur.com/kOfAlJT.png" alt="Colores DaYam Logo" className="h-12 w-12 rounded-lg"/>
          <h1 className="font-pacifico text-rainbow-gradient pb-1">
            Colores DaYam
          </h1>
          {!isSplitViewActive && !isSimulationSidebarVisible && !isColorPickerSidebarVisible && (
            <p className="text-sm text-gray-500 hidden lg:block ml-4">
                ¡ <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">barra espaciadora</kbd> para generar colores!
            </p>
          )}
        </div>
        
        {/* --- MODIFICADO --- 
          - En móvil, ocupa todo el ancho (w-full) y justifica botones (justify-around)
          - En desktop, vuelve a la normalidad (md:w-auto md:justify-end)
        */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-around md:justify-end">
          
          {/* Botones de IA, Método, Imagen (Ocultos en móvil por simplicidad) */}
          <button 
              onClick={() => setIsAIModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-white transition-all hover:opacity-90 active:scale-95" 
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
              title="Generar con IA"
          >
              <Sparkles size={16} strokeWidth={1.75} />
          </button>
          
          <div className="relative hidden md:block"> {/* Oculto en móvil */}
              <button 
                  onClick={() => setIsMethodMenuVisible(true)} 
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Método de Generación"
              >
                  <Wand2 size={16} strokeWidth={1.75}/>
              </button>
                {isMethodMenuVisible && (
                  // --- ¡MODIFICADO! --- Se elimina direction="up"
                  <PopoverMenu onClose={() => setIsMethodMenuVisible(false)}>
                      {generationMethods.map(method => (
                          method.isHeader ? (
                              <div 
                                  key={method.name} 
                                  className="px-3 pt-2 pb-1 text-xs font-bold uppercase text-gray-400 tracking-wider"
                              >
                                  {method.name}
                              </div>
                          ) : (
                              <button 
                                  key={method.id} 
                                  onClick={() => { setExplorerMethod(method.id); setIsMethodMenuVisible(false); }} 
                                  className={`w-full text-left px-3 py-1.5 text-sm ${explorerMethod === method.id ? 'font-bold text-purple-600' : 'text-gray-800'} hover:bg-gray-100 rounded-md`}
                              >
                                  {method.name}
                              </button>
                          )
                      ))}
                  </PopoverMenu>
              )}
          </div>
          <button 
              onClick={() => setIsImageModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Extraer de Imagen"
          >
              <ImageIcon size={16} strokeWidth={1.75} />
          </button>
          
          <button 
              onClick={handleOpenBrandColorPicker} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Ajustar Paleta"
          >
              <SlidersHorizontal size={16} strokeWidth={1.75} /> 
          </button>
          
          {/* --- BOTÓN DE LAYOUT (SOLO DESKTOP) --- */}
          <button 
              onClick={() => setPaletteLayout(p => p === 'vertical' ? 'horizontal' : 'vertical')} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // 'hidden md:flex'
              title={paletteLayout === 'vertical' ? "Vista Horizontal" : "Vista Vertical"}
          >
              {paletteLayout === 'vertical' ? <Rows3 size={16} strokeWidth={1.75} /> : <Columns3 size={16} strokeWidth={1.75} />}
          </button>

          {/* --- BOTÓN DE GENERAR (SOLO MÓVIL, REEMPLAZA FAB) --- */}
          {/* --- ¡MODIFICADO! --- Estilo de botón cambiado a uno simple de ícono */}
          <button 
              onClick={handleRandomTheme} 
              className="text-sm font-medium p-2 rounded-lg flex items-center justify-center gap-1 text-gray-800 hover:bg-gray-100 transition-all active:scale-95 md:hidden" // 'md:hidden'
              title="Generar Aleatorio"
          >
              <Sparkles size={16} strokeWidth={1.75} />
              {/* Se elimina el texto "Generar" para un look de ícono limpio */}
          </button>

          <button 
              onClick={handleOpenSimulationSidebar} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Daltonismo"
          >
              <Eye size={16} strokeWidth={1.75} /> 
          </button>
          <div className="relative hidden md:block"> {/* Oculto en móvil */}
              <button 
                  onClick={() => setIsToolsMenuVisible(p => !p)}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Más herramientas"
              >
                  <MoreHorizontal size={16} strokeWidth={1.75}/>
              </button>
              {isToolsMenuVisible && (
                  // --- ¡MODIFICADO! --- Se elimina direction="up"
                  <PopoverMenu onClose={() => setIsToolsMenuVisible(false)}>
                      <MenuButton icon={<Accessibility size={16} strokeWidth={1.75}/>} label="Accesibilidad" onClick={() => { setIsAccessibilityModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<TestTube2 size={16} strokeWidth={1.75}/>} label="Componentes" onClick={() => { setIsComponentPreviewModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<Palette size={16} strokeWidth={1.75}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<ShieldCheck size={16} strokeWidth={1.75}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                  </PopoverMenu>
              )}
          </div>
          {/* Separador oculto en móvil */}
          <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div> 

          {/* Botones principales de la barra inferior móvil */}
          <button 
              onClick={handleUndo} 
              disabled={!history || historyIndex <= 0}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 hover:bg-gray-100" 
              title="Deshacer"
          >
              <Undo2 size={16} strokeWidth={1.75} />
          </button>
          <button 
              onClick={handleRedo} 
              disabled={!history || historyIndex >= history.length - 1}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 hover:bg-gray-100" 
              title="Rehacer"
          >
              <Redo2 size={16} strokeWidth={1.75} />
          </button>
          <button 
              onClick={() => setIsHistoryModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Historial"
          >
              <Clock size={16} strokeWidth={1.75} />
          </button>
          <button 
              onClick={handleThemeToggle} 
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Alternar tema"
          >
              {themeData.theme === 'light' ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
          </button>
          
          {/* Botón de exportar (ahora es el '...') */}
          <div className="relative md:hidden"> {/* Solo visible en móvil */}
              <button 
                  onClick={() => setIsToolsMenuVisible(p => !p)}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Más herramientas"
              >
                  <MoreHorizontal size={16} strokeWidth={1.75}/>
              </button>
              {isToolsMenuVisible && (
                  // --- ¡MODIFICADO! --- Se elimina direction="up"
                  <PopoverMenu onClose={() => setIsToolsMenuVisible(false)}>
                      <MenuButton icon={<Palette size={16} strokeWidth={1.75}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<ShieldCheck size={16} strokeWidth={1.75}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<Eye size={16} strokeWidth={1.75}/>} label="Daltonismo" onClick={() => { handleOpenSimulationSidebar(); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<Accessibility size={16} strokeWidth={1.75}/>} label="Accesibilidad" onClick={() => { setIsAccessibilityModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<TestTube2 size={16} strokeWidth={1.75}/>} label="Componentes" onClick={() => { setIsComponentPreviewModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <div className="h-px bg-gray-200 my-1"></div>
                      <MenuButton icon={<FileCode size={16} strokeWidth={1.75}/>} label="Exportar" onClick={() => { setExportingPaletteData(themeData); setIsExportModalVisible(true); setIsToolsMenuVisible(false); }} />
                  </PopoverMenu>
              )}
          </div>
          
          <button 
              onClick={() => {
                setExportingPaletteData(themeData);
                setIsExportModalVisible(true);
              }}
              className="text-sm font-medium p-2 rounded-lg hidden md:flex items-center gap-2 text-gray-800 hover:bg-gray-100" // Oculto en móvil
              title="Exportar"
          >
              <FileCode size={16} strokeWidth={1.75} />
          </button>


          <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

          {/* Lógica de Usuario (visible en ambas vistas) */}
          {user ? (
            <>
              <button 
                  onClick={handleOpenSaveSidebar}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title={currentPaletteId ? "Actualizar Paleta" : "Guardar Paleta"}
              >
                  <Save size={16} strokeWidth={1.75} />
              </button>

              <button 
                  onClick={handleOpenMyPalettesSidebar}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Mis Paletas"
              >
                  <FolderOpen size={16} strokeWidth={1.75}/>
              </button>
              
              <div className="relative">
                <button 
                    onClick={() => setIsUserMenuVisible(p => !p)}
                    className="p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                    title="Mi Cuenta"
                >
                    <User size={16} strokeWidth={1.75}/>
                </button>
                {isUserMenuVisible && (
                    // --- ¡MODIFICADO! --- Se elimina direction="up"
                    <PopoverMenu onClose={() => setIsUserMenuVisible(false)}>
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.user_metadata?.name || user.email}</p>
                            <p className="text-xs text-gray-500">Usuario Registrado</p>
                        </div>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <MenuButton icon={<LogOut size={16} strokeWidth={1.75}/>} label="Cerrar Sesión" onClick={handleLogoutClick} />
                    </PopoverMenu>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('auth')}
                className="text-sm font-semibold py-2 px-3 rounded-lg flex items-center gap-2 text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
                title="Iniciar Sesión"
              >
                <LogIn size={14} strokeWidth={1.75} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>

              {/* Botón de Hamburguesa (Config) solo en móvil */}
              <div className="relative md:hidden"> {/* Oculto en desktop */}
                <button 
                    onClick={() => setIsConfigMenuVisible(p => !p)}
                    className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                    title="Ajustes y Ayuda"
                >
                    <Settings size={16} strokeWidth={1.75}/>
                </button>
                {isConfigMenuVisible && (
                    // --- ¡MODIFICADO! --- Se elimina direction="up"
                    <PopoverMenu onClose={() => setIsConfigMenuVisible(false)}>
                        <div className="relative">
                            <MenuButton 
                                icon={<Type size={16} strokeWidth={1.75}/>} 
                                label="Fuente" 
                                onClick={(e) => { e.stopPropagation(); setIsFontMenuVisible(p => !p); }} 
                            />
                            {isFontMenuVisible && (
                                // --- ¡MODIFICADO! --- Se elimina direction="up"
                                <PopoverMenu 
                                    onClose={() => setIsFontMenuVisible(false)} 
                                    align="left"
                                >
                                    {Object.keys(availableFonts).map(fontName => (
                                        <button
                                          key={fontName}
                                          onClick={() => handleFontSelect(fontName)}
                                          className={`w-full text-left px-3 py-2 text-sm ${font === fontName ? 'font-bold text-purple-600' : 'text-gray-800'} hover:bg-gray-100 rounded-md`}
                                          style={{fontFamily: availableFonts[fontName]}}
                                        >
                                            {fontName}
                                        </button>
                                    ))}
                                </PopoverMenu>
                            )}
                        </div>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <MenuButton icon={<Upload size={16} strokeWidth={1.75}/>} label="Importar Tema" onClick={handleImportClick} />
                        <MenuButton icon={<Download size={16} strokeWidth={1.75}/>} label="Exportar Tema" onClick={handleExportClick} />
                        <MenuButton icon={<RefreshCcw size={16} strokeWidth={1.75}/>} label="Reiniciar Tema" onClick={handleResetClick} />
                        <MenuButton icon={<HelpCircle size={16} strokeWidth={1.75}/>} label="Ayuda" onClick={handleHelpClick} />
                    </PopoverMenu>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      
      {/* --- ¡CONTENIDO PRINCIPAL MODIFICADO! --- */}
      {/* Añadido padding-bottom dinámico:
        - pb-20 (normal) para la barra de navegación.
        - pb-[60vh] (cuando el picker está abierto) para empujar el contenido hacia arriba.
      */}
      <div 
        className={`flex-grow md:pb-0 transition-all duration-300 ${
          isColorPickerSidebarVisible ? 'pb-[45vh]' : 'pb-20'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          
          <div className="flex-grow w-full min-w-0">
            <main>
              {/* Se pasa 'paletteLayout' a Explorer */}
              <Explorer 
                explorerPalette={explorerPalette} 
                originalExplorerPalette={originalExplorerPalette} 
                reorderExplorerPalette={reorderExplorerPalette}
                explorerGrayShades={explorerGrayShades}
                handleExplorerColorPick={handleExplorerColorPick}
                setGrayColor={setGrayColor}
                brandColor={brandColor}
                updateBrandColor={updateBrandColor} 
                themeData={themeData}
                insertColorInPalette={insertColorInPalette}
                insertMultipleColors={insertMultipleColors} 
                removeColorFromPalette={removeColorFromPalette}
                explorerMethod={explorerMethod}
                setExplorerMethod={setExplorerMethod}
                replaceColorInPalette={replaceColorInPalette} 
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                history={history}
                historyIndex={historyIndex}
                simulationMode={simulationMode}
                generatePaletteWithAI={generatePaletteWithAI}
                showNotification={showNotification}
                applySimulationToPalette={applySimulationToPalette}
                onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
                onOpenComponentPreviewModal={() => setIsComponentPreviewModalVisible(true)}
                lockedColors={lockedColors}
                toggleLockColor={toggleLockColor}
                isSimulationSidebarVisible={isSimulationSidebarVisible}
                onOpenSimulationSidebar={handleOpenSimulationSidebar}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                colorModePreview={colorModePreview}
                onOpenColorPickerSidebar={onOpenColorPickerSidebar}
                isSplitViewActive={isSplitViewActive}
                paletteLayout={paletteLayout} // <-- ¡Prop se sigue pasando!
                setActiveColorMenu={setActiveColorMenu} // <-- ¡NUEVO! Pasar el setter al Explorer
                isColorPickerSidebarVisible={isColorPickerSidebarVisible} // <-- ¡NUEVO! Pasar esta prop
              />
              
              {/* ... (ColorPreviewer y SemanticPalettes sin cambios) ... */}
              <div className="">
                <div className="">
                  <ColorPreviewer 
                    title="Modo Claro" 
                    themeOverride="light" 
                    previewMode={lightPreviewMode} 
                    onCyclePreviewMode={() => cyclePreviewMode(lightPreviewMode, setLightPreviewMode, ['white', 'T950'])} 
                    onShadeCopy={showNotification}
                    brandColor={brandColor}
                    grayColor={grayColor}
                    isGrayAuto={isGrayAuto}
                    themeData={themeData}
                    updateBrandColor={updateBrandColor} 
                    setGrayColor={setGrayColor}
                    setIsGrayAuto={setIsGrayAuto}
                    simulationMode={simulationMode}
                    handleRandomTheme={handleRandomTheme}
                  />
                  <ColorPreviewer 
                    title="Modo Oscuro" 
                    themeOverride="dark" 
                    previewMode={darkPreviewMode} 
                    onCyclePreviewMode={() => cyclePreviewMode(darkPreviewMode, setDarkPreviewMode, ['black', 'T0'])} 
                    onShadeCopy={showNotification}
                    brandColor={brandColor}
                    grayColor={grayColor}
                    isGrayAuto={isGrayAuto}
                    themeData={themeData}
                    updateBrandColor={updateBrandColor} 
                    setGrayColor={setGrayColor}
                    setIsGrayAuto={setIsGrayAuto}
                    simulationMode={simulationMode}
                    handleRandomTheme={handleRandomTheme}
                  />
                </div>
                <SemanticPalettes 
                  stylePalette={themeData.stylePalette} 
                  onCopy={showNotification} 
                  themeData={themeData} 
                  previewMode={semanticPreviewMode} 
                  onCyclePreviewMode={() => cyclePreviewMode(semanticPreviewMode, setSemanticPreviewMode, ['card', 'white', 'T950', 'black', 'T0'])} 
                  simulationMode={simulationMode} 
                />
              </div>
            </main>
          </div>
          
          {/* --- (Lógica de Sidebars sin cambios) --- */}
          {isAdjusterSidebarVisible && (
            <PaletteAdjusterSidebar
                paletteAdjustments={paletteAdjustments}
                setPaletteAdjustments={setPaletteAdjustments}
                commitPaletteAdjustments={() => {
                    commitPaletteAdjustments();
                    closeAllSidebars(true); 
                }}
                cancelPaletteAdjustments={() => {
                    cancelPaletteAdjustments();
                    closeAllSidebars(false); 
                }}
                setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
                originalExplorerPalette={originalExplorerPalette}
                explorerPalette={explorerPalette}
                lockedColors={lockedColors}
            />
          )}
          {isColorPickerSidebarVisible && colorPickerSidebarData && (
            <ColorPickerSidebar
              key={colorPickerSidebarData.index === null ? 'brand' : colorPickerSidebarData.index}
              initialColor={colorPickerSidebarData.originalColor}
              onClose={() => closeAllSidebars(false)} 
              onRealtimeChange={(newColor) => {
                if (colorPickerSidebarData.index === null) {
                  hook.updateBrandColor(newColor); 
                } else {
                  replaceColorInPalette(colorPickerSidebarData.index, newColor);
                }
              }}
              onConfirm={(newColor) => {
                if (colorPickerSidebarData.index === null) {
                  hook.confirmBrandColor(newColor); 
                } else {
                  confirmColorInPalette(colorPickerSidebarData.index, newColor);
                }
                closeAllSidebars(true); 
              }}
            />
          )}
          {isSimulationSidebarVisible && (
            <ColorBlindnessSidebar
              simulationMode={simulationMode}
              setSimulationMode={setSimulationMode}
              onCancel={closeAllSidebars}
              onApply={handleApplySimulation}
            />
          )}
          {isSaveSidebarVisible && (
            <SavePaletteSidebar
              onClose={closeAllSidebars}
              onSave={onSavePalette}
              isSaving={isSavingPalette}
              initialName={savedPalettes.find(p => p.id === currentPaletteId)?.name || ''}
              currentPaletteId={currentPaletteId}
              projects={projects}
              collections={collections}
              tags={tags} 
              onCreateProject={handleCreateProject}
              onCreateCollection={handleCreateCollection}
              onCreateTag={handleCreateTag} 
            />
          )}
          {isMyPalettesSidebarVisible && (
            <MyPalettesSidebar
              onClose={closeAllSidebars}
              palettes={savedPalettes} 
              isLoading={isLoadingPalettes}
              onLoadPalette={onLoadPalette}
              onDeletePalette={onDeletePalette}
              onDuplicatePalette={handleDuplicateClick}
              onExportPalette={handleExportSpecificPalette}
              onUpdatePaletteName={handleUpdateNameClick}
              deletingId={deletingPaletteId}
              projects={projects}
              collections={collections}
              filters={filters}
              setFilters={setFilters}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProjectName}
              onDeleteProject={onDeleteProject}
              onCreateCollection={handleCreateCollection}
              onUpdateCollection={handleUpdateCollectionName}
              onDeleteCollection={onDeleteCollection}
            />
          )}
        </div>
      </div>

      {/* ... (Banner de Google Ad sin cambios) ... */}
        <div className="my-8 flex justify-center">
          <GoogleAdBanner
            dataAdSlot="3746326433"
            style={{ display: 'block' }}
            dataAdFormat="fluid"
            dataAdLayoutKey="-gw-3+1f-3d+2z"
          />
        </div>

      {/* ... (Footer sin cambios) ... */}
        <footer className="text-center py-8 px-4 md:px-8 border-t text-gray-500" style={{ borderColor: 'var(--border-default)'}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
            <div className="mt-4 flex justify-center items-center gap-3">
              <button 
                onClick={() => onNavigate('privacy')}
                className="text-xs text-gray-500 hover:underline"
              >
                Política de Privacidad
              </button>
              <span className="text-gray-500">|</span>
              <button 
                onClick={() => onNavigate('terms')}
                className="text-xs text-gray-500 hover:underline"
              >
                Términos y Condiciones
              </button>
            </div>
        </footer>

      {/* ... (Notificación y Modales sin cambios) ... */}
        {hook.notification.message && (
          <div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: hook.notification.type === 'error' ? '#EF4444' : '#10B981'}}>{hook.notification.message}</div>
        )}
        
        {isExportModalVisible && 
            <ExportModal 
                onClose={() => {
                  setIsExportModalVisible(false);
                  setExportingPaletteData(null); 
                }}
                themeData={exportingPaletteData || themeData}
                fxSeparator={fxSeparator} 
                setFxSeparator={setFxSeparator} 
                useFxQuotes={useFxQuotes} 
                setUseFxQuotes={setUseFxQuotes} 
                onCopy={showNotification}
                user={user}
                onOpenSaveModal={handleOpenSaveSidebar}
                onOpenMyPalettes={handleOpenMyPalettesSidebar}
                handleSharePalette={handleSharePalette}
            />
        }
        {isAccessibilityModalVisible && <AccessibilityModal onClose={() => setIsAccessibilityModalVisible(false)} accessibility={themeData.accessibility} colors={themeData.accessibilityColors} onCopy={showNotification} />}
        {isComponentPreviewModalVisible && <ComponentPreviewModal onClose={() => setIsComponentPreviewModalVisible(false)} primaryButtonTextColor={themeData.primaryButtonTextColor} />}
        {isHistoryModalVisible && <HistoryModal history={history} onSelect={goToHistoryState} onClose={() => setIsHistoryModalVisible(false)} />}
        {isHelpModalVisible && <HelpModal onClose={() => setIsHelpModalVisible(false)} />}
        
        {confirmModalState.isOpen && (
            <ConfirmDeleteModal
                title={confirmModalState.title}
                message={confirmModalState.message}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                isDeleting={deletingPaletteId === confirmModalState.onConfirm.toString()}
            />
        )}
        
        {isAIModalVisible && ( <AIPaletteModal onClose={() => setIsAIModalVisible(false)} onGenerate={generatePaletteWithAI} /> )}
        {isImageModalVisible && ( <ImagePaletteModal onColorSelect={confirmBrandColor} onClose={() => setIsImageModalVisible(false)} /> )}
        {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={confirmBrandColor} />}
        {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(hex, msg) => showNotification(msg)} />}

        {/* --- ¡NUEVO! --- Renderizar el Menú de Acciones aquí, en la raíz */}
        {activeColorMenu && (
            <ColorActionMenu
                style={activeColorMenu.style}
                color={explorerPalette[activeColorMenu.index]} // Muestra el color en tiempo real
                isLocked={lockedColors.includes(originalExplorerPalette[activeColorMenu.index])} // Bloquea el original
                onClose={() => setActiveColorMenu(null)}
                onSetAsBrand={() => {
                    handleExplorerColorPick(explorerPalette[activeColorMenu.index]);
                    setActiveColorMenu(null);
                }}
                onOpenPicker={() => {
                    onOpenColorPickerSidebar(activeColorMenu.index, originalExplorerPalette[activeColorMenu.index]);
                    setActiveColorMenu(null);
                }}
                onAddAfter={() => {
                    insertColorInPalette(activeColorMenu.index);
                    setActiveColorMenu(null);
                }}
                onRemove={() => {
                    removeColorFromPalette(activeColorMenu.index);
                    setActiveColorMenu(null);
                }}
                onCopy={() => {
                    const color = explorerPalette[activeColorMenu.index];
                    // --- ¡CORRECCIÓN! ---
                    // Usar la función getHexValue que ya tenemos
                    const hexValue = tinycolor(color).toHexString().substring(1).toUpperCase();
                    // --- FIN CORRECCIÓN ---
                    navigator.clipboard.writeText(hexValue);
                    showNotification(`H E X ${hexValue} copiado!`);
                    setActiveColorMenu(null);
                }}
                onToggleLock={() => {
                    toggleLockColor(originalExplorerPalette[activeColorMenu.index]);
                    // No cerramos el menú al bloquear, permitiendo múltiples acciones
                }}
            />
        )}

        {/* --- ¡BLOQUE DE FAB ELIMINADO! --- */}
        {/* El botón de 'Sparkles' ahora está en la barra de menú inferior en móvil */}

    </div>
  );
});


// --- (Función App() principal sin cambios) ---
function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const hook = useThemeGenerator(user); 
  
  const [isNative, setIsNative] = useState(false);
  const [route, setRoute] = useState('landing'); 

  useEffect(() => {
    setLoadingAuth(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
      
      if (session) {
        if (route !== 'generator') {
           setRoute('generator');
        }
      } else {
         if (route !== 'landing' && route !== 'auth' && route !== 'privacy' && route !== 'terms') {
           setRoute('landing');
         }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoadingAuth(false);
        
        if (session) {
            setRoute('generator');
        } else {
            if (route === 'generator') {
                setRoute('landing');
            }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    if (hook.themeData?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [hook.themeData?.theme]);
  
  const handleNavigate = useCallback((newRoute) => {
      setRoute(newRoute);
  }, []);

  const handleLogout = useCallback(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
          hook.showNotification(`Error al cerrar sesión: ${error.message}`, 'error');
      } else {
          setUser(null);
          setSession(null);
          setRoute('landing');
          hook.showNotification('Has cerrado sesión.');
      }
  }, [hook]);
  
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg">Cargando sesión...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen flex flex-col">
      {(() => {
        switch (route) {
          case 'landing':
            return <LandingPage onNavigate={handleNavigate} />;
          case 'auth':
            return <AuthPage onNavigate={handleNavigate} />;
          case 'generator':
            return <MainApp hook={hook} isNative={isNative} user={user} onLogout={handleLogout} onNavigate={handleNavigate}/>;
          
          case 'privacy':
            return <PrivacyPolicyPage onNavigate={handleNavigate} />;
          case 'terms':
            return <TermsOfServicePage onNavigate={handleNavigate} />;
          
          default:
            return <LandingPage onNavigate={handleNavigate} />;
        }
      })()}
    </div>
  );
}

export default App;