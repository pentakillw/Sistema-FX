import React, { useRef, useState } from 'react';
// --- MODIFICACIÓN ---
// Ya no necesitamos FileCode aquí, así que lo quitamos.
import { RefreshCcw, Upload, Download, HelpCircle, Type, User, LogOut } from 'lucide-react';
import { HelpModal } from './modals';
import { availableFonts } from '../utils/colorUtils';

// --- MODIFICACIÓN ---
// Quitamos onOpenExportModal de las props
const Header = ({ onImport, onExport, onReset, themeData, font, setFont, user, onLogout }) => {
    const importFileRef = useRef(null);
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [isFontMenuVisible, setIsFontMenuVisible] = useState(false);
    
    const controlsThemeStyle = themeData.controlsThemeStyle;
    const pageTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color;
    const mutedTextColor = themeData.stylePalette.fullForegroundColors.find(c => c.name === 'Apagado').color;

    return (
        <>
            {/* --- MODIFICACIÓN DE ESPACIO: sm:mb-8 -> sm:mb-6 --- */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                 <div className="flex items-center gap-3 sm:gap-4">
                    <img src="https://raw.githubusercontent.com/pentakillw/sistema-de-diseno-react/main/Icono_FX.png" alt="Sistema FX Logo" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-2xl shadow-md"/>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: pageTextColor }}>BIENVENIDOS</h1>
                        <p className="text-sm md:text-md" style={{ color: mutedTextColor }}>al sistema de diseño FX</p>
                    </div>
                </div>
                
                {user ? (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="flex items-center gap-2 text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}>
                            <User size={16} />
                            <span className="text-sm font-medium hidden sm:inline">{user.name || user.email}</span>
                        </div>
                        <button title="Cerrar Sesión" onClick={onLogout} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}>
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                        <input type="file" ref={importFileRef} onChange={onImport} accept=".json" className="hidden"/>
                        
                        <div className="relative">
                            <button 
                                title="Cambiar Fuente" 
                                className="text-sm font-medium p-2 rounded-lg" 
                                style={controlsThemeStyle}
                                onClick={() => setIsFontMenuVisible(!isFontMenuVisible)}
                            >
                                <Type size={16}/>
                            </button>
                            {isFontMenuVisible && (
                                <div 
                                    className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg z-50"
                                    onMouseLeave={() => setIsFontMenuVisible(false)}
                                >
                                {Object.keys(availableFonts).map(fontName => (
                                    <button
                                      key={fontName}
                                      onClick={() => {
                                          setFont(fontName);
                                          setIsFontMenuVisible(false);
                                      }}
                                      className={`w-full text-left px-4 py-2 text-sm ${font === fontName ? 'font-bold text-[var(--action-primary-default)]' : 'text-[var(--text-default)]'} hover:bg-[var(--bg-muted)]`}
                                    >
                                        {fontName}
                                    </button>
                                ))}
                                </div>
                            )}
                        </div>
                        
                        <button title="Importar Tema" onClick={() => importFileRef.current.click()} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Upload size={16}/></button>
                        <button title="Exportar Tema" onClick={onExport} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><Download size={16}/></button>
                        
                        {/* --- MODIFICACIÓN --- 
                            El botón de Exportar Código ha sido eliminado de aquí.
                        */}
                        
                        <div className="h-6 w-px" style={{backgroundColor: 'var(--border-default)'}}></div>
                        <button title="Reiniciar Tema" onClick={onReset} className="text-sm font-medium p-2 rounded-lg" style={controlsThemeStyle}><RefreshCcw size={16}/></button>
                        <button title="Ayuda" onClick={() => setIsHelpVisible(true)} className="text-sm font-medium p-2 rounded-lg flex items-center" style={controlsThemeStyle}><HelpCircle size={16}/></button>
                    </div>
                )}
            </header>
            {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        </>
    );
};

export default Header;