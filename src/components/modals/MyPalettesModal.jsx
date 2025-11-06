import React from 'react';
import { X, Loader2, Trash2, FolderOpen, AlertTriangle } from 'lucide-react';
import tinycolor from 'tinycolor2';

// Componente para cada fila de paleta guardada
const PaletteRow = ({ palette, onLoad, onDelete, isDeleting }) => {
    return (
        <div className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-[var(--bg-muted)]">
            <div 
                className="flex-1 cursor-pointer"
                onClick={() => onLoad(palette)}
            >
                <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-default)' }}>
                    {palette.name}
                </p>
                <div className="flex h-8 rounded-md overflow-hidden border" style={{ borderColor: 'var(--border-default)'}}>
                    {(palette.colors || []).map((color, i) => (
                        <div key={i} style={{ backgroundColor: color, flex: 1 }} title={color} />
                    ))}
                </div>
            </div>
            <button
                onClick={() => onDelete(palette.id)}
                disabled={isDeleting}
                className="p-2 rounded-full text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                title="Eliminar paleta"
            >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
        </div>
    );
};


const MyPalettesModal = ({ 
    onClose, 
    palettes, 
    isLoading, 
    onLoadPalette, 
    onDeletePalette, 
    deletingId 
}) => {

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-lg w-full relative flex flex-col max-h-[90vh] md:max-h-[70vh]"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                        <FolderOpen size={24} className="text-purple-500" /> Mis Paletas Guardadas
                    </h2>
                    <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div className="overflow-y-auto flex-grow -mr-2 pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 size={32} className="animate-spin text-purple-500" />
                        </div>
                    ) : !palettes || palettes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center h-48 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)'}}>
                            <AlertTriangle size={32} className="text-amber-500 mb-2" />
                            <p className="font-semibold" style={{ color: 'var(--text-default)'}}>No tienes paletas guardadas</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)'}}>Usa el botón "Guardar" en el header para guardar tu paleta actual.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {palettes.map(palette => (
                                <PaletteRow
                                    key={palette.id}
                                    palette={palette}
                                    onLoad={onLoadPalette}
                                    onDelete={onDeletePalette}
                                    isDeleting={deletingId === palette.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPalettesModal;