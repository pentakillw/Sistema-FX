import { useState, useEffect, useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';
// --- MODIFICACIÓN --- Importamos la nueva función de generación inteligente
import { generateShades, generateExplorerPalette, applyColorMatrix, colorblindnessMatrices, generateAdvancedRandomPalette } from '../utils/colorUtils.js';

const defaultState = {
    theme: 'light',
    brandColor: '#009fdb',
    isGrayAuto: true,
    grayColor: '#5d5d5d',
    font: 'Segoe UI',
    fxSeparator: ';',
    useFxQuotes: true,
    explorerPalette: [],
};

const useThemeGenerator = () => {
    const [theme, setTheme] = useState(defaultState.theme);
    const [brandColor, setBrandColor] = useState(defaultState.brandColor);
    const [grayColor, setGrayColor] = useState(defaultState.grayColor);
    const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto);
    const [font, setFont] = useState(defaultState.font);

    const [history, setHistory] = useState([{
        brandColor: defaultState.brandColor,
        grayColor: defaultState.grayColor,
        explorerPalette: defaultState.explorerPalette
    }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [explorerMethod, setExplorerMethod] = useState('auto');
    const [explorerPalette, setExplorerPalette] = useState(defaultState.explorerPalette);
    const [originalExplorerPalette, setOriginalExplorerPalette] = useState([]);
    const [explorerGrayShades, setExplorerGrayShades] = useState([]);
    const [paletteAdjustments, setPaletteAdjustments] = useState({ hue: 0, saturation: 0, brightness: 0, temperature: 0 });

    const isUpdatingFromHistory = useRef(false);

    const [simulationMode, setSimulationMode] = useState('none');
    const [fxSeparator, setFxSeparator] = useState(defaultState.fxSeparator);
    const [useFxQuotes, setUseFxQuotes] = useState(defaultState.useFxQuotes);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    
    const [lightPreviewMode, setLightPreviewMode] = useState('white');
    const [darkPreviewMode, setDarkPreviewMode] = useState('black');
    const [semanticPreviewMode, setSemanticPreviewMode] = useState('card');

    const [themeData, setThemeData] = useState(null);

    const saveStateToHistory = (newState) => {
        if (isUpdatingFromHistory.current) {
            isUpdatingFromHistory.current = false;
            return;
        }
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const updateBrandColor = useCallback((newColor) => {
        if (!newColor || newColor === brandColor) return;
        setBrandColor(newColor);
        saveStateToHistory({ brandColor: newColor, grayColor, explorerPalette: originalExplorerPalette });
    }, [brandColor, grayColor, originalExplorerPalette]);

    const updatePaletteState = (newPalette) => {
        setOriginalExplorerPalette(newPalette);
        setExplorerPalette(newPalette); // Actualiza la paleta visible también
        saveStateToHistory({ brandColor, grayColor, explorerPalette: newPalette });
    };
    
    const applySimulationToPalette = () => {
        if (simulationMode === 'none') return;
        const matrix = colorblindnessMatrices[simulationMode];
        if (!matrix) return;

        const newPalette = originalExplorerPalette.map(color => applyColorMatrix(color, matrix));
        updatePaletteState(newPalette);
        showNotification(`Filtro ${simulationMode} aplicado a la paleta.`);
    };

    const reorderExplorerPalette = (sourceIndex, destinationIndex) => {
        const items = Array.from(originalExplorerPalette);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destinationIndex, 0, reorderedItem);
        updatePaletteState(items);
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
        updatePaletteState(newPalette);
    };

    const removeColorFromPalette = (index) => {
        if (originalExplorerPalette.length <= 2) {
            showNotification("La paleta debe tener al menos 2 colores.", "error");
            return;
        }
        const newPalette = originalExplorerPalette.filter((_, i) => i !== index);
        updatePaletteState(newPalette);
    };

    const replaceColorInPalette = (index, newColor) => {
        const newPalette = [...originalExplorerPalette];
        newPalette[index] = newColor;
        updatePaletteState(newPalette);
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            isUpdatingFromHistory.current = true;
            const newIndex = historyIndex - 1;
            const previousState = history[newIndex];
            setHistoryIndex(newIndex);
            setBrandColor(previousState.brandColor);
            setGrayColor(previousState.grayColor);
            updatePaletteState(previousState.explorerPalette);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isUpdatingFromHistory.current = true;
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];
            setHistoryIndex(newIndex);
            setBrandColor(nextState.brandColor);
            setGrayColor(nextState.grayColor);
            updatePaletteState(nextState.explorerPalette);
        }
    };
    
     const generatePaletteWithAI = async (prompt) => {
        const apiKey = "AIzaSyDJqPrWqlXvsSRRIUfuGcCLEabga987xss";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const currentPaletteSize = originalExplorerPalette.length || 5;
        const fullPrompt = `You are an expert color palette generator. Based on the theme "${prompt}", generate an array of exactly ${currentPaletteSize} aesthetically pleasing and harmonious hex color codes.`;
        const payload = {
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: { "type": "STRING" }
                }
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (jsonText) {
                const newPalette = JSON.parse(jsonText);
                if (Array.isArray(newPalette) && newPalette.every(c => tinycolor(c).isValid())) {
                    updatePaletteState(newPalette);
                    return true;
                }
            }
            throw new Error("Invalid palette format received from AI.");
        } catch (error) {
            console.error("Error generating palette with AI:", error);
            showNotification("Error al generar la paleta con IA.", "error");
            return false;
        }
    };
    
    useEffect(() => {
        if (originalExplorerPalette.length === 0 && brandColor) {
            const { palette } = generateExplorerPalette('auto', brandColor, 5);
            setOriginalExplorerPalette(palette);
            const initialState = { brandColor, grayColor, explorerPalette: palette };
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    }, [brandColor, grayColor]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    };

    const cyclePreviewMode = (mode, setMode, options) => {
        const currentIndex = options.indexOf(mode);
        const nextIndex = (currentIndex + 1) % options.length;
        setMode(options[nextIndex]);
    };
    
    useEffect(() => {
        if (explorerMethod !== 'auto-coolors') { // Evita bucle con el aleatorio
            const { palette } = generateExplorerPalette(explorerMethod, brandColor, originalExplorerPalette.length || 5);
            updatePaletteState(palette);
        }
    }, [explorerMethod]);


    const handleExplorerColorPick = (newColor) => {
        updateBrandColor(newColor);
    };
    
    useEffect(() => {
        if (!originalExplorerPalette || originalExplorerPalette.length === 0) return;
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
        const grayBase = adjusted.length > 0 ? adjusted[Math.floor(adjusted.length / 2)] : tinycolor.random().toHexString();
        setExplorerGrayShades(generateShades(tinycolor(grayBase).desaturate(85).toHexString()));
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
        const harmonyPalettes = {
            accentColor,
            accentShades,
            gray: tinycolor(accentColor).desaturate(85).toHexString(),
            grayShades: generateShades(tinycolor(accentColor).desaturate(85).toHexString()),
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
          explorerColors: explorerPalette.map((c, i) => ({ name: `Color ${i + 1}`, color: c })),
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

    }, [brandColor, grayColor, theme, explorerPalette]);


    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                const importedPalette = imported.explorerPalette || generateExplorerPalette('auto', imported.brandColor, 5).palette;
                
                setBrandColor(imported.brandColor);
                setGrayColor(imported.grayColor);
                setFont(imported.font);
                setTheme(imported.theme);
                setIsGrayAuto(imported.isGrayAuto);
                
                const newState = {
                    brandColor: imported.brandColor,
                    grayColor: imported.grayColor,
                    explorerPalette: importedPalette
                };
                updatePaletteState(importedPalette);
                saveStateToHistory(newState);
                
                showNotification('¡Tema importado!');
            } catch (_error) {
                showNotification('Error al leer el archivo.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        const { palette } = generateExplorerPalette('auto', defaultState.brandColor, 5);
        setTheme(defaultState.theme);
        setBrandColor(defaultState.brandColor);
        setIsGrayAuto(defaultState.isGrayAuto);
        setFont(defaultState.font);
        setGrayColor(defaultState.grayColor);
        const initialState = { brandColor: defaultState.brandColor, grayColor: defaultState.grayColor, explorerPalette: palette };
        updatePaletteState(palette);
        setHistory([initialState]);
        setHistoryIndex(0);
        showNotification("Tema reiniciado.");
    };

    const handleThemeToggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    
    // --- MODIFICACIÓN --- Ahora usa el nuevo generador avanzado
    const handleRandomTheme = () => {
        const count = originalExplorerPalette.length || 5;
        const { palette, brandColor: newBrandColor } = generateAdvancedRandomPalette(count);
        
        setBrandColor(newBrandColor); // Elige el color más vibrante como principal
        updatePaletteState(palette); // Actualiza la paleta del explorador
        setExplorerMethod('auto-coolors'); // Identificador para evitar re-cálculos
    };

    return {
        themeData, font, brandColor, grayColor, isGrayAuto, explorerMethod, simulationMode,
        explorerPalette, explorerGrayShades, paletteAdjustments, notification, fxSeparator, useFxQuotes,
        lightPreviewMode, darkPreviewMode, semanticPreviewMode, 
        setFont, updateBrandColor, setGrayColor, setIsGrayAuto, setExplorerMethod, setSimulationMode, 
        handleUndo, handleRedo, 
        handleImport, 
        handleReset, showNotification, setPaletteAdjustments, handleExplorerColorPick, 
        handleRandomTheme, handleThemeToggle, setFxSeparator, setUseFxQuotes,
        cyclePreviewMode, setLightPreviewMode, setDarkPreviewMode, setSemanticPreviewMode,
        reorderExplorerPalette,
        insertColorInPalette, removeColorFromPalette,
        replaceColorInPalette,
        originalExplorerPalette,
        history, historyIndex,
        generatePaletteWithAI,
        updatePaletteState,
        applySimulationToPalette,
    };
};

export default useThemeGenerator;
