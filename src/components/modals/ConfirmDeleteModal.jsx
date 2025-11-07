import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmDeleteModal = ({ title, message, onClose, onConfirm, isDeleting = false }) => {
    return (
        // --- ¡MODIFICADO! --- Fondo centrado
        <div 
            className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" 
            onClick={onClose}
        >
            {/* --- ¡MODIFICADO! ---
              - Cambiado a 'bg-white' y 'rounded-xl'
              - Eliminado padding de safe-area y handle visual
            */}
            <div
                className="p-6 rounded-xl border border-gray-200 max-w-md w-full relative flex flex-col bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- ELIMINADO --- Handle visual de móvil */}
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <AlertTriangle size={24} strokeWidth={1.75} /> {title || "Confirmar Eliminación"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-700">
                        {message || "¿Estás seguro de que quieres eliminar esto? Esta acción no se puede deshacer."}
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="font-bold py-2.5 px-6 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    {/* --- BOTÓN DE DESTRUCCIÓN (SE QUEDA ROJO) --- */}
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