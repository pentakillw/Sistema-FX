import React from 'react';
import { Layers } from 'lucide-react';
import tinycolor from 'tinycolor2';
import ColorPalette from './ColorPalette';
// --- ELIMINADO --- No se importa el Switch
// import Switch from './ui/Switch'; 

const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'white': 'Fondo Blanco',
    'T0': 'Fondo T0',
    'black': 'Fondo Negro',
};

const getPreviewBgColor = (mode, shades) => {
    if (!shades || shades.length < 20) return '#FFFFFF';
    switch (mode) {
        case 'T950': return shades[19];
        case 'white': return '#FFFFFF';
        case 'T0': return shades[0];
        case 'black': return '#000000';
        default: return '#FFFFFF';
    }
};

const ColorPreviewer = ({
    title,
    themeOverride,
    previewMode,
    onCyclePreviewMode,
    onShadeCopy,
    brandColor,
    grayColor,
    isGrayAuto, // Se sigue recibiendo para deshabilitar el picker de gris
    themeData,
    updateBrandColor,
    setGrayColor,
    setIsGrayAuto, // Se sigue recibiendo, aunque no se use, para evitar errores
    simulationMode,
    // --- NUEVO --- Se recibe la función para generar tema aleatorio
    handleRandomTheme 
}) => {
    
    const { brandShades, grayShades } = themeData;

    if (!brandShades || !grayShades) {
        return null; 
    }

    const bgColor = getPreviewBgColor(previewMode, grayShades);
    const isLight = tinycolor(bgColor).isLight();
    
    // --- MODIFICADO ---
    // Se usa 'var(--bg-muted)' y 'var(--text-default)' para los botones
    // en lugar de lógica de JS, para que se adapten al tema.
    const textColor = isLight ? 'var(--text-default)' : 'var(--text-default)';
    const buttonBg = isLight ? 'var(--bg-muted)' : 'var(--bg-muted)';
    // El texto principal sí depende del fondo de la vista previa
    const mainTextColor = isLight ? '#000' : '#FFF';


    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: 'var(--border-default)', ...simulationFilterStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-bold text-lg" style={{ color: mainTextColor }}>{title}</h2>
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* --- ELIMINADO ---
                      Se ha eliminado el interruptor "Auto" y su label
                    */}
                    
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

            <ColorPalette 
                title="Color de Marca" 
                color={brandColor} 
                hex={brandColor} 
                shades={brandShades} 
                onShadeCopy={(color) => onShadeCopy(`Tono ${color.toUpperCase()} copiado!`)} 
                themeOverride={themeOverride} 
                onColorChange={updateBrandColor}
                // --- NUEVO --- Se pasa la función al componente de paleta
                onGenerateFromShade={handleRandomTheme}
            />
            <ColorPalette 
                title="Escala de Grises" 
                color={grayColor} 
                hex={grayColor} 
                shades={grayShades} 
                onShadeCopy={(color) => onShadeCopy(`Tono ${color.toUpperCase()} copiado!`)} 
                themeOverride={themeOverride}
                onColorChange={setGrayColor}
                isDisabled={isGrayAuto}
                // --- NUEVO --- Se pasa la función al componente de paleta
                onGenerateFromShade={handleRandomTheme}
            />
        </div>
    );
};

export default ColorPreviewer;

