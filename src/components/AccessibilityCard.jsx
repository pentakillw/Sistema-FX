import React, { useState } from 'react';
import { Eye, CheckCircle, AlertTriangle, XCircle, Copy } from 'lucide-react';

// Subcomponente para el medidor de contraste
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
        <div className="p-4 rounded-lg flex flex-col" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-default)' }}>{title}</h3>
            <div className="flex items-center gap-4">
                <div 
                    className="w-20 h-14 rounded-md flex items-center justify-center font-bold text-2xl shadow-inner select-none"
                    style={{ backgroundColor: bgColor, color: fgColor, border: '1px solid var(--border-strong)' }}
                >
                    Aa
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-lg" style={{ color: 'var(--text-default)' }}>{ratio}:1</span>
                        <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: levelInfo.color }}>
                            {levelInfo.icon}
                            <span>{levelInfo.text}</span>
                        </div>
                    </div>
                    <div className="w-full bg-[var(--border-default)] rounded-full h-2.5 relative overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%`, backgroundColor: levelInfo.color }}
                        />
                        <div className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${(4.5 / 12) * 100}%` }} title="Nivel AA (4.5:1)"></div>
                        <div className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${(7 / 12) * 100}%` }} title="Nivel AAA (7:1)"></div>
                    </div>
                </div>
            </div>
            {/* **FIX**: Rediseño de la sección para copiar colores */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs flex-grow">
                <div 
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--border-default)]" 
                    onClick={() => handleCopy(bgColor)}
                    title={`Copiar Fondo: ${bgColor.toUpperCase()}`}
                >
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: bgColor, borderColor: 'var(--border-strong)' }}></div>
                    <div className='flex flex-col'>
                        <span className="font-semibold" style={{ color: 'var(--text-default)'}}>Fondo</span>
                        <span className="font-mono" style={{ color: 'var(--text-muted)'}}>{bgColor.toUpperCase()}</span>
                    </div>
                </div>
                <div 
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--border-default)]" 
                    onClick={() => handleCopy(fgColor)}
                    title={`Copiar Texto: ${fgColor.toUpperCase()}`}
                >
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: fgColor, borderColor: 'var(--border-strong)' }}></div>
                    <div className='flex flex-col'>
                        <span className="font-semibold" style={{ color: 'var(--text-default)'}}>Texto</span>
                        <span className="font-mono" style={{ color: 'var(--text-muted)'}}>{fgColor.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AccessibilityCard = ({ accessibility, colors, onCopy }) => {
    const [isVisible, setIsVisible] = useState(false); // **FIX**: Oculto por defecto

    return (
        <section className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                    <Eye size={20} /> Verificación de Accesibilidad
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
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
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
                     <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                        Los ratios de contraste se basan en las <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--action-primary-default)]">guías WCAG</a>. Nivel AA (mínimo) requiere 4.5:1. Nivel AAA (mejorado) requiere 7:1.
                    </p>
                </div>
            )}
        </section>
    );
};

export default AccessibilityCard;

