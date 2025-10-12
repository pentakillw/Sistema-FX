import React from 'react';
import { X } from 'lucide-react';

const HelpModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="p-8 rounded-xl border max-w-2xl w-full relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}>
            <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)'}}>
                <X size={24}/>
            </button>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-default)'}}>Guía Rápida para Tu Sistema de Diseño</h2>
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
);

export default HelpModal;
