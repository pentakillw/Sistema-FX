import React from 'react';
// --- NUEVO --- Importamos Lock y Unlock
import { X, Star, Pencil, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import tinycolor from 'tinycolor2';

const ActionButton = ({ icon, label, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full p-2 rounded-md text-sm transition-colors ${className}`}
            style={{ color: 'var(--text-default)', backgroundColor: 'var(--bg-muted)' }}
        >
            {icon}
            <span className="ml-2 font-semibold">{label}</span>
        </button>
    );
};

const ColorActionMenu = ({
    color,
    onClose,
    onSetAsBrand,
    onOpenPicker,
    onRemove,
    onCopy,
    // --- NUEVO --- Props para el bloqueo
    isLocked,
    onToggleLock,
    // --- NUEVO --- Prop para el posicionamiento
    style = {},
}) => {
    // Determina el color de texto (blanco o negro) para el H E X
    const textColor = tinycolor(color).isLight() ? '#000' : '#FFF';

    return (
        // Fondo semitransparente para cerrar el menú al hacer clic fuera
        <div 
            className="fixed inset-0 z-30" 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
            {/* --- MODIFICADO ---
              El contenedor ahora usa 'absolute' y el 'style' prop 
              para posicionarse dinámicamente donde hizo clic el usuario.
              Ya no está fijado a top-1/2 left-1/2.
            */}
            <div
                className="absolute z-40 flex flex-col items-center gap-2"
                style={style} // <-- ¡AQUÍ ESTÁ LA MAGIA!
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el menú lo cierre
            >
                {/* Muestra el código H E X del color */}
                <div 
                    className="py-2 px-4 rounded-lg shadow-lg font-mono font-bold text-lg" 
                    style={{ backgroundColor: color, color: textColor, border: '1px solid var(--border-default)' }}
                >
                    {color.substring(1).toUpperCase()}
                </div>

                {/* Contenedor de los botones de acción */}
                <div 
                    className="p-2 rounded-xl shadow-lg border w-48 space-y-2"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}
                >
                    <ActionButton
                        icon={<Star size={16} />}
                        label="Usar como Marca"
                        onClick={onSetAsBrand}
                    />
                    <ActionButton
                        icon={<Pencil size={16} />}
                        label="Editar Color"
                        onClick={onOpenPicker}
                    />
                    <ActionButton
                        icon={<Copy size={16} />}
                        label="Copiar H E X"
                        onClick={onCopy}
                    />
                    {/* --- NUEVO --- Botón de bloqueo/desbloqueo */}
                    <ActionButton
                        icon={isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        label={isLocked ? "Desbloquear" : "Bloquear"}
                        onClick={onToggleLock}
                        className={isLocked ? "text-purple-600 dark:text-purple-400 font-bold" : ""}
                    />
                    <ActionButton
                        icon={<Trash2 size={16} />}
                        label="Eliminar"
                        onClick={onRemove}
                    />
                </div>
                
                 {/* Botón de cierre superior, similar a Coolors */}
                 <button 
                    onClick={onClose} 
                    className="p-2 rounded-full shadow-lg mt-2"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', border: '1px solid var(--border-default)'}}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ColorActionMenu;

