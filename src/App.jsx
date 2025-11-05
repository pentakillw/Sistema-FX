import React, { useEffect, useState, memo, useCallback } from 'react';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts } from './utils/colorUtils.js';
import Header from './components/Header.jsx';
import Explorer from './components/ui/Explorer.jsx';
import FloatingActionButtons from './components/FloatingActionButtons.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { ExportModal, AccessibilityModal, ComponentPreviewModal, HistoryModal } from './components/modals/index.jsx';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx';
import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginBanner from './components/LoginBanner.jsx';
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx'; // <-- IMPORTA LA NUEVA PÁGINA

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


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code !== 'Space') return;
      
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'BUTTON')) {
        return;
      }

      e.preventDefault();
      // La barra espaciadora ahora llama a la función sin parámetros
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
      lockedColors: lockedColors, // <-- DETALLE AÑADIDO
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
      lockedColors: lockedColors, // <-- DETALLE AÑADIDO
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "mi-tema.json";
    link.click();
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
      
      {!user && <LoginBanner onLoginClick={() => onNavigate('auth')} />}

      <div className="flex-grow p-4 md:p-8">
        <Header 
          onImport={handleImport} 
          onExport={isNative ? handleNativeExport : handleWebExport} 
          onReset={handleReset} 
          themeData={themeData} 
          font={font}
          setFont={setFont}
          user={user}
          onLogout={onLogout}
        />
        
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
            setSimulationMode={setSimulationMode}
            generatePaletteWithAI={generatePaletteWithAI}
            showNotification={showNotification}
            applySimulationToPalette={applySimulationToPalette}
            onOpenAdjuster={() => setIsAdjusterSidebarVisible(true)}
            onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
            onOpenComponentPreviewModal={() => setIsComponentPreviewModal(true)}
            lockedColors={lockedColors}
            toggleLockColor={toggleLockColor}
          />
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
        </main>
      </div>

        <div className="px-4 md:px-8 my-8 flex justify-center">
          <GoogleAdBanner
            className="w-full max-w-5xl"
            style={{ display: 'block' }}
            dataAdFormat="fluid"
            dataAdLayoutKey="-gw-3+1f-3d+2z"
            dataAdClient="ca-pub-3520411621823759"
            dataAdSlot="3746326433"
          />
        </div>


        <footer className="text-center py-8 px-4 md:px-8 border-t" style={{ borderColor: themeData.controlsThemeStyle.borderColor, color: themeData.controlsThemeStyle.color}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
            
            {/* === ENLACE A POLÍTICA DE PRIVACIDAD === */}
            <div className="mt-4">
              <button 
                onClick={() => onNavigate('privacy')}
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              >
                Política de Privacidad
              </button>
            </div>
            {/* === FIN DEL ENLACE === */}
        </footer>

        {hook.notification.message && (
          <div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: hook.notification.type === 'error' ? '#EF4444' : '#10B981'}}>{hook.notification.message}</div>
        )}
        
        {isExportModalVisible && <ExportModal onClose={() => setIsExportModalVisible(false)} themeData={themeData} fxSeparator={fxSeparator} setFxSeparator={setFxSeparator} useFxQuotes={useFxQuotes} setUseFxQuotes={setUseFxQuotes} onCopy={showNotification} />}
        {isAccessibilityModalVisible && <AccessibilityModal onClose={() => setIsAccessibilityModalVisible(false)} accessibility={themeData.accessibility} colors={themeData.accessibilityColors} onCopy={showNotification} />}
        {isComponentPreviewModalVisible && <ComponentPreviewModal onClose={() => setIsComponentPreviewModal(false)} primaryButtonTextColor={themeData.primaryButtonTextColor} />}
        {isHistoryModalVisible && <HistoryModal history={history} onSelect={goToHistoryState} onClose={() => setIsHistoryModalVisible(false)} />}

        {isAdjusterSidebarVisible && (
          <PaletteAdjusterSidebar
            paletteAdjustments={paletteAdjustments}
            setPaletteAdjustments={setPaletteAdjustments}
            commitPaletteAdjustments={commitPaletteAdjustments}
            cancelPaletteAdjustments={cancelPaletteAdjustments}
            setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
            brandColor={brandColor}
          />
        )}

        {!isAdjusterSidebarVisible && (
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
          
          {/* === AÑADIR LA NUEVA RUTA === */}
          case 'privacy':
            return <PrivacyPolicyPage onNavigate={handleNavigate} />;
          
          default:
            return <LandingPage onNavigate={handleNavigate} />;
        }
      })()}
    </div>
  );
}

export default App;