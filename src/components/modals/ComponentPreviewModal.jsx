import React from 'react';
import { Eye, Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

const ComponentPreviewModal = ({ primaryButtonTextColor, onClose }) => {
    return (
        // --- MODIFICACIÓN --- Backdrop responsivo
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            {/* --- MODIFICACIÓN ---
              - Panel responsivo (bottom sheet en móvil)
              - Padding inferior con 'safe-area-inset'.
            */}
            <div 
                className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-4xl w-full relative flex flex-col bg-[var(--bg-card)] max-h-[90vh] md:max-h-[70vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                 {/* --- NUEVO --- Handle visual para el bottom sheet en móvil */}
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                 
                 <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-default)]">
                        <Eye size={24} /> Vista Previa de Componentes
                    </h2>
                    <button onClick={onClose} className="text-[var(--text-muted)]"><X size={24} /></button>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-default)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna Izquierda: Controles y Botones */}
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg border bg-[var(--bg-muted)]" style={{ borderColor: 'var(--border-strong, var(--border-default))' }}>
                                <h4 className="font-bold mb-2 text-[var(--text-default)]">Título de la Tarjeta</h4>
                                <p className="text-sm text-[var(--text-muted)]">Este es un ejemplo de texto dentro de una tarjeta.</p>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Campo de texto normal" 
                                    className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)] bg-[var(--bg-muted)] text-[var(--text-default)]" 
                                    style={{ borderColor: 'var(--border-default)' }} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Campo de texto con borde fuerte" 
                                    className="w-full px-3 py-2 rounded-md border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--action-primary-default)] bg-[var(--bg-muted)] text-[var(--text-default)]" 
                                    style={{ borderColor: 'var(--action-primary-default)' }} 
                                />
                            </div>
                            <div className="space-y-3">
                                <button 
                                    className="w-full font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]" 
                                    style={{ backgroundColor: 'var(--action-primary-default)', color: primaryButtonTextColor }}
                                >
                                    Botón Primario
                                </button>
                                <button 
                                    className="w-full font-bold py-2 px-4 rounded-lg transition-colors border hover:bg-[var(--bg-muted)] active:bg-[var(--border-default)] text-[var(--text-default)]" 
                                    style={{ backgroundColor: 'transparent', borderColor: 'var(--border-strong, var(--border-default))' }}
                                >
                                    Botón Secundario
                                </button>
                            </div>
                        </div>
                        {/* Columna Derecha: Alertas */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-md text-[var(--text-default)]">Alertas</h4>
                            <div className="flex items-start p-3 rounded-md" style={{ backgroundColor: 'var(--bg-info-weak, #e0f2fe)' }}>
                                <Info size={20} style={{ color: 'var(--text-info, #0ea5e9)', minWidth: '20px' }} className="mr-3 mt-0.5" />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-info, #0ea5e9)' }}>Notificación de información.</p>
                            </div>
                            <div className="flex items-start p-3 rounded-md" style={{ backgroundColor: 'var(--bg-success-weak, #dcfce7)' }}>
                                <CheckCircle size={20} style={{ color: 'var(--text-success, #22c55e)', minWidth: '20px' }} className="mr-3 mt-0.5" />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-success, #22c55e)' }}>Operación completada con éxito.</p>
                            </div>
                            <div className="flex items-start p-3 rounded-md" style={{ backgroundColor: 'var(--bg-attention-weak, #ffedd5)' }}>
                                <AlertTriangle size={20} style={{ color: 'var(--text-attention, #f97316)', minWidth: '20px' }} className="mr-3 mt-0.5" />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-attention, #f97316)' }}>Atención: esto requiere tu revisión.</p>
                            </div>
                            <div className="flex items-start p-3 rounded-md" style={{ backgroundColor: 'var(--bg-critical-weak, #fee2e2)' }}>
                                <AlertCircle size={20} style={{ color: 'var(--text-critical, #ef4444)', minWidth: '20px' }} className="mr-3 mt-0.5" />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-critical, #ef4444)' }}>Error: algo salió mal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentPreviewModal;
