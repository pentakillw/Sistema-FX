import React, { useEffect, useState } from 'react';
// Imports de Capacitor eliminados para compatibilidad web
// import { Capacitor } from '@capacitor/core';
// import { Share } from '@capacitor/share';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts } from './utils/colorUtils.js';
import Header from './components/Header.jsx';
import Explorer from './components/Explorer.jsx';
import FloatingActionButtons from './components/FloatingActionButtons.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { ExportModal, AccessibilityModal, ComponentPreviewModal } from './components/modals/index.jsx';
import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginBanner from './components/LoginBanner.jsx';

// --- Funciones simuladas para Capacitor ---
// Esto permite que el código se ejecute sin errores en un navegador.
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

// Componente para la aplicación principal de generación de paletas
const MainApp = ({ hook, isNative, user, onLogout, onNavigate }) => {
  const { themeData } = hook;

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);

  // Funciones de exportación específicas para este componente
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
      // btoa() puede tener problemas con caracteres UTF-8, esta es una forma más segura
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

      await Share.share({
        title: 'Mi Tema de Color',
        text: 'Aquí está el archivo JSON de mi tema de color.',
        url: `data:application/json;name=mi-tema.json;base64,${base64Data}`,
        dialogTitle: 'Exportar Tema',
      });
    } catch (error) {
       console.log('Share API no disponible o cancelado', error);
       hook.showNotification('La exportación nativa no está disponible en la web.', 'error');
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
  };

  return (
    <div className="flex flex-col min-h-screen">
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

      <div className={`flex-grow p-4 md:p-8`} style={pageThemeStyle}>
        <Header 
          hook={hook}
          onImport={hook.handleImport} 
          onExport={isNative ? handleNativeExport : handleWebExport} 
          onReset={hook.handleReset} 
          onOpenExportModal={() => setIsExportModalVisible(true)}
          themeData={themeData} 
          font={hook.font}
          setFont={hook.setFont}
          user={user}
          onLogout={onLogout}
        />
        
        <main>
          <Explorer hook={hook} />
          <div className="space-y-6 mb-8">
            <ColorPreviewer title="Modo Claro" themeOverride="light" previewMode={hook.lightPreviewMode} onCyclePreviewMode={() => hook.cyclePreviewMode(hook.lightPreviewMode, hook.setLightPreviewMode, ['white', 'T950'])} hook={hook} onShadeCopy={hook.showNotification} />
            <ColorPreviewer title="Modo Oscuro" themeOverride="dark" previewMode={hook.darkPreviewMode} onCyclePreviewMode={() => hook.cyclePreviewMode(hook.darkPreviewMode, hook.setDarkPreviewMode, ['black', 'T0'])} hook={hook} onShadeCopy={hook.showNotification} />
          </div>
          <SemanticPalettes stylePalette={themeData.stylePalette} onCopy={hook.showNotification} themeData={themeData} previewMode={hook.semanticPreviewMode} onCyclePreviewMode={() => hook.cyclePreviewMode(hook.semanticPreviewMode, hook.setSemanticPreviewMode, ['card', 'white', 'T950', 'black', 'T0'])} simulationMode={hook.simulationMode} />
        </main>
      </div>

        <footer className="text-center py-8 px-4 md:px-8 border-t" style={{...pageThemeStyle, borderColor: themeData.controlsThemeStyle.borderColor, color: themeData.controlsThemeStyle.color}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
        </footer>

        {hook.notification.message && (<div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: hook.notification.type === 'error' ? '#EF4444' : '#10B981'}}>{hook.notification.message}</div>)}
        {isExportModalVisible && <ExportModal onClose={() => setIsExportModalVisible(false)} themeData={themeData} fxSeparator={hook.fxSeparator} setFxSeparator={hook.setFxSeparator} useFxQuotes={hook.useFxQuotes} setUseFxQuotes={hook.setUseFxQuotes} onCopy={hook.showNotification} />}
        {isAccessibilityModalVisible && <AccessibilityModal onClose={() => setIsAccessibilityModalVisible(false)} accessibility={themeData.accessibility} colors={themeData.accessibilityColors} onCopy={hook.showNotification} />}
        {isComponentPreviewModalVisible && <ComponentPreviewModal onClose={() => setIsComponentPreviewModalVisible(false)} primaryButtonTextColor={themeData.primaryButtonTextColor} />}

        <FloatingActionButtons onRandomClick={hook.handleRandomTheme} onThemeToggle={hook.handleThemeToggle} currentTheme={themeData.theme} onUndo={hook.handleUndo} onRedo={hook.handleRedo} canUndo={hook.historyIndex > 0} canRedo={hook.historyIndex < hook.history.length - 1} />
    </div>
  );
}


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
  
  const handleNavigate = (newRoute) => {
      setRoute(newRoute);
  }

  const handleLoginSuccess = (userData) => {
      setUser(userData);
      setRoute('generator');
  }

  const handleLogout = () => {
      setUser(null);
      setRoute('landing');
      hook.showNotification('Has cerrado sesión.');
  }

  if (route === 'landing') {
      return <LandingPage onNavigate={handleNavigate} />;
  }

  if (route === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  if (route === 'generator') {
      return <MainApp hook={hook} isNative={isNative} user={user} onLogout={handleLogout} onNavigate={handleNavigate}/>
  }

  return <LandingPage onNavigate={handleNavigate} />;
}

export default App;

