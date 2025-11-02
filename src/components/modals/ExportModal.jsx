import React, { useState } from 'react';
// --- MODIFICACIÓN ---
// Importamos los iconos nuevos para las tarjetas y el botón de "Atrás"
import { 
    X, FileCode, Settings, Clipboard, Check, ArrowLeft,
    Zap, Paintbrush, FileText, Wind, FileJson2 
} from 'lucide-react';
// --- CORRECCIÓN DE RUTAS ---
// Añadimos las extensiones .js y .jsx a las importaciones
import { 
    generatePowerFxCode, 
    generateCssCode, 
    generateTailwindCode,
    generateJsonCode,
    generateScssCode 
} from '../../utils/codeGenUtils.js';
import Switch from '../ui/Switch.jsx';

// --- NUEVO ---
// Creamos un componente para las tarjetas de opción de exportación
const ExportOptionCard = ({ icon, label, description, onClick }) => (
    <button
        onClick={onClick}
        className="p-4 w-full rounded-lg border text-left transition-all duration-200 
                   hover:bg-[var(--bg-muted)] hover:shadow-lg hover:-translate-y-1"
        style={{ borderColor: 'var(--border-default)' }}
    >
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <span className="font-bold text-lg" style={{ color: 'var(--text-default)' }}>{label}</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </button>
);


const ExportModal = ({
    onClose,
    themeData,
    fxSeparator,
    setFxSeparator,
    useFxQuotes,
    setUseFxQuotes,
    onCopy
}) => {
    // --- MODIFICACIÓN ---
    // Cambiamos el estado para manejar las dos vistas: 'selection' (cuadrícula) y 'code' (vista previa)
    const [view, setView] = useState('selection');
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Generamos el código solo cuando se selecciona un formato
    const getCode = () => {
        switch(selectedFormat) {
            case 'powerfx': return generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
            case 'css': return generateCssCode(themeData);
            case 'scss': return generateScssCode(themeData);
            case 'tailwind': return generateTailwindCode(themeData);
            case 'json': return generateJsonCode(themeData);
            default: return "// Selecciona un formato de exportación";
        }
    };
    
    const codeToDisplay = getCode();

    const handleCopy = () => {
        const textToCopy = codeToDisplay;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(showCopySuccess).catch(fallbackCopy);
        } else {
           fallbackCopy();
        }

        function fallbackCopy() {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy') && showCopySuccess();
            } catch (err) {
                // Error al copiar
            }
            document.body.removeChild(textArea);
        }

        function showCopySuccess() {
            onCopy('¡Código copiado al portapapeles!');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };
    
    // --- NUEVO ---
    // Funciones para navegar entre la selección y la vista de código
    const handleSelectFormat = (format) => {
        setSelectedFormat(format);
        setView('code');
    };

    const handleBack = () => {
        setView('selection');
        setSelectedFormat(null);
        setCopySuccess(false); // Resetea el botón de copiar
    };
    
    const formatLabels = {
        'powerfx': 'Power Fx',
        'css': 'CSS',
        'scss': 'SCSS',
        'tailwind': 'Tailwind',
        'json': 'JSON'
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-2xl w-full relative flex flex-col max-h-[90vh] md:max-h-[80vh]"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {/* --- MODIFICACIÓN --- Botón de "Atrás" condicional */}
                        {view === 'code' && (
                            <button onClick={handleBack} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-default)]">
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                            <FileCode size={24} />
                            {/* --- MODIFICACIÓN --- Título dinámico */}
                            {view === 'selection' ? 'Exportar Código' : `Exportar ${formatLabels[selectedFormat]}`}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                
                {/* --- MODIFICACIÓN --- Renderizado condicional de la vista */}
                <div className="flex-grow overflow-y-auto">
                    {view === 'selection' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ExportOptionCard
                                icon={<Zap size={24} className="text-purple-500" />}
                                label="Power Fx"
                                description="Variables de color para Power Apps."
                                onClick={() => handleSelectFormat('powerfx')}
                            />
                            <ExportOptionCard
                                icon={<Paintbrush size={24} className="text-blue-500" />}
                                label="CSS"
                                description="Variables de CSS para web."
                                onClick={() => handleSelectFormat('css')}
                            />
                            <ExportOptionCard
                                icon={<FileText size={24} className="text-pink-500" />}
                                label="SCSS"
                                description="Variables de Sass para preprocesadores."
                                onClick={() => handleSelectFormat('scss')}
                            />
                            <ExportOptionCard
                                icon={<Wind size={24} className="text-cyan-500" />}
                                label="Tailwind"
                                description="Configuración de 'theme.colors' (JSON)."
                                onClick={() => handleSelectFormat('tailwind')}
                            />
                            <ExportOptionCard
                                icon={<FileJson2 size={24} className="text-yellow-500" />}
                                label="JSON"
                                description="Formato universal para cualquier sistema."
                                onClick={() => handleSelectFormat('json')}
                            />
                        </div>
                    )}
                    
                    {view === 'code' && (
                        <div>
                            {selectedFormat === 'powerfx' && (
                                <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-default)' }}><Settings size={16} /> Configuración de Salida</h4>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm" style={{ color: 'var(--text-muted)' }} htmlFor="fxSeparator">Separador:</label>
                                            <select id="fxSeparator" value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}>
                                                <option value=";">;</option>
                                                <option value=",">,</option>
                                                <option value=";;">;;</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Usar comillas:</label>
                                            <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative mt-4">
                                <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md h-64 md:h-80 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                    <code>{codeToDisplay}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MODIFICACIÓN --- El botón de copiar solo aparece en la vista de código */}
                {view === 'code' && (
                    <div className="mt-4 flex justify-end flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto font-bold py-2 px-6 rounded-lg transition-colors text-white"
                            style={{ backgroundColor: copySuccess ? '#22c55e' : 'var(--action-primary-default)' }}
                        >
                            {copySuccess ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} /> Copiar Código</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportModal;

