import React, { useEffect } from 'react';
// --- CORRECCIÓN: Se quita el './src/' de la ruta ---
import useThemeGenerator from './hooks/useThemeGenerator.js';
// --- CORRECCIÓN: Se añade 'ui/' a la ruta de Explorer ---
import Explorer from './components/ui/Explorer.jsx';

// This is a simplified version of App.jsx for unauthenticated users
function GuestApp() {
  const hook = useThemeGenerator();
  const { themeData } = hook;
  
  useEffect(() => {
    if (themeData?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeData?.theme]);

  if (!themeData) {
    return (
      <div className="min-h-[50vh] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-md">Cargando generador...</p>
      </div>
    );
  }
  
  const pageThemeStyle = {
    backgroundColor: themeData.stylePalette.fullBackgroundColors.find(c => c.name === 'Predeterminado').color,
    color: themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color,
    fontFamily: hook.font,
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl shadow-purple-500/10">
      <div className={`p-4 md:p-8`} style={pageThemeStyle}>
        <Explorer hook={hook} />
      </div>
    </div>
  );
}

export default GuestApp;