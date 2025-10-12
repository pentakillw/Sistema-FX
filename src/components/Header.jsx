import React, { useRef, useState } from 'react';
import { RefreshCcw, Upload, Download, HelpCircle } from 'lucide-react';
import { HelpModal } from './modals';

const Header = ({ onImport, onExport, onReset, themeData }) => {
    const importFileRef = useRef(null);
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    
    const controlsThemeStyle = themeData.controlsThemeStyle;
    const pageTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color;
    const mutedTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Apagado').color;

    return (
        <>
            {/* **FIX**: Reorganización de clases para mejor responsividad */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                 <div className="flex items-center gap-4">
                    <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl shadow-md"/>
                    <div>
                        {/* **FIX**: Tamaños de texto adaptables */}
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: pageTextColor }}>BIENVENIDOS</h1>
                        <p className="text-sm md:text-md" style={{ color: mutedTextColor }}>al sistema de diseño para Power Apps</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
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

