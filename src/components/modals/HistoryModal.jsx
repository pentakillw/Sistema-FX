import React from 'react';
import { Clock, X } from 'lucide-react';

const HistoryModal = ({ history, onSelect, onClose }) => {
    // Tomamos los últimos 15 elementos y los invertimos para mostrar el más reciente primero.
    const recentHistory = [...history].slice(-15).reverse();

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="p-6 rounded-xl border max-w-md w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <Clock size={24} /> Historial de Paletas
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                
                <div className="overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '60vh' }}>
                    {recentHistory.length > 1 ? (
                        recentHistory.map((state, index) => (
                            <div 
                                key={history.length - 1 - index} 
                                className="cursor-pointer group"
                                onClick={() => onSelect(history.length - 1 - index)}
                            >
                                <p className="text-xs font-semibold mb-1.5 text-[var(--text-muted)] group-hover:text-[var(--text-default)] transition-colors">
                                    Paleta {history.length - 1 - index}
                                </p>
                                <div className="flex h-12 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-default)'}}>
                                    {state.explorerPalette.map((color, i) => (
                                        <div key={i} style={{ backgroundColor: color, flex: 1 }} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            Aún no has generado ninguna paleta. ¡Usa la barra espaciadora para empezar!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
