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
    // --- ¡AÑADIDO! ---
    Columns3, Rows3
} from 'lucide-react';

// --- ¡MODIFICADO! ---
// Restaurada la importación de PaletteAdjusterSidebar
import ColorBlindnessSidebar from './components/ui/ColorBlindnessSidebar.jsx';
import SavePaletteSidebar from './components/ui/SavePaletteSidebar.jsx';
import MyPalettesSidebar from './components/ui/MyPalettesSidebar.jsx';
import ColorPickerSidebar from './components/ui/ColorPickerSidebar.jsx';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx'; // <-- ¡NUEVO!

import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx'; 
import TermsOfServicePage from './components/TermsOfServicePage.jsx'; 
import { supabase } from './supabaseClient.js';

// --- Componentes de Menú (sin cambios) ---
const PopoverMenu = ({ children, onClose, align = 'right' }) => {
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
            className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 space-y-1 max-h-[60vh] overflow-y-auto`}
            onClick={(e) => { e.stopPropagation(); }}
        >
            {children}
        </div>
    );
};
const MenuButton = ({ icon, label, onClick, className = "" }) => (
    // ... (código sin cambios) ...
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-800 hover:bg-gray-100 transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);
// --- FIN DE COMPONENTES DE MENÚ ---


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
// ... (código sin cambios) ...
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
    // --- ¡MODIFICADO! ---
    // Se usan las nuevas funciones 'realtime' y 'confirm'
    updateBrandColor, // (realtime)
    confirmBrandColor, // (confirm)
    replaceColorInPalette, // (realtime)
    confirmColorInPalette, // (confirm)
    saveCurrentStateToHistory, // (confirm)
    
    // --- ¡NUEVO! ---
    cancelBrandColorUpdate, // (para el sidebar de "Ajustar Paleta")
    
    setGrayColor, setIsGrayAuto,
    handleImport, handleReset, showNotification, 
    handleRandomTheme, handleThemeToggle, 
    handleUndo, handleRedo, history, historyIndex, goToHistoryState,
    lightPreviewMode, setLightPreviewMode, 
    darkPreviewMode, setDarkPreviewMode,
    semanticPreviewMode, setSemanticPreviewMode,
    fxSeparator, setFxSeparator, useFxQuotes, setUseFxQuotes,
    simulationMode, cyclePreviewMode, 
    
    // --- ¡MODIFICADO! ---
    explorerPalette, // (realtime)
    originalExplorerPalette, // (confirmado)
    
    reorderExplorerPalette, // (confirm)
    explorerGrayShades, 
    handleExplorerColorPick, // (confirm)
    
    // --- ¡RESTAURADO! ---
    // Se necesita la lógica de ajustes
    paletteAdjustments,
    setPaletteAdjustments,
    commitPaletteAdjustments,
    cancelPaletteAdjustments,
    
    insertColorInPalette, // (confirm)
    removeColorFromPalette, // (confirm)
    explorerMethod,
    insertMultipleColors, // (confirm)
    setExplorerMethod, 
    
    setSimulationMode, 
    generatePaletteWithAI, // (confirm)
    applySimulationToPalette, // (confirm)

    // --- ¡ELIMINADO! --- 'commit' y 'cancel' ya no existen
    
    lockedColors,
    toggleLockColor,
    savedPalettes,
    // ... (resto de props de Supabase sin cambios) ...
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
  
  // --- ¡NUEVO! ---
  const [paletteLayout, setPaletteLayout] = useState('vertical'); // 'vertical' (slices) or 'horizontal' (rows)

  // --- ¡MODIFICADO! ---
  // Se restaura 'isAdjusterSidebarVisible'
  const [isAdjusterSidebarVisible, setIsAdjusterSidebarVisible] = useState(false); // <-- ¡RESTAURADO!
  const [isSimulationSidebarVisible, setIsSimulationSidebarVisible] = useState(false);
  const [isSaveSidebarVisible, setIsSaveSidebarVisible] = useState(false);
  const [isMyPalettesSidebarVisible, setIsMyPalettesSidebarVisible] = useState(false);
  
  // --- ¡NUEVO! --- Estado para el único sidebar de color
  const [isColorPickerSidebarVisible, setIsColorPickerSidebarVisible] = useState(false);
  const [colorPickerSidebarData, setColorPickerSidebarData] = useState(null); // { index, originalColor }
  const [isSplitViewActive, setIsSplitViewActive] = useState(false); // Para la vista dividida
  
  
  const [exportingPaletteData, setExportingPaletteData] = useState(null);
  
  const [confirmModalState, setConfirmModalState] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });

  // ... (Estado de menús de header sin cambios) ...
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

  // --- (handleCyclePreviewMode sin cambios) ---
  const handleCyclePreviewMode = () => {
    // ... (código sin cambios) ...
    const options = ['card', 'white', 'black', 'T0', 'T950'];
    const currentIndex = options.indexOf(colorModePreview);
    const nextIndex = (currentIndex + 1) % options.length;
    setColorModePreview(options[nextIndex]);
  };

  // --- (handleNativeExport y handleWebExport sin cambios) ---
  const handleNativeExport = async () => {
    // ... (código sin cambios) ...
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
    // ... (código sin cambios) ...
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

  // --- (Handlers de menú de config sin cambios) ---
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
  
  // --- ¡MODIFICADO! ---
  // Lógica de 'closeAllSidebars' actualizada
  const closeAllSidebars = (isConfirming = false) => {
    // Cierra todos los sidebars
    setIsAdjusterSidebarVisible(false); // <-- ¡AÑADIDO!
    setIsSimulationSidebarVisible(false);
    setIsSaveSidebarVisible(false);
    setIsMyPalettesSidebarVisible(false);
    setIsColorPickerSidebarVisible(false); 
    setIsSplitViewActive(false); // Asegura que la vista dividida se cierre
    
    // Si cerramos el picker CANCELANDO (no confirmando)
    if (isColorPickerSidebarVisible && colorPickerSidebarData && !isConfirming) {
      if (colorPickerSidebarData.index === null) {
        // Si era el Brand Color, revierte al original
        // --- ¡¡¡INICIO DE LA MODIFICACIÓN!!! (del 7/Nov) ---
        // updateBrandColor(colorPickerSidebarData.originalColor); // <-- ELIMINADO (Lento)
        hook.cancelBrandColorUpdate(); // <-- NUEVO (Rápido)
        // --- ¡¡¡FIN DE LA MODIFICACIÓN!!! ---
      } else {
        // Si era un color de la paleta, revierte al original
        replaceColorInPalette(colorPickerSidebarData.index, colorPickerSidebarData.originalColor);
      }
    }
    
    setColorPickerSidebarData(null); // Limpia los datos
    
    // --- ¡MODIFICADO! ---
    // Llama a la función de cancelar ajustes si el sidebar de ajuste estaba abierto
    if(isAdjusterSidebarVisible) {
        cancelPaletteAdjustments();
    }
    
    setSimulationMode('none'); // Resetea el modo simulación
  };

  // --- ¡MODIFICADO! ---
  // Esta función ahora abre el sidebar de AJUSTES GLOBALES
  const handleOpenBrandColorPicker = () => {
    closeAllSidebars();
    // setColorPickerSidebarData({ // <-- ELIMINADO
    //     index: null, 
    //     originalColor: brandColor
    // });
    // setIsColorPickerSidebarVisible(true); // <-- ELIMINADO
    setIsAdjusterSidebarVisible(true); // <-- ¡NUEVO!
    setIsSplitViewActive(true); // Activa la vista dividida
  };
  
  // --- ¡NUEVO! ---
  // Abre el sidebar para editar un color específico de la paleta
  const onOpenColorPickerSidebar = (index, originalColor) => {
    closeAllSidebars();
    setColorPickerSidebarData({
        index: index,
        originalColor: originalColor
    });
    setIsColorPickerSidebarVisible(true);
    setIsSplitViewActive(false); // NO activa la vista dividida
  };


  const handleOpenSimulationSidebar = () => {
    closeAllSidebars();
    setIsSimulationSidebarVisible(true);
  };

  // --- ¡ELIMINADO! --- 'handleOpenAdjusterSidebar' ya no existe

  const handleOpenSaveSidebar = () => {
    closeAllSidebars();
    setIsSaveSidebarVisible(true);
  };

  const handleOpenMyPalettesSidebar = () => {
    closeAllSidebars();
    setIsMyPalettesSidebarVisible(true);
  };
  
  // ... (handleCancelSimulation, handleApplySimulation sin cambios) ...
  const handleCancelSimulation = () => {
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };

  const handleApplySimulation = () => {
    applySimulationToPalette();
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  
  // ... (toda la lógica de Supabase (onSavePalette, onLoadPalette, etc.) sin cambios) ...
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
      
      {/* --- (HEADER) --- */}
      <header 
        className="flex justify-between items-center py-3 px-4 md:px-8 border-b"
        style={{ borderColor: 'var(--border-default)'}}
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <img src="https://i.imgur.com/kOfAlJT.png" alt="Colores DaYam Logo" className="h-12 w-12 rounded-lg"/>
          
          <h1 className="font-pacifico text-rainbow-gradient pb-1">
            Colores DaYam
          </h1>
          
          {/* --- ¡MODIFICADO! --- */}
          {/* Se añade la condición !isColorPickerSidebarVisible */}
          {!isSplitViewActive && !isSimulationSidebarVisible && !isColorPickerSidebarVisible && (
            <p className="text-sm text-gray-500 hidden lg:block ml-4">
                ¡ <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">barra espaciadora</kbd> para generar colores!
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* ... (Botones de IA, Método, Imagen sin cambios) ... */}
          <button 
              onClick={() => setIsAIModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-white transition-all hover:opacity-90 active:scale-95" 
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
              title="Generar con IA"
          >
              <Sparkles size={16} strokeWidth={1.75} />
          </button>
          
          <div className="relative">
              <button 
                  onClick={() => setIsMethodMenuVisible(true)} 
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Método de Generación"
              >
                  <Wand2 size={16} strokeWidth={1.75}/>
              </button>
                {isMethodMenuVisible && (
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
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Extraer de Imagen"
          >
              <ImageIcon size={16} strokeWidth={1.75} />
          </button>
          
          {/* --- ¡MODIFICADO! --- */}
          {/* 'onClick' ahora usa 'handleOpenBrandColorPicker' */}
          <button 
              onClick={handleOpenBrandColorPicker} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Ajustar Paleta"
          >
              <SlidersHorizontal size={16} strokeWidth={1.75} /> 
          </button>
          
          {/* --- ¡NUEVO! --- Botón de Layout */}
          <button 
              onClick={() => setPaletteLayout(p => p === 'vertical' ? 'horizontal' : 'vertical')} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title={paletteLayout === 'vertical' ? "Vista Horizontal" : "Vista Vertical"}
          >
              {paletteLayout === 'vertical' ? <Rows3 size={16} strokeWidth={1.75} /> : <Columns3 size={16} strokeWidth={1.75} />}
          </button>

          {/* ... (Botón de Daltonismo y Menú 'Más' sin cambios) ... */}
          <button 
              onClick={handleOpenSimulationSidebar} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Daltonismo"
          >
              <Eye size={16} strokeWidth={1.75} /> 
          </button>
          <div className="relative">
              <button 
                  onClick={() => setIsToolsMenuVisible(p => !p)}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                  title="Más herramientas"
              >
                  <MoreHorizontal size={16} strokeWidth={1.75}/>
              </button>
              {isToolsMenuVisible && (
                  <PopoverMenu onClose={() => setIsToolsMenuVisible(false)}>
                      <MenuButton icon={<Accessibility size={16} strokeWidth={1.75}/>} label="Accesibilidad" onClick={() => { setIsAccessibilityModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<TestTube2 size={16} strokeWidth={1.75}/>} label="Componentes" onClick={() => { setIsComponentPreviewModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<Palette size={16} strokeWidth={1.75}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<ShieldCheck size={16} strokeWidth={1.75}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                  </PopoverMenu>
              )}
          </div>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {/* ... (Botones de Historial, Tema, Exportar sin cambios) ... */}
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
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Historial"
          >
              <Clock size={16} strokeWidth={1.75} />
          </button>
          <button 
              onClick={handleThemeToggle} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Alternar tema"
          >
              {themeData.theme === 'light' ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
          </button>
          <button 
              onClick={() => {
                setExportingPaletteData(themeData);
                setIsExportModalVisible(true);
              }}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
              title="Exportar"
          >
              <FileCode size={16} strokeWidth={1.75} />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {/* ... (Lógica de Usuario (Guardar, Mis Paletas, Menú de Usuario) sin cambios) ... */}
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
            // ... (Botones de Invitado (Iniciar Sesión, Menú de Config) sin cambios) ...
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

              <div className="relative">
                <button 
                    onClick={() => setIsConfigMenuVisible(p => !p)}
                    className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 text-gray-800 hover:bg-gray-100" 
                    title="Ajustes y Ayuda"
                >
                    <Settings size={16} strokeWidth={1.75}/>
                </button>
                {isConfigMenuVisible && (
                    <PopoverMenu onClose={() => setIsConfigMenuVisible(false)}>
                        <div className="relative">
                            <MenuButton 
                                icon={<Type size={16} strokeWidth={1.75}/>} 
                                label="Fuente" 
                                onClick={(e) => { e.stopPropagation(); setIsFontMenuVisible(p => !p); }} 
                            />
                            {isFontMenuVisible && (
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
      
      {/* --- (CONTENIDO PRINCIPAL) --- */}
      <div className="flex-grow">
        <div className="flex flex-col md:flex-row">
          
          <div className="flex-grow w-full min-w-0">
            <main>
              {/* --- ¡MODIFICADO! ---
                  Se pasan las nuevas props a Explorer
              */}
              <Explorer 
                explorerPalette={explorerPalette} // (realtime)
                originalExplorerPalette={originalExplorerPalette} // (confirmado)
                
                reorderExplorerPalette={reorderExplorerPalette}
                explorerGrayShades={explorerGrayShades}
                handleExplorerColorPick={handleExplorerColorPick}
                setGrayColor={setGrayColor}
                
                brandColor={brandColor}
                updateBrandColor={updateBrandColor} // (realtime)
                
                themeData={themeData}
                insertColorInPalette={insertColorInPalette}
                insertMultipleColors={insertMultipleColors} 
                removeColorFromPalette={removeColorFromPalette}
                explorerMethod={explorerMethod}
                setExplorerMethod={setExplorerMethod}
                
                replaceColorInPalette={replaceColorInPalette} // (realtime)
                
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                history={history}
                historyIndex={historyIndex}
                simulationMode={simulationMode}
                generatePaletteWithAI={generatePaletteWithAI}
                showNotification={showNotification}
                applySimulationToPalette={applySimulationToPalette}
                
                // --- ¡ELIMINADO! --- 'onOpenAdjuster' ya no existe
                
                onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
                onOpenComponentPreviewModal={() => setIsComponentPreviewModalVisible(true)}
                lockedColors={lockedColors}
                toggleLockColor={toggleLockColor}
                
                // --- ¡ELIMINADO! --- 'isAdjusterSidebarVisible' ya no existe
                
                isSimulationSidebarVisible={isSimulationSidebarVisible}
                onOpenSimulationSidebar={handleOpenSimulationSidebar}
                
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                colorModePreview={colorModePreview}
                
                // --- ¡NUEVO! ---
                onOpenColorPickerSidebar={onOpenColorPickerSidebar}
                isSplitViewActive={isSplitViewActive}
                paletteLayout={paletteLayout} // <-- ¡Prop añadida!
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
                    updateBrandColor={updateBrandColor} // Pasa el 'realtime'
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
                    updateBrandColor={updateBrandColor} // Pasa el 'realtime'
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
          
          {/* --- ¡INICIO DE LA LÓGICA DE RENDERIZADO DE SIDEBARS! --- */}
          
          {/* --- ¡RESTAURADO! ---
              Ahora se renderiza el PaletteAdjusterSidebar cuando
              isAdjusterSidebarVisible es true
          */}
          {isAdjusterSidebarVisible && (
            <PaletteAdjusterSidebar
                paletteAdjustments={paletteAdjustments}
                setPaletteAdjustments={setPaletteAdjustments}
                commitPaletteAdjustments={() => {
                    commitPaletteAdjustments();
                    closeAllSidebars(true); // Confirmar cierre
                }}
                cancelPaletteAdjustments={() => {
                    cancelPaletteAdjustments();
                    closeAllSidebars(false); // Cancelar cierre
                }}
                setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
                originalExplorerPalette={originalExplorerPalette}
                explorerPalette={explorerPalette}
                lockedColors={lockedColors}
            />
          )}

          {/* --- ¡MODIFICADO! ---
              El ColorPickerSidebar ahora se renderiza
              solo cuando isColorPickerSidebarVisible es true
          */}
          {isColorPickerSidebarVisible && colorPickerSidebarData && (
            <ColorPickerSidebar
              // 'key' ayuda a React a resetear el estado interno del sidebar
              // cada vez que seleccionamos un color diferente.
              key={colorPickerSidebarData.index === null ? 'brand' : colorPickerSidebarData.index}
              initialColor={colorPickerSidebarData.originalColor}
              onClose={() => closeAllSidebars(false)} // false = Cancelar
              onRealtimeChange={(newColor) => {
                // Actualiza en tiempo real sin guardar en historial
                if (colorPickerSidebarData.index === null) {
                  // Es el Color de Marca
                  // --- ¡MODIFICACIÓN! (del 7/Nov) ---
                  // ¡¡¡ESTO YA NO DEBERÍA OCURRIR, PERO LO DEJAMOS POR SEGURIDAD!!!
                  // El ajuste global ahora usa PaletteAdjusterSidebar
                  hook.updateBrandColor(newColor); // Llama a la función de tiempo real RÁPIDA
                  // --- ¡FIN! ---
                } else {
                  // Es un color de la paleta
                  replaceColorInPalette(colorPickerSidebarData.index, newColor);
                }
              }}
              onConfirm={(newColor) => {
                // Confirma el cambio y guarda en el historial
                if (colorPickerSidebarData.index === null) {
                  // --- ¡MODIFICACIÓN! (del 7/Nov) ---
                  // ¡¡¡ESTO YA NO DEBERÍA OCURRIR!!!
                  hook.confirmBrandColor(newColor); // Llama a la función de confirmación LENTA
                  // --- ¡FIN! ---
                } else {
                  confirmColorInPalette(colorPickerSidebarData.index, newColor);
                }
                closeAllSidebars(true); // true = Confirmar
              }}
            />
          )}
          
          {/* ... (Renderizado de 'ColorBlindnessSidebar', 'SavePaletteSidebar', 'MyPalettesSidebar' sin cambios) ... */}
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
          
          {/* --- FIN DE LA LÓGICA DE RENDERIZADO DE SIDEBARS --- */}

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

        {/* --- ¡MODIFICADO! --- */}
        {/* Se añade la condición !isColorPickerSidebarVisible Y !isAdjusterSidebarVisible */}
        {!isSplitViewActive && !isSimulationSidebarVisible && !isSaveSidebarVisible && !isMyPalettesSidebarVisible && !isColorPickerSidebarVisible && !isAdjusterSidebarVisible && (
          <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 lg:hidden">
            <button
              onClick={() => handleRandomTheme()}
              title="Generar Tema Aleatorio"
              className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg text-white transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)' }}
            >
              <Sparkles size={22} strokeWidth={1.75} />
            </button>
          </div>
        )}
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