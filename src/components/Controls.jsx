import React, { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Undo2, Redo2, Eye, Image as ImageIcon } from 'lucide-react';
import { availableFonts, generationMethods } from '../utils/colorUtils';
import Switch from './ui/Switch';
import { ImagePaletteModal } from './modals';

// Componente de UI para un campo de formulario genérico
const FormField = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-default)' }}>
            {label}
        </label>
        {children}
    </div>
);

const Controls = ({ hook }) => {
    const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
    const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    const {
        font, brandColor, grayColor, isGrayAuto, explorerMethod, simulationMode,
        historyIndex, colorHistory, setFont, updateBrandColor, setGrayColor,
        setIsGrayAuto, setExplorerMethod, setSimulationMode, handleUndo, handleRedo
    } = hook;

    const selectStyles = "w-full bg-transparent font-semibold px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)] focus:ring-[var(--action-primary-default)]";
    const inputContainerStyles = "flex items-center rounded-md border bg-[var(--bg-muted)]";
    const buttonStyles = "flex items-center justify-center gap-2 w-full p-2 rounded-lg text-sm font-semibold";


    return (
        <>
            <section className="p-4 sm:p-6 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                {/* **FIX**: Layout principal ahora es flex para apilarse en móvil */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                    
                    {/* Columna Izquierda: Definición del Tema */}
                    <div className="space-y-4 flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-center lg:text-left" style={{ color: 'var(--text-default)' }}>Definición del Tema</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                            <FormField label="Fuente Principal">
                                <select value={font} onChange={(e) => setFont(e.target.value)} className={selectStyles} style={{ borderColor: 'var(--border-default)', color: 'var(--text-default)' }}>
                                    {Object.keys(availableFonts).map(fontName => (<option key={fontName} value={fontName}>{fontName}</option>))}
                                </select>
                            </FormField>
                            
                            <FormField label="Color de Marca">
                                 <div className="relative">
                                    <div className={inputContainerStyles} style={{ borderColor: 'var(--border-default)' }}>
                                        <div className="w-8 h-8 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: brandColor, borderColor: 'var(--border-default)' }} onClick={() => setIsBrandPickerVisible(v => !v)} />
                                        <HexColorInput prefixed color={brandColor} onChange={updateBrandColor} className="font-mono bg-transparent px-2 py-1 w-full focus:outline-none" style={{ color: 'var(--text-default)' }} />
                                    </div>
                                    {isBrandPickerVisible && (<div className="absolute z-20 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsBrandPickerVisible(false)} /><HexColorPicker color={brandColor} onChange={updateBrandColor} /></div>)}
                                </div>
                            </FormField>

                            <div className="sm:col-span-2">
                                 <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold" style={{ color: 'var(--text-default)' }}>Escala de Grises</label>
                                     <div className="flex items-center gap-2">
                                        <label className="text-xs font-medium" style={{ color: 'var(--text-default)' }}>Auto</label>
                                        <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                                    </div>
                                </div>
                                <div className={`relative transition-opacity mt-2 ${isGrayAuto ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className={inputContainerStyles} style={{ borderColor: 'var(--border-default)' }}>
                                        <div className={`w-8 h-8 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: grayColor, borderColor: 'var(--border-default)' }} onClick={() => !isGrayAuto && setIsGrayPickerVisible(v => !v)} />
                                        <HexColorInput prefixed color={grayColor} onChange={setGrayColor} className="font-mono bg-transparent px-2 py-1 w-full focus:outline-none" style={{ color: 'var(--text-default)' }} disabled={isGrayAuto} />
                                    </div>
                                    {isGrayPickerVisible && !isGrayAuto && (<div className="absolute z-20 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsGrayPickerVisible(false)} /><HexColorPicker color={grayColor} onChange={setGrayColor} /></div>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Herramientas */}
                    <div className="space-y-4 flex-1">
                         <h3 className="text-sm font-bold tracking-wider uppercase text-center lg:text-left" style={{ color: 'var(--text-default)' }}>Herramientas</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                            
                            <div className="sm:col-span-2">
                                <FormField label="Generadores de Paleta">
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={explorerMethod} onChange={(e) => setExplorerMethod(e.target.value)} className={selectStyles} style={{ borderColor: 'var(--border-default)', color: 'var(--text-default)' }} title="Generar por Método">
                                            {generationMethods.map(method => (<option key={method.id} value={method.id}>{method.name}</option>))}
                                        </select>
                                        <button onClick={() => setIsImageModalVisible(true)} className={buttonStyles} style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Extraer de imagen">
                                            <ImageIcon size={16} />
                                            <span>Imagen</span>
                                        </button>
                                    </div>
                                </FormField>
                            </div>
                            
                            <FormField label="Historial">
                                <div className="flex items-center gap-2">
                                    <button onClick={handleUndo} disabled={historyIndex === 0} className="w-full flex justify-center p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Deshacer"><Undo2 size={16}/></button>
                                    <button onClick={handleRedo} disabled={historyIndex >= colorHistory.length - 1} className="w-full flex justify-center p-2 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}} title="Rehacer"><Redo2 size={16}/></button>
                                </div>
                            </FormField>
                            
                            <FormField label="Simulador Daltonismo">
                                <div className="relative">
                                    <Eye size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                                    <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value)} className={`${selectStyles} pl-10`} style={{ borderColor: 'var(--border-default)', color: 'var(--text-default)' }}>
                                        <option value="none">Ninguno</option>
                                        <option value="protanopia">Protanopia</option>
                                        <option value="deuteranopia">Deuteranopia</option>
                                        <option value="tritanopia">Tritanopia</option>
                                    </select>
                                </div>
                            </FormField>
                         </div>
                    </div>
                </div>
            </section>
            
            {isImageModalVisible && (
                <ImagePaletteModal 
                    onColorSelect={updateBrandColor}
                    onClose={() => setIsImageModalVisible(false)}
                />
            )}
        </>
    );
};

export default Controls;

