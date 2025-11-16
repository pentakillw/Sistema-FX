import React from 'react';
import { X, Star, Pencil, Copy, Trash2, Lock, Unlock, Plus } from 'lucide-react';
import tinycolor from 'tinycolor2';

const ActionButton = ({ icon, label, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            // --- ¡MODIFICADO! ---
            // Estilo de lista: ancho completo, texto a la izquierda, más padding.
            className={`flex items-center w-full px-4 py-3 text-left text-base transition-colors rounded-lg hover:bg-[var(--bg-muted)] ${className}`}
            style={{ color: 'var(--text-default)' }}
        >
            {icon}
            <span className="ml-4 font-semibold">{label}</span>
        </button>
    );
};

const ColorActionMenu = ({
    color,
    onClose,
    onSetAsBrand,
    onOpenPicker,
    onRemove,
    onAddAfter, // <-- ¡NUEVO!
    onCopy,
    isLocked,
    onToggleLock,
    style = {}, // El 'style' de posicionamiento viene de Explorer.jsx
}) => {
    const textColor = tinycolor(color).isLight() ? '#000' : '#FFF';

    return (
        // Fondo semitransparente para cerrar
        <div 
            className="fixed inset-0 z-30" 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
            {/* Contenedor principal que es un "bottom sheet" en móvil (clases por defecto)
              y un pop-up absoluto en escritorio (clases 'md:').
            */}
            <div
                // --- ¡MODIFICADO! ---
                // Se ajusta el padding y se elimina el 'gap'
                className="fixed z-40 bottom-0 left-0 right-0 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-[var(--bg-card)] rounded-t-2xl shadow-2xl flex flex-col items-center
                           md:absolute md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:rounded-none md:shadow-none"
                style={style} // El 'style' (top/left) solo tendrá efecto en 'md:' (escritorio)
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle visual para el bottom sheet en móvil */}
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mb-2 md:hidden" />
                
                {/* Muestra el H E X (sin cambios) */}
                <div 
                    // --- ¡MODIFICADO! ---
                    // Ancho completo y margen inferior
                    className="py-2 px-4 rounded-lg shadow-lg font-mono font-bold text-lg w-full text-center mb-2" 
                    style={{ backgroundColor: color, color: textColor, border: '1px solid var(--border-default)' }}
                >
                    {color.substring(1).toUpperCase()}
                </div>

                {/* Contenedor de botones de acción (sin cambios) */}
                <div 
                    // --- ¡MODIFICADO! ---
                    // Se quita el ancho fijo 'w-48' y los bordes/sombras.
                    // Se añade 'max-h-[50vh]' y 'overflow-y-auto' para evitar que se corte.
                    className="w-full space-y-1 py-2 max-h-[50vh] overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-card)'}}
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
                    <ActionButton
                        icon={isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        label={isLocked ? "Desbloquear" : "Bloquear"}
                        onClick={onToggleLock}
                        className={isLocked ? "text-purple-600 dark:text-purple-400 font-bold" : ""}
                    />
                    <ActionButton // <-- ¡NUEVO!
                        icon={<Plus size={16} />}
                        label="Añadir Color"
                        onClick={onAddAfter}
                    />
                    <ActionButton
                        icon={<Trash2 size={16} />}
                        label="Eliminar"
                        onClick={onRemove}
                    />
                </div>
                
                 {/* Botón de cierre (ahora oculto en móvil) */}
                 <button 
                    onClick={onClose} 
                    className="p-2 rounded-full shadow-lg mt-2 hidden md:block" // 'hidden md:block'
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', border: '1px solid var(--border-default)'}}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ColorActionMenu;