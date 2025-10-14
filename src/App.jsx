import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import Header from './components/Header.jsx';
import Explorer from './components/Explorer.jsx';
import FloatingActionButtons from './components/FloatingActionButtons.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { ExportModal, AccessibilityModal, ComponentPreviewModal } from './components/modals/index.jsx';
import { availableFonts } from './utils/colorUtils.js';

function App() {
  const hook = useThemeGenerator();
  const { themeData } = hook;
  
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    if (themeData?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeData?.theme]);

  const handleNativeExport = async () => {
    const data = { 
      brandColor: hook.brandColor, 
      grayColor: hook.grayColor, 
      font: hook.font, 
      theme: themeData.theme, 
      isGrayAuto: hook.isGrayAuto,
      explorerPalette: hook.originalExplorerPalette,
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
       hook.showNotification('La exportación nativa no está disponible.', 'error');
    }
  };

  const handleWebExport = () => {
    const data = { 
      brandColor: hook.brandColor, 
      grayColor: hook.grayColor, 
      font: hook.font, 
      theme: themeData.theme, 
      isGrayAuto: hook.isGrayAuto,
      explorerPalette: hook.originalExplorerPalette,
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
    backgroundColor: themeData.theme === 'light' ? '#FFFFFF' : '#000000',
    color: themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color,
    transition: 'background-color 0.3s ease, color 0.3s ease',
    fontFamily: availableFonts[hook.font],
    filter: hook.simulationMode !== 'none' ? `url(#${hook.simulationMode})` : 'none'
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" /></filter>
        </defs>
      </svg>
      <div className={`min-h-screen p-4 md:p-8`} style={pageThemeStyle}>
        <Header 
          onImport={hook.handleImport} 
          onExport={isNative ? handleNativeExport : handleWebExport} 
          onReset={hook.handleReset} 
          onOpenExportModal={() => setIsExportModalVisible(true)}
          themeData={themeData}
          font={hook.font}
          setFont={hook.setFont} 
        />
        
        <main>
          <Explorer
            explorerPalette={hook.explorerPalette}
            reorderExplorerPalette={hook.reorderExplorerPalette}
            explorerGrayShades={hook.explorerGrayShades}
            onShadeCopy={hook.handleExplorerColorPick}
            onGrayShadeCopy={hook.setGrayColor}
            adjustments={hook.paletteAdjustments}
            onAdjust={hook.setPaletteAdjustments}
            brandColor={hook.brandColor}
            onColorSelect={hook.updateBrandColor}
            themeData={themeData}
            insertColorInPalette={hook.insertColorInPalette}
            removeColorFromPalette={hook.removeColorFromPalette}
            explorerMethod={hook.explorerMethod}
            setExplorerMethod={hook.setExplorerMethod}
            replaceColorInPalette={hook.replaceColorInPalette}
            handlePaletteUndo={hook.handleUndo}
            handlePaletteRedo={hook.handleRedo}
            history={hook.history}
            historyIndex={hook.historyIndex}
            simulationMode={hook.simulationMode}
            setSimulationMode={hook.setSimulationMode}
            generatePaletteWithAI={hook.generatePaletteWithAI}
            onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
            onOpenComponentPreviewModal={() => setIsComponentPreviewModalVisible(true)}
            onCopy={hook.showNotification}
          />

          <div className="space-y-6 mb-8">
            <ColorPreviewer
              title="Modo Claro"
              themeOverride="light"
              previewMode={hook.lightPreviewMode}
              onCyclePreviewMode={() => hook.cyclePreviewMode(hook.lightPreviewMode, hook.setLightPreviewMode, ['white', 'T950'])}
              hook={hook}
            />
            <ColorPreviewer
              title="Modo Oscuro"
              themeOverride="dark"
              previewMode={hook.darkPreviewMode}
              onCyclePreviewMode={() => hook.cyclePreviewMode(hook.darkPreviewMode, hook.setDarkPreviewMode, ['black', 'T0'])}
              hook={hook}
            />
          </div>

          <SemanticPalettes
            stylePalette={themeData.stylePalette}
            onCopy={hook.showNotification}
            themeData={themeData}
            previewMode={hook.semanticPreviewMode}
            onCyclePreviewMode={() => hook.cyclePreviewMode(hook.semanticPreviewMode, hook.setSemanticPreviewMode, ['card', 'white', 'T950', 'black', 'T0'])}
          />
        </main>

        <footer className="text-center mt-12 pt-8 border-t" style={{ borderColor: themeData.controlsThemeStyle.borderColor, color: themeData.controlsThemeStyle.color}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
        </footer>

        {hook.notification.message && (<div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: hook.notification.type === 'error' ? '#EF4444' : '#10B981'}}>{hook.notification.message}</div>)}
        
        {isExportModalVisible && (
            <ExportModal 
                onClose={() => setIsExportModalVisible(false)}
                themeData={themeData}
                fxSeparator={hook.fxSeparator}
                setFxSeparator={hook.setFxSeparator}
                useFxQuotes={hook.useFxQuotes}
                setUseFxQuotes={hook.setUseFxQuotes}
                onCopy={hook.showNotification}
            />
        )}
        
        {isAccessibilityModalVisible && (
            <AccessibilityModal 
                onClose={() => setIsAccessibilityModalVisible(false)}
                accessibility={themeData.accessibility} 
                colors={themeData.accessibilityColors} 
                onCopy={hook.showNotification}
            />
        )}
        {isComponentPreviewModalVisible && (
            <ComponentPreviewModal 
                onClose={() => setIsComponentPreviewModalVisible(false)}
                primaryButtonTextColor={themeData.primaryButtonTextColor}
            />
        )}

        <FloatingActionButtons 
            onRandomClick={hook.handleRandomTheme}
            onThemeToggle={hook.handleThemeToggle}
            currentTheme={themeData.theme}
            onUndo={hook.handleUndo}
            onRedo={hook.handleRedo}
            canUndo={hook.historyIndex > 0}
            canRedo={hook.historyIndex < hook.history.length - 1}
        />
      </div>
    </>
  );
}

export default App;

