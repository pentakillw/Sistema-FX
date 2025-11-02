import React from 'react';
import { X } from 'lucide-react';

const HelpModal = ({ onClose }) => (
    // --- MODIFICACIÓN --- Backdrop responsivo
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
        {/* --- MODIFICACIÓN ---
          - Panel responsivo (bottom sheet en móvil)
          - Padding inferior con 'safe-area-inset'.
        */}
        <div 
            className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-2xl w-full relative flex flex-col max-h-[90vh] md:max-h-[70vh]" 
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}
            onClick={(e) => e.stopPropagation()}
        >
            {/* --- NUEVO --- Handle visual para el bottom sheet en móvil */}
            <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
            
            <div className="flex-shrink-0">
                <button onClick={onClose} className="absolute top-4 right-4 p-2" style={{ color: 'var(--text-muted)'}}>
                    <X size={24}/>
                </button>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-default)'}}>Guía Rápida</h2>
            </div>
            
            <div className="overflow-y-auto">
                <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)'}}>
                    <p>¡Hola! Con esta herramienta, crearás una paleta de colores profesional en segundos. Sigue estos 4 pasos:</p>
                    <div className="space-y-3">
                        <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>1. Elige tu Color Principal</h3>
                        <p>Usa el selector de <strong>Color de Marca</strong> para elegir tu color base. ¿No tienes uno? Presiona el botón <strong>Aleatorio ✨</strong> para descubrir colores geniales que funcionan bien.</p>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>2. Ajusta y Personaliza</h3>
                        <p>Activa <strong>Gris Automático 🤖</strong> para que la herramienta elija la mejor escala de grises por ti. Selecciona la <strong>Fuente</strong> que más te guste y cambia entre <strong>Modo Claro y Oscuro</strong> para previsualizar.</p>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>3. Guarda y Carga tus Temas</h3>
                        <p>Usa los botones de <strong>Exportar 💾</strong> para guardar tu diseño actual en un archivo. ¿Quieres continuar con un diseño guardado? Usa <strong>Importar 📂</strong> para cargarlo.</p>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-semibold" style={{ color: 'var(--text-default)'}}>4. Exporta tu Código</h3>
                        <p>En la sección <strong>Opciones de Exportación</strong>, elige el formato que necesitas (Power Fx, CSS, o Tailwind), copia el código y pégalo directamente en tu proyecto. ¡Listo!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default HelpModal;
