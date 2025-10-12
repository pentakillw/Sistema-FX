import React, { useState } from 'react';
import { Eye, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const ComponentPreview = ({ primaryButtonTextColor }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                    <Eye size={20} /> Vista Previa de Componentes
                </h2>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-sm font-medium py-1 px-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}
                >
                    {isVisible ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>

            {isVisible && (
                 <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-default)'}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            {/* Card */}
                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-strong)'}}>
                                <h4 className="font-bold mb-2" style={{ color: 'var(--text-default)'}}>Título de la Tarjeta</h4>
                                <p className="text-sm" style={{ color: 'var(--text-muted)'}}>Este es un ejemplo de cómo se ve el texto dentro de una tarjeta.</p>
                            </div>
                            {/* Inputs */}
                            <div className="space-y-3">
                                <input type="text" placeholder="Campo de texto normal" className="w-full px-3 py-2 rounded-md border text-sm" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-default)'}} />
                                <input type="text" placeholder="Campo de texto con borde fuerte" className="w-full px-3 py-2 rounded-md border-2 text-sm" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--action-primary-default)', color: 'var(--text-default)'}} />
                            </div>
                            {/* Botones */}
                            <div className="space-y-3">
                                <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--action-primary-default)', color: primaryButtonTextColor }}>Botón Primario</button>
                                <button className="w-full font-bold py-2 px-4 rounded-lg transition-colors border" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', borderColor: 'var(--border-strong)'}}>Botón Secundario</button>
                            </div>
                        </div>
                        {/* Columna Derecha */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-md" style={{ color: 'var(--text-default)'}}>Alertas</h4>
                            <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-info-weak)'}}>
                                <Info size={20} style={{color: 'var(--text-info)', minWidth: '20px'}} className="mr-3"/>
                                <p className="text-sm font-medium" style={{color: 'var(--text-info)'}}>Esto es una notificación de información.</p>
                            </div>
                            <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-success-weak)'}}>
                                <CheckCircle size={20} style={{color: 'var(--text-success)', minWidth: '20px'}} className="mr-3"/>
                                <p className="text-sm font-medium" style={{color: 'var(--text-success)'}}>¡La operación se completó con éxito!</p>
                            </div>
                            <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-attention-weak)'}}>
                                <AlertTriangle size={20} style={{color: 'var(--text-attention)', minWidth: '20px'}} className="mr-3"/>
                                <p className="text-sm font-medium" style={{color: 'var(--text-attention)'}}>Atención: esto requiere tu revisión.</p>
                            </div>
                            <div className="flex items-center p-3 rounded-md" style={{backgroundColor: 'var(--bg-critical-weak)'}}>
                                <AlertCircle size={20} style={{color: 'var(--text-critical)', minWidth: '20px'}} className="mr-3"/>
                                <p className="text-sm font-medium" style={{color: 'var(--text-critical)'}}>Error: algo salió mal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
export default ComponentPreview;

