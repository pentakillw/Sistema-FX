import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmDeleteModal = ({ title, message, onClose, onConfirm, isDeleting = false }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[70] flex items-end md:items-center justify-center p-0 md:p-4" 
            onClick={onClose}
        >
            <div
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-md w-full relative flex flex-col"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <AlertTriangle size={24} /> {title || "Confirmar Eliminación"}
                    </h2>
                    <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div className="mt-4 space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-default)'}}>
                        {message || "¿Estás seguro de que quieres eliminar esto? Esta acción no se puede deshacer."}
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="font-bold py-2.5 px-6 rounded-lg transition-colors border"
                        style={{
                            backgroundColor: 'var(--bg-muted)',
                            color: 'var(--text-default)',
                            borderColor: 'var(--border-default)',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 w-32 font-bold py-2.5 px-6 rounded-lg transition-colors text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            'Borrar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;