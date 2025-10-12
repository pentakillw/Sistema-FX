import React, { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Undo2, Redo2 } from 'lucide-react';
import { availableFonts, generationMethods } from '../utils/colorUtils';
import Switch from './ui/Switch';

const Controls = ({ hook }) => {
    const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
    const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);

    // Desestructuración segura de las propiedades del hook
    const {
        font, brandColor, grayColor, isGrayAuto, explorerMethod, simulationMode,
        historyIndex, colorHistory, setFont, updateBrandColor, setGrayColor,
        setIsGrayAuto, setExplorerMethod, setSimulationMode, handleUndo, handleRedo
    } = hook;

    return (
        <section className="p-4 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Columna Izquierda: Definición del Tema */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text-default)' }}>Definición del Tema</h3>
                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Fuente Principal</label>
                        <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}>
                            {Object.keys(availableFonts).map(fontName => (<option key={fontName} value={fontName}>{fontName}</option>))}
                        </select>

                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Color de Marca</label>
                        <div className="relative">
                             <div className="flex items-center rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                                <div className="w-7 h-7 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: brandColor, borderColor: 'var(--border-default)' }} onClick={() => setIsBrandPickerVisible(v => !v)} />
                                <HexColorInput prefixed color={brandColor} onChange={updateBrandColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: 'var(--text-default)' }} />
                            </div>
                            {isBrandPickerVisible && (<div className="absolute z-10 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsBrandPickerVisible(false)} /><HexColorPicker color={brandColor} onChange={updateBrandColor} /></div>)}
                        </div>

                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Escala de Grises</label>
                        <div className="flex items-center gap-4">
                            <div className={`relative transition-opacity ${isGrayAuto ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}>
                                    <div className={`w-7 h-7 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: grayColor, borderColor: 'var(--border-default)' }} onClick={() => !isGrayAuto && setIsGrayPickerVisible(v => !v)} />
                                    <HexColorInput prefixed color={grayColor} onChange={setGrayColor} className="font-mono bg-transparent px-2 py-1 rounded-r-md w-24 focus:outline-none" style={{ color: 'var(--text-default)' }} disabled={isGrayAuto} />
                                </div>
                                {isGrayPickerVisible && !isGrayAuto && (<div className="absolute z-10 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsGrayPickerVisible(false)} /><HexColorPicker color={grayColor} onChange={setGrayColor} /></div>)}
                            </div>
                             <div className="flex items-center gap-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-default)' }}>Auto</label>
                                <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Herramientas */}
                <div className="space-y-4">
                     <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text-default)' }}>Herramientas</h3>
                     <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Método Aleatorio</label>
                        <select value={explorerMethod} onChange={(e) => setExplorerMethod(e.target.value)} className="w-full font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}>
                            {generationMethods.map(method => (<option key={method.id} value={method.id}>{method.name}</option>))}
                        </select>

                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Historial</label>
                        <div className="flex items-center gap-2">
                            <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Deshacer"><Undo2 size={16}/></button>
                            <button onClick={handleRedo} disabled={historyIndex >= colorHistory.length - 1} className="p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Rehacer"><Redo2 size={16}/></button>
                        </div>
                        
                        <label className="text-sm font-medium" style={{ color: 'var(--text-default)' }}>Simulador Daltonismo</label>
                        <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value)} className="w-full font-semibold px-2 py-1 rounded-md border" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}>
                            <option value="none">Ninguno</option>
                            <option value="protanopia">Protanopia</option>
                            <option value="deuteranopia">Deuteranopia</option>
                            <option value="tritanopia">Tritanopia</option>
                        </select>
                     </div>
                </div>
            </div>
        </section>
    );
};

export default Controls;

