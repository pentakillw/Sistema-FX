import React, { useState } from 'react';
import { X, FileCode, Settings, Clipboard, Check } from 'lucide-react';
import { generatePowerFxCode, generateCssCode, generateTailwindCode } from '../../utils/codeGenUtils';
import Switch from '../ui/Switch';

const ExportModal = ({
    onClose,
    themeData,
    fxSeparator,
    setFxSeparator,
    useFxQuotes,
    setUseFxQuotes,
    onCopy
}) => {
    const [activeExport, setActiveExport] = useState('powerfx');
    const [copySuccess, setCopySuccess] = useState(false);

    const generatedCode = generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
    const cssCode = generateCssCode(themeData);
    const tailwindCode = generateTailwindCode(themeData);

    const codeToDisplay = activeExport === 'powerfx' ? generatedCode : activeExport === 'css' ? cssCode : tailwindCode;

    const handleCopy = () => {
        const textToCopy = codeToDisplay;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCopySuccess();
            }).catch(() => {
                fallbackCopy(); 
            });
        } else {
           fallbackCopy();
        }

        function fallbackCopy() {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showCopySuccess();
                }
            } catch (err) {
                // No hacer nada
            }
            document.body.removeChild(textArea);
        }

        function showCopySuccess() {
            onCopy('¡Código copiado al portapapeles!');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        // --- MODIFICACIÓN --- Backdrop responsivo
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            {/* --- MODIFICACIÓN ---
              - Panel responsivo (bottom sheet en móvil)
              - Padding inferior con 'safe-area-inset'.
            */}
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-2xl w-full relative flex flex-col max-h-[90vh] md:max-h-[80vh]"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- NUEVO --- Handle visual para el bottom sheet en móvil */}
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <FileCode size={24} /> Exportar Código
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                
                {/* --- MODIFICACIÓN --- Contenedor con overflow para el contenido */}
                <div className="flex-grow overflow-y-auto">
                    <div className="flex flex-wrap border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <button onClick={() => setActiveExport('powerfx')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'powerfx' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Power Fx</button>
                        <button onClick={() => setActiveExport('css')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'css' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>CSS</button>
                        <button onClick={() => setActiveExport('tailwind')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'tailwind' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Tailwind</button>
                    </div>

                    {activeExport === 'powerfx' && (
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
                        {/* --- MODIFICACIÓN --- Altura del 'pre' ajustada para móvil */}
                        <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md h-64 md:h-80 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            <code>{codeToDisplay}</code>
                        </pre>
                    </div>
                </div>

                <div className="mt-4 flex justify-end flex-shrink-0">
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto font-bold py-2 px-6 rounded-lg transition-colors text-white"
                        style={{ backgroundColor: copySuccess ? '#22c55e' : 'var(--action-primary-default)' }}
                    >
                        {copySuccess ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} /> Copiar Código</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
