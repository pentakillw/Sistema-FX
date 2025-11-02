import React from 'react';
import tinycolor from 'tinycolor2';
import { Layers } from 'lucide-react';

// Componente interno para renderizar una fila de paleta semántica
const SemanticPaletteRow = ({ title, colors, onColorCopy, themeOverride }) => {
    const titleColor = themeOverride === 'light' ? 'var(--text-default)' : '#FFF';
    const textColor = themeOverride === 'light' ? 'var(--text-muted)' : '#D1D5DB';

    return (
        <div className="mb-4">
            <h3 className="text-sm font-medium mb-2" style={{ color: titleColor }}>{title}</h3>
            <div className="overflow-x-auto pb-2 -mb-2">
                 {/* MODIFICACIÓN 1: 
                   El minWidth se calcula con 64px por item, que coincide con el `w-16` de los hijos.
                   Se ha eliminado la clase `sm:min-w-0` que era innecesaria.
                 */}
                 <div style={{ minWidth: `${(colors?.length || 0) * 64}px` }}>
                    <div className="flex rounded-md overflow-hidden h-12 sm:h-10 relative group">
                        {(colors || []).map((item) => (
                            <div
                                key={item.name}
                                className="w-16 flex-shrink-0 sm:flex-1 cursor-pointer transition-transform duration-100 ease-in-out sm:group-hover:transform sm:group-hover:scale-y-110 sm:hover:!scale-125 sm:hover:z-10 flex items-center justify-center"
                                // --- MODIFICACIÓN 2: Eliminado el `minWidth: '30px'` que era conflictivo/innecesario ---
                                style={{ backgroundColor: item.color }}
                                onClick={() => onColorCopy(item.color, `${title}: ${item.name} (${item.color.toUpperCase()}) copiado!`)}
                                title={`${item.name} - ${item.color.toUpperCase()}`}
                            >
                                <span className="text-[10px] font-mono sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ color: tinycolor(item.color).isLight() ? '#000' : '#FFF' }}>
                                    {item.color.substring(1).toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Nombres de los colores semánticos */}
                    <div className="flex text-xs pt-2 mt-1" style={{ color: textColor }}>
                        {(colors || []).map((item) => (
                             <div 
                                key={item.name} 
                                // --- MODIFICACIÓN CLAVE ---
                                // - `truncate`: Corta el texto en móvil (ej: "Predeter...")
                                // - `sm:text-wrap`: Permite que el texto se envuelva en desktop
                                // - Eliminado `minWidth: '60px'` innecesario.
                                className="w-16 sm:flex-1 text-center truncate sm:text-wrap text-[10px] py-1 flex-shrink-0" 
                                title={item.name}
                             >
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Etiquetas para los modos de fondo de esta sección
const backgroundModeLabels = {
    'card': 'Fondo Tarjeta',
    'white': 'Fondo Blanco',
    'T950': 'Fondo T950',
    'black': 'Fondo Negro',
    'T0': 'Fondo T0',
};

// Función helper para obtener el color de fondo correcto
const getPreviewBgColor = (mode, themeData) => {
    const { grayShades, stylePalette } = themeData;
    if (!grayShades || grayShades.length < 20) return '#FFFFFF'; // Fallback
    switch (mode) {
        case 'white': return '#FFFFFF';
        case 'T950': return grayShades[19]; // T950 (más oscuro)
        case 'black': return '#000000';
        case 'T0': return grayShades[0]; // T0 (más claro)
        case 'card':
        default:
            // 'card' usa el color de fondo "Apagado" del tema actual
            return stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color;
    }
};

const SemanticPalettes = ({ stylePalette, onCopy, themeData, previewMode, onCyclePreviewMode, simulationMode }) => {
    // Obtiene el color de fondo basado en el modo (card, white, T950, black, T0)
    const bgColor = getPreviewBgColor(previewMode, themeData);
    const isLight = tinycolor(bgColor).isLight();
    
    // Determina colores de UI basados en el fondo
    const textColor = isLight ? 'var(--text-default)' : '#FFF';
    const buttonBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const themeOverride = isLight ? 'light' : 'dark';

    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        <section className="p-2 sm:p-6 rounded-xl border mb-4 sm:mb-8" style={{ backgroundColor: bgColor, borderColor: 'var(--border-default)', ...simulationFilterStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-bold text-lg" style={{ color: textColor }}>Paletas Semánticas</h2>
                <div className="flex items-center gap-1 sm:gap-2 self-start sm:self-center flex-wrap">
                    {/* Muestra la etiqueta del modo de fondo actual */}
                    <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: buttonBg, color: textColor }}>
                        {backgroundModeLabels[previewMode]}
                    </span>
                    {/* Botón para ciclar al siguiente modo de fondo */}
                    <button
                        onClick={onCyclePreviewMode}
                        className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-1 sm:gap-2"
                        style={{ backgroundColor: buttonBg, color: textColor }}
                    >
                        <Layers size={14} /> Alternar Fondo
                    </button>
                </div>
            </div>
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                {/* Renderiza cada fila de paleta semántica */}
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
