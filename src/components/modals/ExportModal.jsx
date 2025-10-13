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
        navigator.clipboard.writeText(codeToDisplay);
        onCopy('¡Código copiado al portapapeles!');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="p-6 rounded-xl border max-w-2xl w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <FileCode size={24} /> Exportar Código
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

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
                
                <div className="relative mt-4 flex-1">
                    <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md h-64 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                        <code>{codeToDisplay}</code>
                    </pre>
                </div>

                <div className="mt-4 flex justify-end">
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
