import React, { useRef, useState } from 'react';
// --- MODIFICACIÓN --- Añadimos el ícono de Texto (Type)
import { RefreshCcw, Upload, Download, HelpCircle, FileCode, Type } from 'lucide-react';
import { HelpModal } from './modals';
// --- MODIFICACIÓN --- Importamos las fuentes disponibles
import { availableFonts } from '../utils/colorUtils';

// --- MODIFICACIÓN --- Añadimos 'font' y 'onFontChange' a las props
const Header = ({ onImport, onExport, onReset, onOpenExportModal, themeData, font, onFontChange }) => {
    const importFileRef = useRef(null);
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    
    const controlsThemeStyle = themeData.controlsThemeStyle;
    const pageTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color;
    const mutedTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Apagado').color;

    return (
        <>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                 <div className="flex items-center gap-4">
                    <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl shadow-md"/>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: pageTextColor }}>BIENVENIDOS</h1>
                        <p className="text-sm md:text-md" style={{ color: mutedTextColor }}>al sistema de diseño FX</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <input type="file" ref={importFileRef} onChange={onImport} accept=".json" className="hidden"/>
                    
                    {/* --- NUEVO --- Selector de fuentes como un menú desplegable con ícono */}
                    <div className="relative group">
                        <button title="Cambiar Fuente" className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}>
                            <Type size={16}/>
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                           {Object.keys(availableFonts).map(fontName => (
                               <button
                                 key={fontName}
                                 onClick={() => onFontChange(fontName)}
                                 className={`w-full text-left px-4 py-2 text-sm ${font === fontName ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)]`}
                               >
                                   {fontName}
                               </button>
                           ))}
                        </div>
                    </div>

                    <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Upload size={16}/></button>
                    <button title="Exportar Tema" onClick={onExport} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Download size={16}/></button>
                    <button title="Exportar Código" onClick={onOpenExportModal} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><FileCode size={16}/></button>
                    <div className="h-6 w-px" style={{backgroundColor: 'var(--border-default)'}}></div>
                    <button title="Reiniciar Tema" onClick={onReset} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><RefreshCcw size={16}/></button>
                    <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center" style={controlsThemeStyle}><HelpCircle size={16}/></button>
                </div>
            </header>
            {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        </>
    );
};

export default Header;
