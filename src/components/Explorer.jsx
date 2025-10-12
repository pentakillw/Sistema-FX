import React, { useState } from 'react';
import { Layers, Settings, Palette, ShieldCheck } from 'lucide-react';
import tinycolor from 'tinycolor2';
import ColorPalette from './ColorPalette.jsx';
import { VariationsModal, PaletteContrastChecker, PaletteAdjusterModal } from './modals/index.jsx';

const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'T0': 'Fondo T0',
    'white': 'Fondo Blanco',
    'black': 'Fondo Negro',
    'default': 'Fondo Armonía',
    'card': 'Fondo Tarjeta'
};

const getPreviewBgColor = (mode, shades, cardColor) => {
    if (!shades || shades.length < 20) return '#FFFFFF';
    switch (mode) {
        case 'T950': return shades[19];
        case 'T0': return shades[0];
        case 'white': return '#FFFFFF';
        case 'black': return '#000000';
        case 'card': return cardColor;
        default: return shades[19];
    }
}

const Explorer = ({
    explorerPalette,
    explorerGrayShades,
    onShadeCopy,
    onGrayShadeCopy,
    adjustments,
    onAdjust,
    brandColor,
    onColorSelect,
    themeData
}) => {
    const [isVariationsVisible, setIsVariationsVisible] = useState(false);
    const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
    const [isPaletteAdjusterVisible, setIsPaletteAdjusterVisible] = useState(false);
    const [colorModePreview, setColorModePreview] = useState('white');
    
    // Acceso seguro a los datos del tema, que ahora se reciben como prop.
    const cardColor = themeData.stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color;
    const colorModeBg = getPreviewBgColor(colorModePreview, themeData.grayShades, cardColor);

    const cyclePreviewMode = () => {
        const options = ['white', 'T950', 'black', 'T0', 'card'];
        const currentIndex = options.indexOf(colorModePreview);
        const nextIndex = (currentIndex + 1) % options.length;
        setColorModePreview(options[nextIndex]);
    };

    return (
        <>
            <section className="p-4 sm:p-6 rounded-xl border mb-8" style={{ backgroundColor: colorModeBg, borderColor: themeData.grayShades[2] }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg" style={{ color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>Modo Color</h2>
                        <p className="text-sm mt-1 truncate" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Toca un color para usarlo como Color de Marca.</p>
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2">
                        <span className="text-xs font-mono p-1 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: tinycolor(colorModeBg).isLight() ? '#000' : '#FFF' }}>{backgroundModeLabels[colorModePreview]}</span>
                        <button onClick={cyclePreviewMode} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <Layers size={14} /> Alternar Fondo
                        </button>
                        <button onClick={() => setIsPaletteAdjusterVisible(true)} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <Settings size={14} /> Ajustar
                        </button>
                        <button onClick={() => setIsVariationsVisible(true)} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <Palette size={14} /> Variaciones
                        </button>
                        <button onClick={() => setIsContrastCheckerVisible(true)} className="text-sm font-medium py-1 px-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)' }}>
                            <ShieldCheck size={14} /> Contraste
                        </button>
                    </div>
                </div>
                <ColorPalette isExplorer={true} shades={explorerPalette} onShadeCopy={onShadeCopy} themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'} />
                <div className="mt-6 pt-4 border-t" style={{ borderColor: tinycolor(colorModeBg).isLight() ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: tinycolor(colorModeBg).isLight() ? '#4B5563' : '#9CA3AF' }}>Escala de Grises Sugerida</p>
                    <ColorPalette
                        isExplorer={true}
                        shades={explorerGrayShades}
                        onShadeCopy={onGrayShadeCopy}
                        themeOverride={tinycolor(colorModeBg).isLight() ? 'light' : 'dark'}
                    />
                </div>
            </section>
            
            {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={onColorSelect} />}
            {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(text, msg) => alert(msg)} />}
            {isPaletteAdjusterVisible && <PaletteAdjusterModal adjustments={adjustments} onAdjust={onAdjust} onClose={() => setIsPaletteAdjusterVisible(false)} brandColor={brandColor} />}
        </>
    );
};

export default Explorer;

