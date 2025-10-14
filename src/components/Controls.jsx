import React, { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
// --- MODIFICACIÓN --- Se quita el ícono `Eye` que ya no se usa aquí
import { 
    SlidersHorizontal, ChevronDown, 
    Paintbrush, TestTube2, Eye
} from 'lucide-react';
import { availableFonts } from '../utils/colorUtils.js';
import Switch from './ui/Switch.jsx';

const TabButton = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                isActive 
                    ? 'bg-[var(--action-primary-default)] text-white shadow-md' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-default)]'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

const FormField = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            {label}
        </label>
        {children}
    </div>
);


const Controls = ({ hook, onOpenAccessibilityModal, onOpenComponentPreviewModal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('essentials');
    
    const [isBrandPickerVisible, setIsBrandPickerVisible] = useState(false);
    const [isGrayPickerVisible, setIsGrayPickerVisible] = useState(false);

    // --- MODIFICACIÓN --- Se quitan `simulationMode` y `setSimulationMode` de aquí
    const {
        font, brandColor, grayColor, isGrayAuto,
        setFont, updateBrandColor, setGrayColor,
        setIsGrayAuto
    } = hook;
    
    const selectStyles = "w-full bg-[var(--bg-muted)] font-semibold px-3 py-2.5 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)] focus:border-[var(--action-primary-default)] transition-all";
    const analysisButtonStyles = "flex items-center justify-center gap-2 w-full p-3 rounded-lg text-sm font-semibold transition-colors bg-[var(--bg-muted)] hover:ring-2 hover:ring-[var(--action-primary-default)]";

    return (
        <>
            <section className="rounded-xl border shadow-lg overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div
                    className="flex justify-between items-center p-4 sm:p-5 cursor-pointer group"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={20} className="text-[var(--text-muted)] group-hover:text-[var(--text-default)] transition-colors" />
                        <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--text-default)]">
                            Panel de Control
                        </h3>
                    </div>
                    <ChevronDown
                        size={24}
                        className={`text-[var(--text-muted)] group-hover:text-[var(--text-default)] transition-all duration-300 ${isOpen && 'rotate-180'}`}
                    />
                </div>

                <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                        
                        <div className="flex justify-center items-center gap-2 sm:gap-4 p-2 my-4 rounded-full" style={{ backgroundColor: 'var(--bg-muted)'}}>
                            <TabButton label="Esenciales" icon={<Paintbrush size={16}/>} isActive={activeTab === 'essentials'} onClick={() => setActiveTab('essentials')} />
                            <TabButton label="Análisis" icon={<TestTube2 size={16}/>} isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                        </div>

                        {activeTab === 'essentials' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-fade-in">
                                <FormField label="Color de Marca" className="md:col-span-2">
                                     <div className="relative">
                                        <div className="flex items-center rounded-lg border-2 border-transparent focus-within:border-[var(--action-primary-default)] focus-within:ring-2 focus-within:ring-[var(--action-primary-default)] bg-[var(--bg-muted)] transition-all">
                                            <div className="w-12 h-12 rounded-l-md cursor-pointer border-r" style={{ backgroundColor: brandColor, borderColor: 'var(--border-default)' }} onClick={() => setIsBrandPickerVisible(v => !v)} />
                                            <HexColorInput prefixed color={brandColor} onChange={updateBrandColor} className="text-lg font-mono bg-transparent p-3 w-full focus:outline-none" style={{ color: 'var(--text-default)' }} />
                                        </div>
                                        {isBrandPickerVisible && (<div className="absolute z-20 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsBrandPickerVisible(false)} /><HexColorPicker color={brandColor} onChange={updateBrandColor} /></div>)}
                                    </div>
                                </FormField>
                                
                                <FormField label="Escala de Grises">
                                    <div className={`relative transition-opacity ${isGrayAuto ? 'opacity-60' : 'opacity-100'}`}>
                                        <div className="flex items-center rounded-lg bg-[var(--bg-muted)]">
                                            <div className={`w-10 h-10 rounded-l-md border-r ${isGrayAuto ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: grayColor, borderColor: 'var(--border-default)' }} onClick={() => !isGrayAuto && setIsGrayPickerVisible(v => !v)} />
                                            <HexColorInput prefixed color={grayColor} onChange={setGrayColor} className="font-mono bg-transparent p-2 w-full focus:outline-none" style={{ color: 'var(--text-default)' }} disabled={isGrayAuto} />
                                        </div>
                                        {isGrayPickerVisible && !isGrayAuto && (<div className="absolute z-20 top-full mt-2 left-0"><div className="fixed inset-0 -z-10" onClick={() => setIsGrayPickerVisible(false)} /><HexColorPicker color={grayColor} onChange={setGrayColor} /></div>)}
                                    </div>
                                </FormField>

                                <FormField label="Auto">
                                    <div className="flex items-center justify-center bg-[var(--bg-muted)] h-10 rounded-lg">
                                        <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                                    </div>
                                </FormField>

                                <FormField label="Fuente Principal" className="md:col-span-2">
                                    <select value={font} onChange={(e) => setFont(e.target.value)} className={selectStyles} style={{ color: 'var(--text-default)' }}>
                                        {Object.keys(availableFonts).map(fontName => (<option key={fontName} value={fontName}>{fontName}</option>))}
                                    </select>
                                </FormField>

                                {/* --- MODIFICACIÓN --- Se elimina el FormField del simulador de daltonismo */}
                            </div>
                        )}
                        
                        {activeTab === 'analysis' && (
                            <div className="pt-4 animate-fade-in space-y-4">
                                <button onClick={onOpenAccessibilityModal} className={analysisButtonStyles} style={{color: 'var(--text-default)'}}>
                                    <Eye size={16}/> Verificación de Accesibilidad
                                </button>
                                <button onClick={onOpenComponentPreviewModal} className={analysisButtonStyles} style={{color: 'var(--text-default)'}}>
                                    <Eye size={16}/> Vista Previa de Componentes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Controls;

