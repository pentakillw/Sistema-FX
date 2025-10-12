import React, { useRef, useState } from 'react';
import { RefreshCcw, Upload, Download, HelpCircle } from 'lucide-react';
import { HelpModal } from './modals/index';

const Header = ({ onImport, onExport, onReset, themeData }) => {
    const importFileRef = useRef(null);
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    
    // Se accede de forma segura a los datos del tema. El estado de carga en App.jsx previene errores.
    const controlsThemeStyle = themeData.controlsThemeStyle;
    const pageTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color;
    const mutedTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Apagado').color;

    return (
        <>
            <header className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                 <div className="flex items-center gap-4">
                    <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shadow-md"/>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: pageTextColor }}>BIENVENIDOS</h1>
                        <p className="text-md" style={{ color: mutedTextColor }}>al sistema de diseño para Power Apps</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                    <input type="file" ref={importFileRef} onChange={onImport} accept=".json" className="hidden"/>
                    <button title="Reiniciar Tema" onClick={onReset} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><RefreshCcw size={16}/></button>
                    <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Upload size={16}/></button>
                    <button title="Exportar Tema" onClick={onExport} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Download size={16}/></button>
                    <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center gap-2" style={controlsThemeStyle}><HelpCircle size={16}/></button>
                </div>
            </header>
            {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        </>
    );
};

export default Header;

