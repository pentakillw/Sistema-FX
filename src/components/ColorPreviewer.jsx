import React from 'react';
import { Layers } from 'lucide-react';
import tinycolor from 'tinycolor2';
import ColorPalette from './ColorPalette';
// --- ELIMINADO --- No se importa el Switch
// import Switch from './ui/Switch'; 

// Etiquetas para los modos de fondo
const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'white': 'Fondo Blanco',
    'T0': 'Fondo T0',
    'black': 'Fondo Negro',
};

// Función helper para obtener el color de fondo correcto
const getPreviewBgColor = (mode, shades) => {
    // Asegura que 'shades' exista y tenga suficientes elementos
    if (!shades || shades.length < 20) return '#FFFFFF'; 
    switch (mode) {
        case 'T950': return shades[19]; // T950 es el último (más oscuro)
        case 'white': return '#FFFFFF';
        case 'T0': return shades[0]; // T0 es el primero (más claro)
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

    // Obtiene el color de fondo basado en el modo (white, T950, black, T0)
    const bgColor = getPreviewBgColor(previewMode, grayShades);
    const isLight = tinycolor(bgColor).isLight();
    
    // Determina el color del texto y botones basado en el fondo
    const mainTextColor = isLight ? '#000' : '#FFF';
    const buttonBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const buttonTextColor = isLight ? '#000' : '#FFF';


    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        <div className="p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: 'var(--border-default)', ...simulationFilterStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-bold text-lg" style={{ color: mainTextColor }}>{title}</h2>
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* El interruptor "Auto" fue eliminado de este componente.
                      La prop 'isGrayAuto' ahora solo se usa para deshabilitar el picker.
                    */}
                    
                    {/* Muestra la etiqueta del modo de fondo actual */}
                    <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: buttonBg, color: buttonTextColor }}>
                        {backgroundModeLabels[previewMode]}
                    </span>
                    {/* Botón para ciclar al siguiente modo de fondo */}
                    <button
                        onClick={onCyclePreviewMode}
                        className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: buttonBg, color: buttonTextColor }}
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
