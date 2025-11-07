import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts, generationMethods } from './utils/colorUtils.js';
import Explorer from './components/ui/Explorer.jsx';
// Se elimina la importación de FloatingActionButtons ya que no se usará
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { 
    ExportModal, AccessibilityModal, ComponentPreviewModal, 
    HistoryModal, HelpModal, ConfirmDeleteModal,
    // --- MODALES MOVIDOS DE EXPLORER ---
    AIPaletteModal, ImagePaletteModal, VariationsModal, PaletteContrastChecker
} from './components/modals/index.jsx';
import { 
    Settings, Type, Upload, Download, RefreshCcw, HelpCircle, 
    User, LogOut, LogIn, Save, FolderOpen,
    Undo2, Redo2, Clock, Sun, Moon, FileCode, Sparkles,
    // --- ICONOS MOVIDOS DE EXPLORER ---
    Layers, Wand2, Image as ImageIcon, Maximize, SlidersHorizontal, Eye, 
    MoreHorizontal, Palette, ShieldCheck, Accessibility, TestTube2
} from 'lucide-react';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx';
import ColorBlindnessSidebar from './components/ui/ColorBlindnessSidebar.jsx';
import SavePaletteSidebar from './components/ui/SavePaletteSidebar.jsx';
import MyPalettesSidebar from './components/ui/MyPalettesSidebar.jsx';
import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx'; 
import TermsOfServicePage from './components/TermsOfServicePage.jsx'; 
import { supabase } from './supabaseClient.js';

// --- Componentes de Menú (sin cambios) ---
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

const MenuButton = ({ icon, label, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-[var(--text-default)] hover:bg-[var(--bg-muted)] transition-colors ${className}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);
// --- FIN DE COMPONENTES DE MENÚ ---


// --- Funciones simuladas para Capacitor ---
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

// --- LÓGICA MOVIDA DE EXPLORER ---
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
    updateBrandColor, setGrayColor, setIsGrayAuto,
    handleImport, handleReset, showNotification, 
    handleRandomTheme, handleThemeToggle, 
    handleUndo, handleRedo, history, historyIndex, goToHistoryState,
    lightPreviewMode, setLightPreviewMode, 
    darkPreviewMode, setDarkPreviewMode,
    semanticPreviewMode, setSemanticPreviewMode,
    fxSeparator, setFxSeparator, useFxQuotes, setUseFxQuotes,
    simulationMode, cyclePreviewMode, 
    explorerPalette, reorderExplorerPalette, explorerGrayShades, 
    handleExplorerColorPick, paletteAdjustments, 
    insertColorInPalette, removeColorFromPalette, explorerMethod, 
    setExplorerMethod, replaceColorInPalette, setSimulationMode, 
    generatePaletteWithAI, applySimulationToPalette,
    setPaletteAdjustments, commitPaletteAdjustments, cancelPaletteAdjustments,
    originalExplorerPalette,
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

  // --- ESTADO MOVIDO DE EXPLORER ---
  const [isVariationsVisible, setIsVariationsVisible] = useState(false);
  const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
  const [colorModePreview, setColorModePreview] = useState('card');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isMethodMenuVisible, setIsMethodMenuVisible] = useState(false);
  const [isToolsMenuVisible, setIsToolsMenuVisible] = useState(false);
  // --- FIN ESTADO MOVIDO ---

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isAdjusterSidebarVisible, setIsAdjusterSidebarVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isSimulationSidebarVisible, setIsSimulationSidebarVisible] = useState(false);

  const [isSaveSidebarVisible, setIsSaveSidebarVisible] = useState(false);
  const [isMyPalettesSidebarVisible, setIsMyPalettesSidebarVisible] = useState(false);
  
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

  // --- HANDLER MOVIDO DE EXPLORER ---
  const handleCyclePreviewMode = () => {
    const options = ['card', 'white', 'black', 'T0', 'T950'];
    const currentIndex = options.indexOf(colorModePreview);
    const nextIndex = (currentIndex + 1) % options.length;
    setColorModePreview(options[nextIndex]);
  };
  // --- FIN HANDLER MOVIDO ---

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

  const handleFontSelect = (fontName) => {
      // ... (código sin cambios) ...
      setFont(fontName);
      setIsFontMenuVisible(false);
      setIsConfigMenuVisible(false);
  };
  const handleImportClick = () => {
      // ... (código sin cambios) ...
      importFileRef.current.click();
      setIsConfigMenuVisible(false);
  };
  const handleExportClick = () => {
      // ... (código sin cambios) ...
      setExportingPaletteData(themeData);
      setIsExportModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleResetClick = () => {
      // ... (código sin cambios) ...
      handleReset();
      setIsConfigMenuVisible(false);
  };
  const handleHelpClick = () => {
      // ... (código sin cambios) ...
      setIsHelpModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleLogoutClick = () => {
      // ... (código sin cambios) ...
      onLogout();
      setIsUserMenuVisible(false);
  };
  
  const closeAllSidebars = () => {
    // ... (código sin cambios) ...
    setIsAdjusterSidebarVisible(false);
    setIsSimulationSidebarVisible(false);
    setIsSaveSidebarVisible(false);
    setIsMyPalettesSidebarVisible(false);
    cancelPaletteAdjustments();
    setSimulationMode('none');
  };

  const handleOpenSimulationSidebar = () => {
    // ... (código sin cambios) ...
    closeAllSidebars();
    setIsSimulationSidebarVisible(true);
  };

  const handleOpenAdjusterSidebar = () => {
    // ... (código sin cambios) ...
    closeAllSidebars();
    setIsAdjusterSidebarVisible(true);
  };

  const handleOpenSaveSidebar = () => {
    // ... (código sin cambios) ...
    closeAllSidebars();
    setIsSaveSidebarVisible(true);
  };

  const handleOpenMyPalettesSidebar = () => {
    // ... (código sin cambios) ...
    closeAllSidebars();
    setIsMyPalettesSidebarVisible(true);
  };
  
  const handleCancelSimulation = () => {
    // ... (código sin cambios) ...
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };

  const handleApplySimulation = () => {
    // ... (código sin cambios) ...
    applySimulationToPalette();
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  
  const onSavePalette = async (saveData) => {
    // ... (código sin cambios) ...
    const success = await handleSavePalette(saveData);
    if (success) {
        setIsSaveSidebarVisible(false); 
    }
  };
  
  const onLoadPalette = (palette) => {
    // ... (código sin cambios) ...
    handleLoadPalette(palette);
    setIsMyPalettesSidebarVisible(false); 
  };
  
  const onDeletePalette = (paletteId) => {
    // ... (código sin cambios) ...
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
    // ... (código sin cambios) ...
    const specificThemeData = handleLoadSpecificPalette(palette);
    setExportingPaletteData(specificThemeData);
    setIsExportModalVisible(true);
  };
  
  const handleDuplicateClick = (paletteId) => {
    // ... (código sin cambios) ...
    handleDuplicatePalette(paletteId);
  };

  const handleUpdateNameClick = (paletteId, newName) => {
    // ... (código sin cambios) ...
    handleUpdatePaletteName(paletteId, newName);
  };
  
  const onDeleteProject = (projectId, projectName) => {
    // ... (código sin cambios) ...
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
    // ... (código sin cambios) ...
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


  if (!themeData || !themeData.stylePalette || !themeData.stylePalette.fullActionColors) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg">Generando sistema de diseño...</p>
      </div>
    );
  }

  const pageThemeStyle = {
    // ... (código sin cambios) ...
    backgroundColor: themeData.stylePalette.fullBackgroundColors.find(c => c.name === 'Predeterminado').color,
    color: themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color,
    transition: 'background-color 0.3s ease, color 0.3s ease',
    fontFamily: availableFonts[font],
  };

  return (
    <div className="flex flex-col min-h-screen w-full" style={pageThemeStyle}>
      {/* ... (SVG filters sin cambios) ... */}
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
      
      <header 
        className="flex justify-between items-center py-3 px-4 md:px-8 border-b"
        style={{ borderColor: 'var(--border-default)'}}
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-10 w-10 rounded-lg"/>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-default)' }}>Sistema FX</h1>
          
          {!isAdjusterSidebarVisible && !isSimulationSidebarVisible && (
            <p className="text-sm text-[var(--text-muted)] hidden lg:block ml-4">
                ¡Pulsa la <kbd className="px-2 py-1 text-xs font-semibold text-[var(--text-default)] bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-md">barra espaciadora</kbd> para generar colores!
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* --- INICIO DE MODIFICACIÓN: Iconos de Explorer movidos aquí --- */}
          <button
              onClick={handleCyclePreviewMode}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title={`Fondo: ${backgroundModeLabels[colorModePreview]}`}
          >
              <Layers size={16} />
          </button>
          <button 
              onClick={() => setIsAIModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 bg-purple-600 text-white border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400" 
              title="Generar con IA"
          >
              <Sparkles size={16} />
          </button>
          <div className="relative">
              <button 
                  onClick={() => setIsMethodMenuVisible(true)} 
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
                  style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                  title="Método de Generación"
              >
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
          <button 
              onClick={() => setIsImageModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Extraer de Imagen"
          >
              <ImageIcon size={16} />
          </button>
          <button 
              onClick={() => setIsExpanded(true)} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Expandir Paleta"
          >
              <Maximize size={16} /> 
          </button>
          <button 
              onClick={handleOpenAdjusterSidebar} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Ajustar Paleta"
          >
              <SlidersHorizontal size={16} /> 
          </button>
          <button 
              onClick={handleOpenSimulationSidebar} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Daltonismo"
          >
              <Eye size={16} /> 
          </button>
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
                      <MenuButton icon={<Accessibility size={16}/>} label="Accesibilidad" onClick={() => { setIsAccessibilityModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<TestTube2 size={16}/>} label="Componentes" onClick={() => { setIsComponentPreviewModalVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<Palette size={16}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                      <MenuButton icon={<ShieldCheck size={16}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                  </PopoverMenu>
              )}
          </div>
          <div className="h-6 w-px bg-[var(--border-default)] mx-1"></div>
          {/* --- FIN DE MODIFICACIÓN --- */}

          <button 
              onClick={handleUndo} 
              disabled={!history || historyIndex <= 0}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Deshacer"
          >
              <Undo2 size={16} />
          </button>
          <button 
              onClick={handleRedo} 
              disabled={!history || historyIndex >= history.length - 1}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Rehacer"
          >
              <Redo2 size={16} />
          </button>
          <button 
              onClick={() => setIsHistoryModalVisible(true)} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Historial"
          >
              <Clock size={16} />
          </button>
          <button 
              onClick={handleThemeToggle} 
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Alternar tema"
          >
              {themeData.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button 
              onClick={() => {
                setExportingPaletteData(themeData);
                setIsExportModalVisible(true);
              }}
              className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
              title="Exportar"
          >
              <FileCode size={16} />
          </button>

          <div className="h-6 w-px bg-[var(--border-default)] mx-1"></div>

          {user ? (
            <>
              <button 
                  onClick={handleOpenSaveSidebar}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
                  style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                  title={currentPaletteId ? "Actualizar Paleta" : "Guardar Paleta"}
              >
                  <Save size={16} />
              </button>

              <button 
                  onClick={handleOpenMyPalettesSidebar}
                  className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
                  style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                  title="Mis Paletas"
              >
                  <FolderOpen size={16}/>
              </button>
              
              <div className="relative">
                <button 
                    onClick={() => setIsUserMenuVisible(p => !p)}
                    className="p-2 rounded-lg flex items-center gap-2" 
                    style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                    title="Mi Cuenta"
                >
                    <User size={16}/>
                </button>
                {isUserMenuVisible && (
                    <PopoverMenu onClose={() => setIsUserMenuVisible(false)}>
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-[var(--text-default)] truncate">{user.user_metadata?.name || user.email}</p>
                            <p className="text-xs text-[var(--text-muted)]">Usuario Registrado</p>
                        </div>
                        <div className="h-px bg-[var(--border-default)] my-1"></div>
                        <MenuButton icon={<LogOut size={16}/>} label="Cerrar Sesión" onClick={handleLogoutClick} />
                    </PopoverMenu>
                )}
              </div>
            </>
          ) : (
            // Botones de Invitado
            <>
              <button 
                onClick={() => onNavigate('auth')}
                className="text-sm font-semibold py-2 px-3 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: 'var(--action-primary-default)', color: 'white' }}
                title="Iniciar Sesión"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>

              <div className="relative">
                <button 
                    onClick={() => setIsConfigMenuVisible(p => !p)}
                    className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" 
                    style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                    title="Ajustes y Ayuda"
                >
                    <Settings size={16}/>
                </button>
                {isConfigMenuVisible && (
                    <PopoverMenu onClose={() => setIsConfigMenuVisible(false)}>
                        <div className="relative">
                            <MenuButton 
                                icon={<Type size={16}/>} 
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
                                          className={`w-full text-left px-3 py-2 text-sm ${font === fontName ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)] rounded-md`}
                                          style={{fontFamily: availableFonts[fontName]}}
                                        >
                                            {fontName}
                                        </button>
                                    ))}
                                </PopoverMenu>
                            )}
                        </div>
                        <div className="h-px bg-[var(--border-default)] my-1"></div>
                        <MenuButton icon={<Upload size={16}/>} label="Importar Tema" onClick={handleImportClick} />
                        <MenuButton icon={<Download size={16}/>} label="Exportar Tema" onClick={handleExportClick} />
                        <MenuButton icon={<RefreshCcw size={16}/>} label="Reiniciar Tema" onClick={handleResetClick} />
                        <MenuButton icon={<HelpCircle size={16}/>} label="Ayuda" onClick={handleHelpClick} />
                    </PopoverMenu>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      
      <div className="flex-grow">
        
        <div className="flex flex-col md:flex-row md:gap-4">
          
          <div className="flex-grow w-full min-w-0">
            <main>
              <Explorer 
                explorerPalette={explorerPalette}
                reorderExplorerPalette={reorderExplorerPalette}
                explorerGrayShades={explorerGrayShades}
                handleExplorerColorPick={handleExplorerColorPick}
                setGrayColor={setGrayColor}
                paletteAdjustments={paletteAdjustments}
                brandColor={brandColor}
                updateBrandColor={updateBrandColor}
                themeData={themeData}
                insertColorInPalette={insertColorInPalette}
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
                onOpenAdjuster={handleOpenAdjusterSidebar}
                onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
                onOpenComponentPreviewModal={() => setIsComponentPreviewModal(true)}
                lockedColors={lockedColors}
                toggleLockColor={toggleLockColor}
                isAdjusterSidebarVisible={isAdjusterSidebarVisible}
                originalExplorerPalette={originalExplorerPalette}
                isSimulationSidebarVisible={isSimulationSidebarVisible}
                onOpenSimulationSidebar={handleOpenSimulationSidebar}
                // --- PROPS MOVIDAS ---
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                colorModePreview={colorModePreview}
                // --- FIN PROPS MOVIDAS ---
              />
              
              <div className="px-4 md:px-8">
                <div className="space-y-6 mb-8">
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
          
          {isAdjusterSidebarVisible && (
            <PaletteAdjusterSidebar
              paletteAdjustments={paletteAdjustments}
              setPaletteAdjustments={setPaletteAdjustments}
              commitPaletteAdjustments={commitPaletteAdjustments}
              cancelPaletteAdjustments={closeAllSidebars}
              setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
              originalExplorerPalette={originalExplorerPalette}
              explorerPalette={explorerPalette}
              lockedColors={lockedColors}
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

        <div className="px-4 md:px-8 my-8 flex justify-center">
          <GoogleAdBanner
            dataAdClient={import.meta.env.VITE_GOOGLE_AD_CLIENT}
            dataAdSlot="3746326433"
            style={{ display: 'block' }}
            dataAdFormat="fluid"
            dataAdLayoutKey="-gw-3+1f-3d+2z"
          />
        </div>

        <footer className="text-center py-8 px-4 md:px-8 border-t" style={{ borderColor: themeData.controlsThemeStyle.borderColor, color: themeData.controlsThemeStyle.color}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
            <div className="mt-4 flex justify-center items-center gap-3">
              <button 
                onClick={() => onNavigate('privacy')}
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              >
                Política de Privacidad
              </button>
              <span className="text-gray-500 dark:text-gray-400">|</span>
              <button 
                onClick={() => onNavigate('terms')}
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              >
                Términos y Condiciones
              </button>
            </div>
        </footer>

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
        
        {/* --- MODALES MOVIDOS DE EXPLORER --- */}
        {isAIModalVisible && ( <AIPaletteModal onClose={() => setIsAIModalVisible(false)} onGenerate={generatePaletteWithAI} /> )}
        {isImageModalVisible && ( <ImagePaletteModal onColorSelect={updateBrandColor} onClose={() => setIsImageModalVisible(false)} /> )}
        {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={updateBrandColor} />}
        {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(hex, msg) => showNotification(msg)} />}
        {/* --- FIN MODALES MOVIDOS --- */}

        {/* --- Botón Flotante (Solo Generar) --- */}
        {!isAdjusterSidebarVisible && !isSimulationSidebarVisible && !isSaveSidebarVisible && !isMyPalettesSidebarVisible && (
          <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40">
            <button
              onClick={() => handleRandomTheme()}
              title="Generar Tema Aleatorio"
              className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg text-white transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ background: 'linear-gradient(to right, var(--action-primary-default), #e11d48)' }}
            >
              <Sparkles size={22} />
            </button>
          </div>
        )}
    </div>
  );
});


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