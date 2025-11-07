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
        // --- ¡MODIFICADO! --- Fondo centrado
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            {/* --- ¡MODIFICADO! ---
              - Cambiado a 'bg-white' y 'rounded-xl'
              - Eliminado padding de safe-area y handle visual
            */}
            <div
                className="p-6 rounded-xl border border-gray-200 max-w-xs w-full relative flex flex-col bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- ELIMINADO --- Handle visual de móvil */}
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Formato Secundario
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                        Elige el formato del texto secundario en la paleta.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                        {modes.map(mode => (
                            <button 
                                key={mode.id} 
                                onClick={() => handleSelectMode(mode.id)}
                                className={`w-full text-left flex justify-between items-center p-3 rounded-lg text-sm font-medium transition-colors
                                    ${currentMode === mode.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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