import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts, generationMethods } from './utils/colorUtils.js';
// ¡Ya no se importa Header, se define uno minimalista aquí!
import Explorer from './components/ui/Explorer.jsx';
import FloatingActionButtons from './components/FloatingActionButtons.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
// Se importa HelpModal y los iconos necesarios para el nuevo header
import { ExportModal, AccessibilityModal, ComponentPreviewModal, HistoryModal, HelpModal } from './components/modals/index.jsx';
import { Settings, Type, Upload, Download, RefreshCcw, HelpCircle, User, LogOut, LogIn } from 'lucide-react';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx';
// --- ¡NUEVO! --- Importamos el nuevo sidebar
import ColorBlindnessSidebar from './components/ui/ColorBlindnessSidebar.jsx';
import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
// ¡LoginBanner ya no se importa!
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx'; 
import TermsOfServicePage from './components/TermsOfServicePage.jsx'; 

// --- ¡NUEVO! --- Componentes de Menú (movidos de Explorer)
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
  } = hook;

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isAdjusterSidebarVisible, setIsAdjusterSidebarVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  // --- ¡NUEVO! --- Estado para el sidebar de simulación
  const [isSimulationSidebarVisible, setIsSimulationSidebarVisible] = useState(false);


  // --- ¡NUEVO! --- Estado para los menús del header
  const [isConfigMenuVisible, setIsConfigMenuVisible] = useState(false);
  const [isFontMenuVisible, setIsFontMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const importFileRef = useRef(null); 
  // --- FIN DE NUEVO ESTADO ---

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

  // --- ¡NUEVO! --- Handlers para los menús del header
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
      handleWebExport();
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
  // --- FIN DE HANDLERS ---
  
  // --- ¡NUEVO! --- Handlers para el nuevo sidebar
  const handleOpenSimulationSidebar = () => {
    setIsSimulationSidebarVisible(true);
    // Asegurarse de que el otro sidebar esté cerrado
    if (isAdjusterSidebarVisible) {
      cancelPaletteAdjustments();
      setIsAdjusterSidebarVisible(false);
    }
  };

  const handleOpenAdjusterSidebar = () => {
    setIsAdjusterSidebarVisible(true);
    // Asegurarse de que el otro sidebar esté cerrado
    if (isSimulationSidebarVisible) {
      setSimulationMode('none');
      setIsSimulationSidebarVisible(false);
    }
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
  // --- FIN DE HANDLERS ---


  if (!themeData || !themeData.stylePalette || !themeData.stylePalette.fullActionColors) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg">Generando sistema de diseño...</p>
      </div>
    );
  }

  const pageThemeStyle = {
    backgroundColor: themeData.stylePalette.fullBackgroundColors.find(c => c.name === 'Predeterminado').color,
    color: themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color,
    transition: 'background-color 0.3s ease, color 0.3s ease',
    fontFamily: availableFonts[font],
  };

  return (
    <div className="flex flex-col min-h-screen w-full" style={pageThemeStyle}>
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
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
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
                          <p className="text-sm font-semibold text-[var(--text-default)] truncate">{user.name || user.email}</p>
                          <p className="text-xs text-[var(--text-muted)]">Usuario Registrado</p>
                      </div>
                      <div className="h-px bg-[var(--border-default)] my-1"></div>
                      <MenuButton icon={<LogOut size={16}/>} label="Cerrar Sesión" onClick={handleLogoutClick} />
                  </PopoverMenu>
              )}
            </div>
          ) : (
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
                // setSimulationMode se pasa al nuevo sidebar, no a Explorer
                generatePaletteWithAI={generatePaletteWithAI}
                showNotification={showNotification}
                applySimulationToPalette={applySimulationToPalette}
                onOpenAdjuster={handleOpenAdjusterSidebar} // --- MODIFICADO ---
                onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
                onOpenComponentPreviewModal={() => setIsComponentPreviewModalVisible(true)}
                lockedColors={lockedColors}
                toggleLockColor={toggleLockColor}
                isAdjusterSidebarVisible={isAdjusterSidebarVisible}
                originalExplorerPalette={originalExplorerPalette}
                // --- ¡NUEVO! --- Props para el sidebar de simulación
                isSimulationSidebarVisible={isSimulationSidebarVisible}
                onOpenSimulationSidebar={handleOpenSimulationSidebar}
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
          
          {/* Renderizado condicional de Sidebars */}
          {isAdjusterSidebarVisible && (
            <PaletteAdjusterSidebar
              paletteAdjustments={paletteAdjustments}
              setPaletteAdjustments={setPaletteAdjustments}
              commitPaletteAdjustments={commitPaletteAdjustments}
              cancelPaletteAdjustments={cancelPaletteAdjustments}
              setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
              originalExplorerPalette={originalExplorerPalette}
              explorerPalette={explorerPalette}
              lockedColors={lockedColors}
            />
          )}
          
          {/* --- ¡NUEVO! --- Renderizado del Sidebar de Simulación */}
          {isSimulationSidebarVisible && (
            <ColorBlindnessSidebar
              simulationMode={simulationMode}
              setSimulationMode={setSimulationMode}
              onCancel={handleCancelSimulation}
              onApply={handleApplySimulation}
            />
          )}

        </div>
      </div>

        <div className="px-4 md:px-8 my-8 flex justify-center">
          <GoogleAdBanner
            dataAdClient={import.meta.env.VITE_GOOGLE_AD_CLIENT}
            dataAdSlot="3746326433" // Reemplaza "XXXXXXXXXX" con tu Ad Slot ID real
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
        
        {isExportModalVisible && <ExportModal onClose={() => setIsExportModalVisible(false)} themeData={themeData} fxSeparator={fxSeparator} setFxSeparator={setFxSeparator} useFxQuotes={useFxQuotes} setUseFxQuotes={setUseFxQuotes} onCopy={showNotification} />}
        {isAccessibilityModalVisible && <AccessibilityModal onClose={() => setIsAccessibilityModalVisible(false)} accessibility={themeData.accessibility} colors={themeData.accessibilityColors} onCopy={showNotification} />}
        {isComponentPreviewModalVisible && <ComponentPreviewModal onClose={() => setIsComponentPreviewModal(false)} primaryButtonTextColor={themeData.primaryButtonTextColor} />}
        {isHistoryModalVisible && <HistoryModal history={history} onSelect={goToHistoryState} onClose={() => setIsHistoryModalVisible(false)} />}
        {isHelpModalVisible && <HelpModal onClose={() => setIsHelpModalVisible(false)} />}
        

        {/* --- MODIFICACIÓN --- Solo mostrar si NINGÚN sidebar está abierto */}
        {!isAdjusterSidebarVisible && !isSimulationSidebarVisible && (
          <FloatingActionButtons 
            onRandomClick={() => handleRandomTheme()} 
            onThemeToggle={handleThemeToggle} 
            currentTheme={themeData.theme} 
            onUndo={handleUndo} 
            onRedo={handleRedo} 
            canUndo={historyIndex > 0} 
            canRedo={historyIndex < history.length - 1}
            onOpenHistoryModal={() => setIsHistoryModalVisible(true)}
            onOpenExportModal={() => setIsExportModalVisible(true)} 
          />
        )}
    </div>
  );
});


function App() {
  const hook = useThemeGenerator();
  const [isNative, setIsNative] = useState(false);
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState('landing'); 

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

  const handleLoginSuccess = useCallback((userData) => {
      setUser(userData);
      setRoute('generator');
  }, []);

  const handleLogout = useCallback(() => {
      setUser(null);
      setRoute('landing');
      hook.showNotification('Has cerrado sesión.');
  }, [hook]);
  
  return (
    <div className="w-full min-h-screen flex flex-col">
      {(() => {
        switch (route) {
          case 'landing':
            return <LandingPage onNavigate={handleNavigate} />;
          case 'auth':
            return <AuthPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
          case 'generator':
            return <MainApp hook={hook} isNative={isNative} user={user} onLogout={handleLogout} onNavigate={handleNavigate}/>;
          
          {/* === RUTAS LEGALES (ACTUALIZADO) === */}
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