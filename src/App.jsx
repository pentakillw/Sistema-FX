import React from 'react';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts } from './utils/colorUtils.js';
import Header from './components/Header.jsx';
import Controls from './components/Controls.jsx';
import AccessibilityCard from './components/AccessibilityCard.jsx';
import CodeExport from './components/CodeExport.jsx';
import ComponentPreview from './components/ComponentPreview.jsx';
import Explorer from './components/Explorer.jsx';
import FloatingActionButtons from './components/FloatingActionButtons.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';

function App() {
  const hook = useThemeGenerator();
  const { themeData } = hook;

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
      <div className={`min-h-screen p-4 sm:p-8`} style={pageThemeStyle}>
        <Header onImport={hook.handleImport} onExport={hook.handleExport} onReset={hook.handleReset} themeData={themeData} />
        
        <main>
          <div className="md:sticky top-4 z-40 mb-8">
            <Controls hook={hook} />
          </div>

          <AccessibilityCard accessibility={themeData.accessibility} colors={themeData.accessibilityColors} />
          
          <CodeExport 
            themeData={themeData}
            fxSeparator={hook.fxSeparator}
            setFxSeparator={hook.setFxSeparator}
            useFxQuotes={hook.useFxQuotes}
            setUseFxQuotes={hook.setUseFxQuotes}
            onCopy={hook.showNotification}
          />
          
          <ComponentPreview primaryButtonTextColor={themeData.primaryButtonTextColor} />

          <Explorer
            explorerPalette={hook.explorerPalette}
            explorerGrayShades={hook.explorerGrayShades}
            onShadeCopy={hook.handleExplorerColorPick}
            onGrayShadeCopy={hook.setGrayColor}
            adjustments={hook.paletteAdjustments}
            onAdjust={hook.setPaletteAdjustments}
            brandColor={hook.brandColor}
            onColorSelect={hook.updateBrandColor}
            themeData={themeData}
          />

          <div className="space-y-6 mb-8">
            <ColorPreviewer
              title="Modo Claro"
              themeOverride="light"
              previewMode={hook.lightPreviewMode}
              onCyclePreviewMode={() => hook.cyclePreviewMode(hook.lightPreviewMode, hook.setLightPreviewMode, ['white', 'T950'])}
              brandColor={themeData.brandColor}
              grayColor={themeData.grayColor}
              brandShades={themeData.brandShades}
              grayShades={themeData.grayShades}
              onShadeCopy={hook.showNotification}
            />
            <ColorPreviewer
              title="Modo Oscuro"
              themeOverride="dark"
              previewMode={hook.darkPreviewMode}
              onCyclePreviewMode={() => hook.cyclePreviewMode(hook.darkPreviewMode, hook.setDarkPreviewMode, ['black', 'T0'])}
              brandColor={themeData.brandColor}
              grayColor={themeData.grayColor}
              brandShades={themeData.brandShades}
              grayShades={themeData.grayShades}
              onShadeCopy={hook.showNotification}
            />
          </div>

          {/* **FIX**: Reordenado para que aparezca después de los modos claro/oscuro */}
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
        
        <FloatingActionButtons 
            onRandomClick={hook.handleRandomTheme}
            onThemeToggle={hook.handleThemeToggle}
            currentTheme={themeData.theme}
        />
      </div>
    </>
  );
}

export default App;

