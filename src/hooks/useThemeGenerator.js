import { useState, useEffect, useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { generateShades, generateExplorerPalette } from '../utils/colorUtils.js';

const defaultState = {
    theme: 'light',
    brandColor: '#009fdb',
    isGrayAuto: true,
    grayColor: '#5d5d5d',
    font: 'Segoe UI',
    fxSeparator: ';',
    useFxQuotes: true,
};

const useThemeGenerator = () => {
    const [theme, setTheme] = useState(defaultState.theme);
    const [brandColor, setBrandColor] = useState(defaultState.brandColor);
    const [grayColor, setGrayColor] = useState(defaultState.grayColor);
    const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto);
    const [font, setFont] = useState(defaultState.font);

    const [colorHistory, setColorHistory] = useState([defaultState.brandColor]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [explorerMethod, setExplorerMethod] = useState('auto');
    const [explorerPalette, setExplorerPalette] = useState([]);
    const [originalExplorerPalette, setOriginalExplorerPalette] = useState([]);
    const [explorerGrayShades, setExplorerGrayShades] = useState([]);
    const [paletteAdjustments, setPaletteAdjustments] = useState({ hue: 0, saturation: 0, brightness: 0, temperature: 0 });

    // --- CORRECCIÓN --- Se restaura el historial de la paleta
    const [paletteHistory, setPaletteHistory] = useState([]);
    const [paletteHistoryIndex, setPaletteHistoryIndex] = useState(-1);
    const isUpdatingFromHistory = useRef(false);

    const [simulationMode, setSimulationMode] = useState('none');
    const [fxSeparator, setFxSeparator] = useState(defaultState.fxSeparator);
    const [useFxQuotes, setUseFxQuotes] = useState(defaultState.useFxQuotes);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    
    const [lightPreviewMode, setLightPreviewMode] = useState('white');
    const [darkPreviewMode, setDarkPreviewMode] = useState('black');
    const [semanticPreviewMode, setSemanticPreviewMode] = useState('card');

    const [themeData, setThemeData] = useState(null);

    useEffect(() => {
        if (isUpdatingFromHistory.current || (paletteHistory[paletteHistoryIndex] && JSON.stringify(paletteHistory[paletteHistoryIndex]) === JSON.stringify(originalExplorerPalette))) {
            isUpdatingFromHistory.current = false;
            return;
        }
        const newHistory = paletteHistory.slice(0, paletteHistoryIndex + 1);
        newHistory.push(originalExplorerPalette);
        setPaletteHistory(newHistory);
        setPaletteHistoryIndex(newHistory.length - 1);
    }, [originalExplorerPalette]);
    
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    };

    const cyclePreviewMode = (mode, setMode, options) => {
        const currentIndex = options.indexOf(mode);
        const nextIndex = (currentIndex + 1) % options.length;
        setMode(options[nextIndex]);
    };
    
    const reorderExplorerPalette = (sourceIndex, destinationIndex) => {
        const items = Array.from(originalExplorerPalette);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destinationIndex, 0, reorderedItem);
        setOriginalExplorerPalette(items);
    };
    
    const insertColorInPalette = (index) => {
        if (originalExplorerPalette.length >= 20) {
            showNotification("Máximo de 20 colores alcanzado.", "error");
            return;
        }
        const colorA = tinycolor(originalExplorerPalette[index]);
        const colorB = originalExplorerPalette[index + 1] ? tinycolor(originalExplorerPalette[index + 1]) : colorA.clone().spin(30);
        const newColor = tinycolor.mix(colorA, colorB, 50).toHexString();
        const newPalette = [...originalExplorerPalette.slice(0, index + 1), newColor, ...originalExplorerPalette.slice(index + 1)];
        setOriginalExplorerPalette(newPalette);
    };

    const removeColorFromPalette = (index) => {
        if (originalExplorerPalette.length <= 2) {
            showNotification("La paleta debe tener al menos 2 colores.", "error");
            return;
        }
        const newPalette = originalExplorerPalette.filter((_, i) => i !== index);
        setOriginalExplorerPalette(newPalette);
    };

    const replaceColorInPalette = (index, newColor) => {
        const newPalette = [...originalExplorerPalette];
        newPalette[index] = newColor;
        setOriginalExplorerPalette(newPalette);
    };

    const memoizedGenerateExplorerPalette = useCallback((method, baseColorHex, count = 4) => {
        const { palette, gray } = generateExplorerPalette(method, baseColorHex, count);
        setOriginalExplorerPalette(palette);
        setExplorerGrayShades(gray);
        setPaletteAdjustments({ hue: 0, saturation: 0, brightness: 0, temperature: 0 });
        setPaletteHistory([palette]);
        setPaletteHistoryIndex(0);
    }, []);

    const updateBrandColor = useCallback((newColor) => {
        if (!newColor || newColor === brandColor) return;
        const newHistory = colorHistory.slice(0, historyIndex + 1);
        newHistory.push(newColor);
        setColorHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setBrandColor(newColor);
    }, [brandColor, colorHistory, historyIndex]);

    const isUpdateFromExplorer = useRef(false);

    const handleExplorerColorPick = (newColor) => {
        isUpdateFromExplorer.current = true;
        updateBrandColor(newColor);
    };
    
    const handlePaletteUndo = () => {
        if (paletteHistoryIndex > 0) {
            isUpdatingFromHistory.current = true;
            const newIndex = paletteHistoryIndex - 1;
            setPaletteHistoryIndex(newIndex);
            setOriginalExplorerPalette(paletteHistory[newIndex]);
        }
    };

    const handlePaletteRedo = () => {
        if (paletteHistoryIndex < paletteHistory.length - 1) {
            isUpdatingFromHistory.current = true;
            const newIndex = paletteHistoryIndex + 1;
            setPaletteHistoryIndex(newIndex);
            setOriginalExplorerPalette(paletteHistory[newIndex]);
        }
    };
    
    useEffect(() => {
        if (isUpdateFromExplorer.current) {
            isUpdateFromExplorer.current = false;
            return;
        }
        const currentPaletteSize = originalExplorerPalette.length || 4;
        memoizedGenerateExplorerPalette(explorerMethod, brandColor, currentPaletteSize);
    }, [explorerMethod, brandColor, memoizedGenerateExplorerPalette]);

    useEffect(() => {
        if (!originalExplorerPalette.length) return;
        const adjusted = originalExplorerPalette.map(hex => {
            let color = tinycolor(hex);
            const { hue, saturation, brightness, temperature } = paletteAdjustments;
            if (hue !== 0) color = color.spin(hue);
            if (saturation > 0) color = color.saturate(saturation);
            if (saturation < 0) color = color.desaturate(Math.abs(saturation));
            if (brightness > 0) color = color.lighten(brightness);
            if (brightness < 0) color = color.darken(Math.abs(brightness));
            if (temperature > 0) color = tinycolor.mix(color, '#ffc966', temperature);
            if (temperature < 0) color = tinycolor.mix(color, '#66b3ff', Math.abs(temperature));
            return color.toHexString();
        });
        setExplorerPalette(adjusted);
    }, [originalExplorerPalette, paletteAdjustments]);

    useEffect(() => {
        if (isGrayAuto) {
            const harmonicGray = tinycolor(brandColor).desaturate(85).toHexString();
            setGrayColor(harmonicGray);
        }
    }, [brandColor, isGrayAuto]);

    useEffect(() => {
        const brandShades = generateShades(brandColor);
        const grayShades = generateShades(grayColor);
        
        const accentColor = tinycolor(brandColor).complement().toHexString();
        const accentShades = generateShades(accentColor);
        const harmonicGray = tinycolor(accentColor).desaturate(85).toHexString();
        const harmonicGrayShades = generateShades(harmonicGray);
        const harmonyPalettes = {
            accentColor,
            accentShades,
            gray: harmonicGray,
            grayShades: harmonicGrayShades,
        };

        const infoBase = '#0ea5e9', successBase = '#22c55e', attentionBase = '#f97316', criticalBase = '#ef4444',
              purpleBase = '#a855f7', tealBase = '#14b8a6', pinkBase = '#ec4899';

        const info = tinycolor.mix(infoBase, grayColor, 15).saturate(10).toHexString(),
              success = tinycolor.mix(successBase, grayColor, 15).saturate(10).toHexString(),
              attention = tinycolor.mix(attentionBase, grayColor, 15).saturate(10).toHexString(),
              critical = tinycolor.mix(criticalBase, grayColor, 15).saturate(10).toHexString(),
              purple = tinycolor.mix(purpleBase, grayColor, 15).saturate(10).toHexString(),
              teal = tinycolor.mix(tealBase, grayColor, 15).saturate(10).toHexString(),
              pink = tinycolor.mix(pinkBase, grayColor, 15).saturate(10).toHexString();

        let stylePalette = {
          decorateColors: [
            { name: 'Azul1', color: info }, { name: 'Azul2', color: tinycolor(info).lighten(15).toHexString() },
            { name: 'Verde1', color: success }, { name: 'Verde2', color: tinycolor(success).lighten(15).toHexString() },
            { name: 'Neutro1', color: grayShades[5] }, { name: 'Neutro2', color: grayShades[4] },
            { name: 'Naranja1', color: attention }, { name: 'Naranja2', color: tinycolor(attention).lighten(15).toHexString() },
            { name: 'Violeta1', color: purple }, { name: 'Violeta2', color: tinycolor(purple).lighten(15).toHexString() },
            { name: 'Turquesa1', color: teal }, { name: 'Turquesa2', color: tinycolor(teal).lighten(15).toHexString() },
            { name: 'Rosa1', color: pink }, { name: 'Rosa2', color: tinycolor(pink).lighten(15).toHexString() },
          ],
          fullActionColors: [
            { name: 'Primario', color: brandShades[4] }, { name: 'PrimarioFlotante', color: brandShades[5] },
            { name: 'PrimarioPresionado', color: brandShades[6] }, { name: 'Secundario', color: grayShades[4] },
            { name: 'SecundarioPresionado', color: grayShades[5] }, { name: 'Critico', color: critical },
            { name: 'CriticoFlotante', color: tinycolor(critical).lighten(10).toHexString() }, { name: 'CriticoPresionado', color: tinycolor(critical).darken(10).toHexString() },
          ],
        };

        if (theme === 'dark') {
          stylePalette.fullBackgroundColors = [
            { name: 'Predeterminado', color: grayShades[0] }, { name: 'Apagado', color: grayShades[1] },
            { name: 'Debil', color: grayShades[2] }, { name: 'Fuerte', color: grayShades[9] },
            { name: 'Inverso', color: grayShades[19] }, { name: 'MarcaDebil', color: brandShades[1] },
            { name: 'InfoDebil', color: tinycolor(info).darken(25).toHexString() },
            { name: 'ExitoDebil', color: tinycolor(success).darken(25).toHexString() },
            { name: 'AtencionDebil', color: tinycolor(attention).darken(25).toHexString() },
            { name: 'CriticoDebil', color: tinycolor(critical).darken(25).toHexString() }, 
          ];
          stylePalette.fullForegroundColors = [
            { name: 'Predeterminado', color: grayShades[19] }, { name: 'Apagado', color: grayShades[6] },
            { name: 'Debil', color: grayShades[4] }, { name: 'Fuerte', color: grayShades[19] },
            { name: 'Inverso', color: grayShades[0] }, { name: 'Info', color: info },
            { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
            { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
          ];
          stylePalette.fullBorderColors = [
            { name: 'Predeterminado', color: grayShades[2] }, { name: 'Fuerte', color: grayShades[4] },
            { name: 'Inverso', color: grayShades[0] }, { name: 'InfoFuerte', color: info },
            { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
            { name: 'ExitoFuerte', color: success },
          ];
        } else {
           stylePalette.fullBackgroundColors = [
            { name: 'Predeterminado', color: grayShades[19] }, { name: 'Apagado', color: grayShades[18] },
            { name: 'Debil', color: grayShades[17] }, { name: 'Fuerte', color: grayShades[0] },
            { name: 'Inverso', color: grayShades[0] }, { name: 'MarcaDebil', color: brandShades[18] },
            { name: 'InfoDebil', color: tinycolor(info).lighten(25).toHexString() },
            { name: 'ExitoDebil', color: tinycolor(success).lighten(25).toHexString() },
            { name: 'AtencionDebil', color: tinycolor(attention).lighten(25).toHexString() },
            { name: 'CriticoDebil', color: tinycolor(critical).lighten(25).toHexString() },
          ];
           stylePalette.fullForegroundColors = [
            { name: 'Predeterminado', color: grayShades[0] }, { name: 'Apagado', color: grayShades[3] },
            { name: 'Debil', color: grayShades[5] }, { name: 'Fuerte', color: grayShades[0] },
            { name: 'Inverso', color: grayShades[19] }, { name: 'Info', color: info },
            { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
            { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
          ];
           stylePalette.fullBorderColors = [
            { name: 'Predeterminado', color: grayShades[17] }, { name: 'Fuerte', color: grayShades[5] },
            { name: 'Inverso', color: grayShades[19] }, { name: 'InfoFuerte', color: info },
            { name: 'CriticoFuerte', color: critical }, { name: 'AtencionFuerte', color: attention },
            { name: 'ExitoFuerte', color: success },
          ];
        }

        const controlsThemeStyle = {
            backgroundColor: theme === 'light' ? '#F9FAFB' : stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color,
            borderColor: theme === 'light' ? '#E5E7EB' : stylePalette.fullBorderColors.find(c => c.name === 'Predeterminado').color,
            color: theme === 'light' ? '#4B5563' : '#D1D5DB'
        };

        const btnContrast = tinycolor.readability(accentColor, stylePalette.fullBackgroundColors[0].color);
        const brandContrast = tinycolor.readability(brandColor, stylePalette.fullBackgroundColors[0].color);

        const data = {
            theme, brandColor, grayColor, brandShades, grayShades,
            stylePalette,
            harmonyPalettes,
            controlsThemeStyle,
            primaryButtonTextColor: tinycolor.mostReadable(brandShades[4], ["#FFF", "#000"]).toHexString(),
            accessibility: {
                btn: { ratio: btnContrast.toFixed(2), level: btnContrast >= 4.5 ? 'AA' : 'Fail' },
                text: { ratio: brandContrast.toFixed(2), level: brandContrast >= 4.5 ? 'AA' : 'Fail' }
            },
            accessibilityColors: { btnBg: stylePalette.fullBackgroundColors[0].color, btnText: accentColor, textBg: stylePalette.fullBackgroundColors[0].color, textColor: brandColor }
        };

        setThemeData(data);
        
        document.documentElement.style.setProperty('--bg-card', data.stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color);
        document.documentElement.style.setProperty('--text-default', data.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color);
        document.documentElement.style.setProperty('--border-default', data.stylePalette.fullBorderColors.find(c => c.name === 'Predeterminado').color);
        document.documentElement.style.setProperty('--bg-muted', theme === 'light' ? grayShades[17] : grayShades[2]);
        document.documentElement.style.setProperty('--action-primary-default', brandShades[4]);

    }, [brandColor, grayColor, theme]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setBrandColor(colorHistory[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < colorHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setBrandColor(colorHistory[newIndex]);
        }
    };
    
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.explorerPalette) {
                    setOriginalExplorerPalette(imported.explorerPalette);
                    setPaletteHistory([imported.explorerPalette]);
                    setPaletteHistoryIndex(0);
                }
                updateBrandColor(imported.brandColor);
                setGrayColor(imported.grayColor);
                setFont(imported.font);
                setTheme(imported.theme);
                setIsGrayAuto(imported.isGrayAuto);
                showNotification('¡Tema importado!');
            } catch (_error) {
                showNotification('Error al leer el archivo.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        setTheme(defaultState.theme);
        updateBrandColor(defaultState.brandColor);
        setIsGrayAuto(defaultState.isGrayAuto);
        setFont(defaultState.font);
        setGrayColor(defaultState.grayColor);
        memoizedGenerateExplorerPalette('auto', defaultState.brandColor, 4);
        showNotification("Tema reiniciado.");
    };

    const handleThemeToggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    
    const handleRandomTheme = () => {
        const newColor = tinycolor.random().toHexString();
        updateBrandColor(newColor);
    };

    return {
        themeData, font, brandColor, grayColor, isGrayAuto, explorerMethod, simulationMode, historyIndex, colorHistory,
        explorerPalette, explorerGrayShades, paletteAdjustments, notification, fxSeparator, useFxQuotes,
        lightPreviewMode, darkPreviewMode, semanticPreviewMode, 
        setFont, updateBrandColor, setGrayColor, setIsGrayAuto, setExplorerMethod, setSimulationMode, handleUndo, handleRedo, 
        handleImport, 
        handleReset, showNotification, setPaletteAdjustments, handleExplorerColorPick, 
        handleRandomTheme, handleThemeToggle, setFxSeparator, setUseFxQuotes,
        cyclePreviewMode, setLightPreviewMode, setDarkPreviewMode, setSemanticPreviewMode,
        reorderExplorerPalette,
        insertColorInPalette, removeColorFromPalette,
        replaceColorInPalette,
        originalExplorerPalette,
        handlePaletteUndo, handlePaletteRedo,
        paletteHistory, paletteHistoryIndex
    };
};

export default useThemeGenerator;

