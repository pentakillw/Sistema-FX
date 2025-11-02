import React from 'react';
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
            {/* --- MODIFICACIÓN ---
              Contenedor principal que es un "bottom sheet" en móvil (clases por defecto)
              y un pop-up absoluto en escritorio (clases 'md:').
            */}
            <div
                className="fixed z-40 bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-[var(--bg-card)] rounded-t-2xl shadow-2xl flex flex-col items-center gap-2
                           md:absolute md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:rounded-none md:shadow-none"
                style={style} // El 'style' (top/left) solo tendrá efecto en 'md:' (escritorio)
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- NUEVO --- Handle visual para el bottom sheet en móvil */}
                <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mb-2 md:hidden" />
                
                {/* Muestra el H E X (sin cambios) */}
                <div 
                    className="py-2 px-4 rounded-lg shadow-lg font-mono font-bold text-lg" 
                    style={{ backgroundColor: color, color: textColor, border: '1px solid var(--border-default)' }}
                >
                    {color.substring(1).toUpperCase()}
                </div>

                {/* Contenedor de botones de acción (sin cambios) */}
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
                
                 {/* Botón de cierre (ahora oculto en móvil) */}
                 <button 
                    onClick={onClose} 
                    className="p-2 rounded-full shadow-lg mt-2 hidden md:block" // --- MODIFICACIÓN: 'hidden md:block'
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-default)', border: '1px solid var(--border-default)'}}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ColorActionMenu;
