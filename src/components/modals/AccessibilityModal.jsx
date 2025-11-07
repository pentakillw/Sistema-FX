import React from 'react';
import { Eye, CheckCircle, AlertTriangle, XCircle, Copy, X } from 'lucide-react';

// Subcomponente (sin cambios)
const ContrastMeter = ({ title, ratio, bgColor, fgColor, onCopy }) => {
    const getLevelInfo = () => {
        if (ratio >= 7) {
            return { text: 'Excelente', color: '#22c55e', icon: <CheckCircle size={16} /> };
        }
        if (ratio >= 4.5) {
            return { text: 'Aceptable', color: '#c4810c', icon: <AlertTriangle size={16} /> };
        }
        return { text: 'Fallido', color: '#ef4444', icon: <XCircle size={16} /> };
    };

    const levelInfo = getLevelInfo();
    const progress = Math.min((ratio / 12) * 100, 100);

    const handleCopy = (color) => {
        navigator.clipboard.writeText(color);
        onCopy(`Color ${color.toUpperCase()} copiado!`);
    };

    return (
        <div className="p-4 rounded-lg flex flex-col bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-800">{title}</h3>
            <div className="flex items-center gap-4">
                <div 
                    className="w-20 h-14 rounded-md flex items-center justify-center font-bold text-2xl shadow-inner select-none"
                    style={{ backgroundColor: bgColor, color: fgColor, border: '1px solid var(--border-strong)' }}
                >
                    Aa
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-lg text-gray-900">{ratio}:1</span>
                        <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: levelInfo.color }}>
                            {levelInfo.icon}
                            <span>{levelInfo.text}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%`, backgroundColor: levelInfo.color }}
                        />
                        <div className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${(4.5 / 12) * 100}%` }} title="Nivel AA (4.5:1)"></div>
                        <div className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${(7 / 12) * 100}%` }} title="Nivel AAA (7:1)"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs flex-grow">
                <div 
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-200" 
                    onClick={() => handleCopy(bgColor)}
                    title={`Copiar Fondo: ${bgColor.toUpperCase()}`}
                >
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: bgColor, borderColor: 'var(--border-strong)' }}></div>
                    <div className='flex flex-col'>
                        <span className="font-semibold text-gray-800">Fondo</span>
                        <span className="font-mono text-gray-500">{bgColor.toUpperCase()}</span>
                    </div>
                </div>
                <div 
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-200" 
                    onClick={() => handleCopy(fgColor)}
                    title={`Copiar Texto: ${fgColor.toUpperCase()}`}
                >
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: fgColor, borderColor: 'var(--border-strong)' }}></div>
                    <div className='flex flex-col'>
                        <span className="font-semibold text-gray-800">Texto</span>
                        <span className="font-mono text-gray-500">{fgColor.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccessibilityModal = ({ accessibility, colors, onCopy, onClose }) => {
    return (
        // --- ¡MODIFICADO! ---
        // 'items-end md:items-center p-0 md:p-4' cambiado a 'items-center justify-center p-4'
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* --- ¡MODIFICADO! ---
              - Cambiado a 'bg-white' y 'rounded-xl'
              - Eliminado 'rounded-t-2xl md:rounded-xl'
              - Eliminado 'pb-[env(safe-area-inset-bottom)]'
              - Cambiado 'bg-[var(--bg-card)]' a 'bg-white'
            */}
            <div 
                className="p-6 rounded-xl border border-gray-200 max-w-3xl w-full relative flex flex-col bg-white max-h-[90vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- ELIMINADO --- Handle visual de móvil */}
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <Eye size={24} strokeWidth={1.75} /> Verificación de Accesibilidad
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                {/* --- MODIFICADO --- 'overflow-y-auto' para el contenido */}
                <div className="mt-4 pt-4 border-t border-gray-200 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ContrastMeter 
                            title="Contraste del Color de Marca"
                            ratio={accessibility.text.ratio}
                            bgColor={colors.textBg}
                            fgColor={colors.textColor}
                            onCopy={onCopy}
                        />
                         <ContrastMeter 
                            title="Contraste del Color de Acento"
                            ratio={accessibility.btn.ratio}
                            bgColor={colors.btnBg}
                            fgColor={colors.btnText}
                            onCopy={onCopy}
                        />
                    </div>
                     <p className="text-xs text-center mt-6 text-gray-500">
                        Los ratios de contraste se basan en las <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-600">guías WCAG</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityModal;