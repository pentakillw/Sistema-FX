import React from 'react';
import { Clock, X } from 'lucide-react';

const HistoryModal = ({ history, onSelect, onClose }) => {
    // Tomamos los últimos 15 elementos y los invertimos para mostrar el más reciente primero.
    const recentHistory = [...history].slice(-15).reverse();

    return (
        // --- ¡MODIFICADO! --- Fondo centrado
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            {/* --- ¡MODIFICADO! ---
              - Cambiado a 'bg-white' y 'rounded-xl'
              - Eliminado padding de safe-area y handle visual
            */}
            <div
                className="p-6 rounded-xl border border-gray-200 max-w-md w-full relative flex flex-col bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- ELIMINADO --- Handle visual de móvil */}
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <Clock size={24} strokeWidth={1.75} /> Historial de Paletas
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                
                <div className="overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '60vh' }}>
                    {recentHistory.length > 1 ? (
                        recentHistory.map((state, index) => (
                            <div 
                                key={history.length - 1 - index} 
                                className="cursor-pointer group"
                                onClick={() => onSelect(history.length - 1 - index)}
                            >
                                <p className="text-xs font-semibold mb-1.5 text-gray-500 group-hover:text-gray-900 transition-colors">
                                    Paleta {history.length - 1 - index}
                                </p>
                                <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
                                    {state.explorerPalette.map((color, i) => (
                                        <div key={i} style={{ backgroundColor: color, flex: 1 }} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center py-8 text-gray-500">
                            Aún no has generado ninguna paleta. ¡Usa la barra espaciadora para empezar!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;