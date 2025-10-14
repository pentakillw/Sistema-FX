import React from 'react';
import tinycolor from 'tinycolor2';
import { Layers } from 'lucide-react';

// Componente interno para una sola fila de paleta
const SemanticPaletteRow = ({ title, colors, onColorCopy, themeOverride }) => {
    const titleColor = themeOverride === 'light' ? 'var(--text-default)' : '#FFF';
    const textColor = themeOverride === 'light' ? 'var(--text-muted)' : '#D1D5DB';

    return (
        <div className="mb-4">
            <h3 className="text-sm font-medium mb-2" style={{ color: titleColor }}>{title}</h3>
            <div className="overflow-x-auto pb-2 -mb-2">
                <div className="flex rounded-md overflow-hidden h-10 relative group" style={{ minWidth: `${colors.length * 30}px` }}>
                    {(colors || []).map((item) => (
                        <div
                            key={item.name}
                            className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10 flex items-center justify-center"
                            style={{ backgroundColor: item.color, minWidth: '30px' }}
                            onClick={() => onColorCopy(item.color, `${title}: ${item.name} (${item.color.toUpperCase()}) copiado!`)}
                            title={`${item.name} - ${item.color.toUpperCase()}`}
                        >
                            <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ color: tinycolor(item.color).isLight() ? '#000' : '#FFF' }}>
                                {item.color.substring(1).toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
             {/* --- MODIFICACIÓN --- Se cambia la forma de mostrar los títulos para evitar el desbordamiento y desalineación. */}
            <div className={`hidden sm:block overflow-x-auto pb-2 -mb-2`}>
                <div className="flex text-xs pt-2 mt-1" style={{ color: textColor, minWidth: `${colors.length * 60}px` }}>
                    {/* En lugar de mapear cada título, los unimos en un solo elemento para un mejor control del layout */}
                    {(colors || []).map((item) => (
                         <div key={item.name} className="flex-1 text-center text-wrap text-[10px] py-1" title={item.name} style={{ minWidth: '60px' }}>
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const backgroundModeLabels = {
    'card': 'Fondo Tarjeta',
    'white': 'Fondo Blanco',
    'T950': 'Fondo T950',
    'black': 'Fondo Negro',
    'T0': 'Fondo T0',
};

const getPreviewBgColor = (mode, themeData) => {
    const { grayShades, stylePalette } = themeData;
    if (!grayShades || grayShades.length < 20) return '#FFFFFF';
    switch (mode) {
        case 'white': return '#FFFFFF';
        case 'T950': return grayShades[19];
        case 'black': return '#000000';
        case 'T0': return grayShades[0];
        case 'card':
        default:
            return stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color;
    }
};

const SemanticPalettes = ({ stylePalette, onCopy, themeData, previewMode, onCyclePreviewMode }) => {
    const bgColor = getPreviewBgColor(previewMode, themeData);
    const isLight = tinycolor(bgColor).isLight();
    const textColor = isLight ? 'var(--text-default)' : '#FFF';
    const buttonBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const themeOverride = isLight ? 'light' : 'dark';

    return (
        <section className="p-4 sm:p-6 rounded-xl border mb-8" style={{ backgroundColor: bgColor, borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-bold text-lg" style={{ color: textColor }}>Paletas Semánticas</h2>
                <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: buttonBg, color: textColor }}>
                        {backgroundModeLabels[previewMode]}
                    </span>
                    <button
                        onClick={onCyclePreviewMode}
                        className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: buttonBg, color: textColor }}
                    >
                        <Layers size={14} /> Alternar Fondo
                    </button>
                </div>
            </div>
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <SemanticPaletteRow title="Fondos" colors={stylePalette.fullBackgroundColors} onColorCopy={onCopy} themeOverride={themeOverride} />
                <SemanticPaletteRow title="Textos" colors={stylePalette.fullForegroundColors} onColorCopy={onCopy} themeOverride={themeOverride} />
                <SemanticPaletteRow title="Bordes" colors={stylePalette.fullBorderColors} onColorCopy={onCopy} themeOverride={themeOverride} />
                <SemanticPaletteRow title="Acciones" colors={stylePalette.fullActionColors} onColorCopy={onCopy} themeOverride={themeOverride} />
                <SemanticPaletteRow title="Decorativos" colors={stylePalette.decorateColors} onColorCopy={onCopy} themeOverride={themeOverride} />
            </div>
        </section>
    );
};

export default SemanticPalettes;

