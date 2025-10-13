import React, { useState } from 'react';
import { FileCode, Settings, Clipboard } from 'lucide-react';
import { generatePowerFxCode, generateCssCode, generateTailwindCode } from '../utils/codeGenUtils';
import Switch from './ui/Switch';

const CodeExport = ({ themeData, fxSeparator, setFxSeparator, useFxQuotes, setUseFxQuotes, onCopy }) => {
    const [isExportVisible, setIsExportVisible] = useState(false);
    const [activeExport, setActiveExport] = useState('powerfx');

    const generatedCode = generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
    const cssCode = generateCssCode(themeData);
    const tailwindCode = generateTailwindCode(themeData);

    const codeToDisplay = activeExport === 'powerfx' ? generatedCode : activeExport === 'css' ? cssCode : tailwindCode;

    return (
        <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                    <FileCode size={20} /> Opciones de Exportación
                </h2>
                <button
                    onClick={() => setIsExportVisible(!isExportVisible)}
                    className="text-sm font-medium py-1 px-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                >
                    {isExportVisible ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>

            {isExportVisible && (
                <div className="mt-4">
                    {/* **FIX**: Hacer que las pestañas se envuelvan si no caben */}
                    <div className="flex flex-wrap border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <button onClick={() => setActiveExport('powerfx')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'powerfx' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Power Fx</button>
                        <button onClick={() => setActiveExport('css')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'css' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>CSS</button>
                        <button onClick={() => setActiveExport('tailwind')} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 ${activeExport === 'tailwind' ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>Tailwind</button>
                    </div>

                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-default)' }}><Settings size={16} /> Configuración de Salida</h4>
                        {activeExport === 'powerfx' && (
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
                                    <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Usar comillas en claves:</label>
                                    <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                </div>
                            </div>
                        )}
                        {activeExport !== 'powerfx' && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No hay configuraciones disponibles para este formato.</p>
                        )}
                    </div>

                    <div className="relative mt-4">
                        <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all p-4 rounded-md max-h-96 overflow-auto" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}><code>{codeToDisplay}</code></pre>
                        <button onClick={() => onCopy(codeToDisplay, '¡Código copiado!')} className="absolute top-3 right-3 p-2 rounded-lg text-white" style={{ backgroundColor: 'var(--action-primary-default)' }}><Clipboard size={16} /></button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CodeExport;

