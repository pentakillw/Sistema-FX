import React from 'react';
import { Layers } from 'lucide-react';
import tinycolor from 'tinycolor2';
import ColorPalette from './ColorPalette';
// --- MODIFICACIÓN --- Importamos el Switch de nuevo
import Switch from './ui/Switch.jsx'; 

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
    isGrayAuto, 
    themeData,
    updateBrandColor,
    setGrayColor,
    setIsGrayAuto, // Ahora se usará
    simulationMode,
    handleRandomTheme 
}) => {
    
    const { brandShades, 
    grayShades } = themeData;

    if (!brandShades || !grayShades) {
        return null; 
    }

    // Obtiene el color de fondo basado en el modo (white, T950, black, T0)
    const bgColor = getPreviewBgColor(previewMode, grayShades);
    const isLight = tinycolor(bgColor).isLight();
    
    // Determina el color del texto y 
    // --- CORRECCIÓN ---
    // botones basado en el fondo
    const mainTextColor = isLight ? '#000' : '#FFF';
    const buttonBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const buttonTextColor = isLight ? '#000' : '#FFF';


    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        // --- MODIFICACIÓN: Eliminados rounded-xl y border ---
        // --- Se mantiene el padding p-4 sm:p-6 para que el contenido no se pegue a los bordes ---
        <div className="p-4 sm:p-6" style={{ backgroundColor: bgColor, ...simulationFilterStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                 <h2 className="font-bold text-lg" style={{ color: mainTextColor }}>{title}</h2>
                {/* --- MODIFICACIÓN --- Se ha re-añadido el div con el Switch */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium" style={{ color: mainTextColor }}>
                            Gris Automático
                        </label>
                        <Switch checked={isGrayAuto} onCheckedChange={setIsGrayAuto} />
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    
                    {/* Muestra la etiqueta del modo de fondo actual */}
                    <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: buttonBg, color: buttonTextColor }}>
                         {backgroundModeLabels[previewMode]}
                    </span>
                    {/* Botón para ciclar al 
siguiente modo de fondo */}
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