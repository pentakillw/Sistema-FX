import React from 'react';
import { X, Check } from 'lucide-react';

const DisplayModeModal = ({ currentMode, onModeChange, onClose }) => {
    
    // --- MODIFICACIÓN: Opciones actualizadas como pediste ---
    const modes = [
        { id: 'name', label: 'Nombre del Color' },
        { id: 'rgb', label: 'RGB' },
        { id: 'hsl', label: 'HSL' },
        { id: 'hsb', label: 'HSB (HSV)' },
    ];

    const handleSelectMode = (modeId) => {
        onModeChange(modeId);
        onClose();
    };

    return (
        // Fondo responsivo
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            {/* Panel responsivo (bottom sheet en móvil) */}
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-xs w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle visual para el bottom sheet en móvil */}
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>
                        Formato Secundario
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div className="mt-2 space-y-2">
                    <p className="text-sm" style={{ color: 'var(--text-muted)'}}>
                        Elige el formato del texto secundario en la paleta.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                        {modes.map(mode => (
                            <button 
                                key={mode.id} 
                                onClick={() => handleSelectMode(mode.id)}
                                className={`w-full text-left flex justify-between items-center p-3 rounded-lg text-sm font-medium transition-colors
                                    ${currentMode === mode.id 
                                        ? 'bg-[var(--action-primary-default)] text-white' 
                                        : 'bg-[var(--bg-muted)] text-[var(--text-default)] hover:bg-[var(--border-default)]'
                                    }`}
                            >
                                <span>{mode.label}</span>
                                {currentMode === mode.id && <Check size={16} strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisplayModeModal;