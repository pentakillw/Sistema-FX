import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { 
    generateShades, 
    generateAdvancedRandomPalette, // ¡Usaremos la nueva función!
    applyColorMatrix, 
    colorblindnessMatrices, 
    getHarmonicGrayColor,
    applyAdjustments,
    findClosestColorName,
} from '../utils/colorUtils.js';
// ¡Importar el analizador de paletas!
import { analyzePaletteColors } from '../utils/colorAnalysis.js';

import { supabase } from '../supabaseClient.js'; 

const baseBrandColor = '#009fdb';
const safeGrayColor = getHarmonicGrayColor(baseBrandColor) || '#808080'; 

const defaultState = {
    theme: 'light',
    brandColor: baseBrandColor,
    isGrayAuto: true, 
    grayColor: safeGrayColor,
    font: 'Segoe UI',
    fxSeparator: ';',
    useFxQuotes: true,
    explorerPalette: [],
    lockedColors: [], 
};

const defaultPaletteAdjustments = { hue: 0, saturation: 0, brightness: 0, temperature: 0 };

const useThemeGenerator = (user) => {
    // --- (Todo el estado del hook se mantiene igual) ---
    const [theme, setTheme] = useState(defaultState.theme);
    const [brandColor, setBrandColor] = useState(defaultState.brandColor);
    const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto); 
    const [grayColor, setGrayColor] = useState(defaultState.grayColor);
    const [font, setFont] = useState(defaultState.font);
    const [lockedColors, setLockedColors] = useState(defaultState.lockedColors);

    const [history, setHistory] = useState([{
        brandColor: defaultState.brandColor,
        grayColor: defaultState.grayColor, 
        explorerPalette: defaultState.explorerPalette,
        lockedColors: defaultState.lockedColors, 
        isGrayAuto: defaultState.isGrayAuto,
    }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [explorerMethod, setExplorerMethod] = useState('auto');
    const [explorerPalette, setExplorerPalette] = useState(defaultState.explorerPalette); 
    const [originalExplorerPalette, setOriginalExplorerPalette] = useState([]); 
    
    const [explorerGrayShades, setExplorerGrayShades] = useState([]);
    
    const [paletteAdjustments, setPaletteAdjustments] = useState(defaultPaletteAdjustments);

    const isUpdatingFromHistory = useRef(false);

    const [simulationMode, setSimulationMode] = useState('none');
    const [fxSeparator, setFxSeparator] = useState(defaultState.fxSeparator);
    const [useFxQuotes, setUseFxQuotes] = useState(defaultState.useFxQuotes);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    
    const [lightPreviewMode, setLightPreviewMode] = useState('white');
    const [darkPreviewMode, setDarkPreviewMode] = useState('black');
    const [semanticPreviewMode, setSemanticPreviewMode] = useState('card');

    const [themeData, setThemeData] = useState(null);

    const [savedPalettes, setSavedPalettes] = useState([]); 
    const [currentPaletteId, setCurrentPaletteId] = useState(null); 
    const [isLoadingPalettes, setIsLoadingPalettes] = useState(false);
    const [isSavingPalette, setIsSavingPalette] = useState(false);
    const [deletingPaletteId, setDeletingPaletteId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [collections, setCollections] = useState([]);
    const [tags, setTags] = useState([]);
    
    const [filters, setFilters] = useState({
        search: '',
        projectId: null,
        collectionId: null,
        style: null,
        color: null,
    });
    // --- (Fin del estado) ---


    // --- (Todas las funciones desde saveStateToHistory hasta goToHistoryState se mantienen igual) ---
    const saveStateToHistory = (newState) => {
        if (isUpdatingFromHistory.current) {
            return;
        }
        const stateToSave = {
            ...newState,
            isGrayAuto: newState.isGrayAuto !== undefined ? newState.isGrayAuto : isGrayAuto,
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(stateToSave);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };
    
    const toggleLockColor = (colorToToggle) => {
        let newLockedColors;
        if (lockedColors.includes(colorToToggle)) {
            newLockedColors = lockedColors.filter(c => c !== colorToToggle);
        } else {
            newLockedColors = [...lockedColors, colorToToggle];
        }
        setLockedColors(newLockedColors);

        const currentState = history[historyIndex];
        if (currentState) {
            const newState = { ...currentState, lockedColors: newLockedColors };
            const newHistory = [...history];
            newHistory[historyIndex] = newState;
            setHistory(newHistory);
        }
    };

    const loadPaletteState = (paletteState) => {
        setBrandColor(paletteState.brandColor);
        setGrayColor(paletteState.grayColor);
        const loadedExplorerPalette = Array.isArray(paletteState.explorerPalette) ? paletteState.explorerPalette : [];
        setOriginalExplorerPalette(loadedExplorerPalette);
        setLockedColors(paletteState.lockedColors || []);
        setIsGrayAuto(paletteState.isGrayAuto);
        setCurrentPaletteId(paletteState.id || null);
        setPaletteAdjustments(defaultPaletteAdjustments);
    };
    
    const updateBrandColorInternal = useCallback((newColor) => {
        if (!newColor || newColor === brandColor) return;
        setBrandColor(newColor);
        let newGrayColor = grayColor;
        if (isGrayAuto) { 
            newGrayColor = getHarmonicGrayColor(newColor) || defaultState.grayColor;
            setGrayColor(newGrayColor);
        }
        setCurrentPaletteId(null); 
        return { 
            brandColor: newColor, 
            grayColor: newGrayColor, 
            explorerPalette: originalExplorerPalette,
            lockedColors: lockedColors,
            isGrayAuto: isGrayAuto,
        };
    }, [brandColor, originalExplorerPalette, lockedColors, isGrayAuto, grayColor]); 

    const updateBrandColor = (newColor) => {
        const newState = updateBrandColorInternal(newColor);
        if (newState) {
            saveStateToHistory(newState);
        }
    };
    
    const updatePaletteStateInternal = (newPalette, newBrandColor = brandColor) => {
        setOriginalExplorerPalette(newPalette);
        let newGrayColor = grayColor;
        let brandColorInternal = newBrandColor;
        if(newBrandColor !== brandColor) {
            setBrandColor(newBrandColor);
            brandColorInternal = newBrandColor;
        }
        if (isGrayAuto) { 
            newGrayColor = getHarmonicGrayColor(brandColorInternal) || defaultState.grayColor;
            setGrayColor(newGrayColor);
        }
        setCurrentPaletteId(null); 
        return { 
            brandColor: brandColorInternal, 
            grayColor: newGrayColor, 
            explorerPalette: newPalette, 
            lockedColors: lockedColors,
            isGrayAuto: isGrayAuto,
        };
    };

    const updatePaletteState = (newPalette, newBrandColor = brandColor) => {
        const newState = updatePaletteStateInternal(newPalette, newBrandColor);
        if(newState) {
            saveStateToHistory(newState);
        }
    };

    const applySimulationToPalette = () => {
        if (simulationMode === 'none') return;
        const matrix = colorblindnessMatrices[simulationMode];
        if (!matrix) return;
        const newPalette = originalExplorerPalette.map(color => {
            if (lockedColors.includes(color)) return color;
            return applyColorMatrix(color, matrix);
        });
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
        const newPalette = [...originalExplorerPalette.slice(0, index + 1), 
newColor, ...originalExplorerPalette.slice(index + 1)];
        updatePaletteState(newPalette);
    };

    const removeColorFromPalette = (index) => {
        if (originalExplorerPalette.length <= 2) {
            showNotification("La paleta debe tener al menos 2 colores.", "error");
            return;
        }
        const colorToRemove = originalExplorerPalette[index];
        const newPalette = originalExplorerPalette.filter((_, i) => i !== index);
        if (lockedColors.includes(colorToRemove)) {
            setLockedColors(lockedColors.filter(c => c !== colorToRemove));
        }
        updatePaletteState(newPalette);
    };

    const replaceColorInPalette = (index, newColor) => {
        const oldColor = originalExplorerPalette[index];
        const newPalette = [...originalExplorerPalette];
        newPalette[index] = newColor;
        if (lockedColors.includes(oldColor)) {
            setLockedColors(lockedColors.map(c => (c === oldColor ? newColor : c)));
        }
        updatePaletteState(newPalette);
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            isUpdatingFromHistory.current = true;
            const newIndex = historyIndex - 1;
            const previousState = history[newIndex];
            setHistoryIndex(newIndex);
            loadPaletteState(previousState);
            isUpdatingFromHistory.current = false;
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isUpdatingFromHistory.current = true;
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];
            setHistoryIndex(newIndex);
            loadPaletteState(nextState);
            isUpdatingFromHistory.current = false;
        }
    };

    const goToHistoryState = (index) => {
        if (index >= 0 && index < history.length) {
            isUpdatingFromHistory.current = true;
            const targetState = history[index];
            setHistoryIndex(index);
            loadPaletteState(targetState);
            showNotification(`Paleta ${index} cargada.`);
            isUpdatingFromHistory.current = false;
        }
    };
    
     const generatePaletteWithAI = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
        if (!apiKey) {
            console.error("API Key no encontrada. Asegúrate de crear un archivo .env con VITE_GEMINI_API_KEY");
            showNotification("Error: API Key no configurada.", "error");
            return false;
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`;
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
            if (!response.ok) {
                console.error("Respuesta de la API no fue OK:", response);
                throw new Error(`API request failed with status ${response.status}`);
            }
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                const newPaletteFromAI = JSON.parse(jsonText);
                if (Array.isArray(newPaletteFromAI) && newPaletteFromAI.every(c => tinycolor(c).isValid())) {
                    const finalPalette = originalExplorerPalette.map((oldColor, index) => {
                        if (lockedColors.includes(oldColor)) return oldColor;
                        return newPaletteFromAI[index] || tinycolor.random().toHexString();
                    });
                    const newBrandColor = finalPalette.filter(c => !lockedColors.includes(c))[0] || finalPalette[0];
                    updatePaletteState(finalPalette, newBrandColor);
                    return true;
                }
            }
            console.error("Respuesta de la API inesperada:", result);
            throw new Error("Invalid palette format received from AI.");
        } catch (error) {
            console.error("Error generating palette with AI:", error);
            showNotification("Error al generar la paleta con IA.", "error");
            return false;
        }
    };
    
    useEffect(() => {
        if (originalExplorerPalette.length === 0 && brandColor) {
            // --- MODIFICACIÓN ---
            // Usar la nueva lógica 'auto' para la paleta inicial.
            const { palette } = generateAdvancedRandomPalette(5, 'auto', null, [], []);
            // --- FIN MODIFICACIÓN ---
            
            setOriginalExplorerPalette(palette);
            const initialGray = getHarmonicGrayColor(brandColor) || defaultState.grayColor;
            setGrayColor(initialGray); 
            setIsGrayAuto(true); 
            const initialState = { 
                brandColor, 
                grayColor: initialGray, 
                explorerPalette: palette, 
                lockedColors: [], 
                isGrayAuto: true 
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 


    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    }, []); 


    const cyclePreviewMode = (mode, setMode, options) => {
        const currentIndex = options.indexOf(mode);
        const nextIndex = (currentIndex + 1) % options.length;
        setMode(options[nextIndex]);
    };

    const handleExplorerColorPick = (newColor) => {
        updateBrandColor(newColor);
    };
    
    useEffect(() => {
        if (!originalExplorerPalette || originalExplorerPalette.length === 0) return;
        const adjusted = originalExplorerPalette.map(hex => {
            if (lockedColors.includes(hex)) {
                return hex;
            }
            return applyAdjustments(hex, paletteAdjustments);
        });
        setExplorerPalette(adjusted);
        setExplorerGrayShades(generateShades(grayColor));
    }, [originalExplorerPalette, paletteAdjustments, lockedColors, grayColor]); 


    useEffect(() => {
        if (isUpdatingFromHistory.current) {
            isUpdatingFromHistory.current = false;
        }
    }, [brandColor, grayColor, originalExplorerPalette, lockedColors]);

    
    useEffect(() => {
        if (!brandColor || !grayColor) return; 
        const brandShades = generateShades(brandColor);
        const grayShades = generateShades(grayColor);
        if (!brandShades || !grayShades || brandShades.length < 20 || grayShades.length < 20) {
            console.error("Fallo al generar las sombras de color", { brandColor, grayColor, brandShades, grayShades });
            return;
        }
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
          explorerColors: originalExplorerPalette.map((c, i) => ({ name: `Color ${i + 1}`, color: c })),
          lockedExplorerColors: lockedColors,
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
        } else { // light theme
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
            accessibilityColors: { btnBg: stylePalette.fullBackgroundColors[0].color, btnText: accentColor, textBg: stylePalette.fullBackgroundColors[0].color, textColor: brandColor },
            explorerPalette: originalExplorerPalette,
            lockedColors: lockedColors,
        };
        setThemeData(data);
        document.documentElement.style.setProperty('--bg-card', data.stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color);
        document.documentElement.style.setProperty('--text-default', data.stylePalette.fullForegroundColors.find(c => c.name === 'Predeterminado').color);
        document.documentElement.style.setProperty('--border-default', data.stylePalette.fullBorderColors.find(c => c.name === 'Predeterminado').color);
        document.documentElement.style.setProperty('--bg-muted', theme === 'light' ? grayShades[17] : grayShades[2]);
        document.documentElement.style.setProperty('--action-primary-default', brandShades[4]);
    }, [brandColor, grayColor, theme, originalExplorerPalette, lockedColors]); 


    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                // --- MODIFICACIÓN ---
                // Usar la nueva lógica 'auto' para la paleta inicial si no se importa una.
                const importedPalette = imported.explorerPalette || generateAdvancedRandomPalette(5, 'auto', null, [], []).palette;
                // --- FIN MODIFICACIÓN ---
                const importedLockedColors = imported.lockedColors || [];
                const auto = (imported.isGrayAuto === true || imported.isGrayAuto === undefined);
                const newGrayColor = auto 
                    ? getHarmonicGrayColor(imported.brandColor) || defaultState.grayColor
                    : imported.grayColor;
                const stateToLoad = {
                    brandColor: imported.brandColor,
                    grayColor: newGrayColor,
                    explorerPalette: importedPalette,
                    lockedColors: importedLockedColors,
                    isGrayAuto: auto,
                    id: null
                };
                loadPaletteState(stateToLoad);
                saveStateToHistory(stateToLoad);
                setFont(imported.font);
                setTheme(imported.theme);
                showNotification('¡Tema importado!');
            } catch (_error) {
                showNotification('Error al leer el archivo.', 'error');
            }
        };
        reader.readText(file);
    };

    const handleReset = () => {
        // --- MODIFICACIÓN ---
        // Usar la nueva lógica 'auto' para la paleta de reseteo.
        const { palette } = generateAdvancedRandomPalette(5, 'auto', null, [], []);
        // --- FIN MODIFICACIÓN ---
        setTheme(defaultState.theme);
        setFont(defaultState.font);
        const newGrayColor = getHarmonicGrayColor(defaultState.brandColor) || defaultState.grayColor;
        const initialState = { 
            brandColor: defaultState.brandColor, 
            grayColor: newGrayColor, 
            explorerPalette: palette, // Paleta nueva
            lockedColors: [],
            isGrayAuto: defaultState.isGrayAuto,
            id: null
        };
        loadPaletteState(initialState);
        setHistory([initialState]);
        setHistoryIndex(0);
        showNotification("Tema reiniciado.");
    };

    const handleThemeToggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    
    // --- ¡FUNCIÓN MODIFICADA! ---
    const handleRandomTheme = (baseColorHex = null) => {
        
        // Si el método es 'auto' (el nuevo), dejamos que la función de generación
        // maneje todo, incluidos los colores bloqueados y el color de marca.
        if (explorerMethod === 'auto') {
            const { palette: newPalette, brandColor: newBrandColor } =
                generateAdvancedRandomPalette(
                    originalExplorerPalette.length || 5,
                    'auto', // Forzar 'auto'
                    baseColorHex,
                    lockedColors, // Pasar los colores bloqueados
                    originalExplorerPalette // Pasar la paleta antigua para mantener el orden de los bloqueados
                );
            
            // La nueva función 'generateAdvancedRandomPalette' ya respetó
            // los colores bloqueados.
            updatePaletteState(newPalette, newBrandColor);
            
        } else {
            // --- LÓGICA ANTIGUA (para 'mono', 'triad', etc.) ---
            // Esta lógica SÍ necesita mezclar la paleta nueva con los colores bloqueados.
            const { palette: newRandomPalette, brandColor: newBrandColorSuggestion } = 
                generateAdvancedRandomPalette(
                    originalExplorerPalette.length || 5, 
                    explorerMethod,
                    baseColorHex
                ); 
            
            let randomColorsUsed = 0;
            let baseColorPlaced = false;
            
            const finalPalette = originalExplorerPalette.map((oldColor) => {
                if (lockedColors.includes(oldColor)) {
                    return oldColor;
                }
                // Si se generó desde un color base, se reemplaza el primer color no bloqueado
                if (baseColorHex && !baseColorPlaced) {
                    baseColorPlaced = true;
                    return baseColorHex;
                }
                // Ciclamos a través de los colores generados
                const newColor = newRandomPalette[randomColorsUsed % newRandomPalette.length];
                randomColorsUsed++;
                return newColor;
            });
            
            let newBrandColor;
            if (baseColorHex) {
                newBrandColor = baseColorHex;
            } else {
                // Elige el primer color no bloqueado como el nuevo color de marca
                const unLockedColors = finalPalette.filter(c => !lockedColors.includes(c));
                newBrandColor = unLockedColors.length > 0 ? unLockedColors[0] : (lockedColors.length > 0 ? lockedColors[0] : newBrandColorSuggestion);
            }
            updatePaletteState(finalPalette, newBrandColor);
        }
    };
    // --- FIN DE FUNCIÓN MODIFICADA ---

    const commitPaletteAdjustments = () => {
        const newLockedColors = lockedColors.map(oldLockedColor => {
            const index = originalExplorerPalette.indexOf(oldLockedColor);
            if (index !== -1 && explorerPalette[index]) {
                return explorerPalette[index];
            }
            return null;
            }).filter(Boolean);
        updatePaletteState(explorerPalette, brandColor);
        setLockedColors(newLockedColors);
        setPaletteAdjustments(defaultPaletteAdjustments);
        showNotification('Ajustes de paleta aplicados.');
    };

    const cancelPaletteAdjustments = () => {
        setPaletteAdjustments(defaultPaletteAdjustments);
    };
    
    
    // --- (Todas las funciones de Supabase desde useEffect(() => { fetchUserData... }) hasta el final
    // ---  se mantienen exactamente igual que en tu archivo original) ---
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setSavedPalettes([]);
                setProjects([]);
                setCollections([]);
                setTags([]);
                return;
            }
            setIsLoadingPalettes(true);
            try {
                const [paletteRes, projectRes, collectionRes, tagsRes] = await Promise.all([
                    supabase
                        .from('user_palettes')
                        .select('id, name, colors, brand_color, gray_color, is_gray_auto, locked_colors, project_id, collection_id, description, style_tags, main_colors')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('projects')
                        .select('id, name')
                        .eq('user_id', user.id)
                        .order('name', { ascending: true }),
                    supabase
                        .from('collections')
                        .select('id, name')
                        .eq('user_id', user.id)
                        .order('name', { ascending: true }),
                    supabase
                        .from('tags')
                        .select('id, name')
                ]);
                if (paletteRes.error) throw paletteRes.error;
                if (projectRes.error) throw projectRes.error;
                if (collectionRes.error) throw collectionRes.error;
                if (tagsRes.error) throw tagsRes.error;
                
                const palettes = paletteRes.data.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    explorerPalette: p.colors, 
                    brandColor: p.brand_color,
                    grayColor: p.gray_color,
                    isGrayAuto: p.is_gray_auto,
                    lockedColors: p.locked_colors,
                    projectId: p.project_id,
                    collectionId: p.collection_id,
                    styleTags: p.style_tags,
                    mainColors: p.main_colors
                }));
                setSavedPalettes(palettes);
                setProjects(projectRes.data);
                setCollections(collectionRes.data);
                setTags(tagsRes.data);
            } catch (error) {
                showNotification(`Error al cargar datos: ${error.message}`, 'error');
            } finally {
                setIsLoadingPalettes(false);
            }
        };
        fetchUserData();
    }, [user, showNotification]);

    const handleCreateTag = async (tagName) => {
        if (!user) return null;
        try {
            let { data: existingTag, error: findError } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .single();
            if (findError && findError.code !== 'PGRST116') {
                throw findError;
            }
            if (existingTag) {
                return existingTag.id;
            }
            let { data: newTag, error: insertError } = await supabase
                .from('tags')
                .insert({ name: tagName })
                .select('id')
                .single();
            if (insertError) throw insertError;
            setTags([...tags, { id: newTag.id, name: tagName }]);
            return newTag.id;
        } catch (error) {
            console.error('Error creando tag:', error);
            showNotification(`Error al crear tag: ${error.message}`, 'error');
            return null;
        }
    };
    
    const syncPaletteTags = async (paletteId, tagNames) => {
        if (!user || !tagNames || tagNames.length === 0) return; 
        try {
            const tagIds = await Promise.all(
                tagNames.map(name => handleCreateTag(name))
            );
            const validTagIds = tagIds.filter(id => id !== null);
            const { error: deleteError } = await supabase
                .from('palette_tags')
                .delete()
                .eq('palette_id', paletteId);
            if (deleteError) throw deleteError;
            if (validTagIds.length > 0) {
                const associations = validTagIds.map(tagId => ({
                    palette_id: paletteId,
                    tag_id: tagId
                }));
                const { error: insertError } = await supabase
                    .from('palette_tags')
                    .insert(associations);
                if (insertError) throw insertError;
            }
        } catch (error) {
             console.error('Error al sincronizar tags:', error);
             showNotification(`Error al guardar tags: ${error.message}`, 'error');
        }
    };

    const handleSavePalette = async (saveData) => {
        if (!user) {
            showNotification('Necesitas iniciar sesión para guardar paletas', 'error');
            return false;
        }
        setIsSavingPalette(true);
        try {
            // ¡Analizar paleta ANTES de guardar!
            const { main_colors, style_tags } = analyzePaletteColors(originalExplorerPalette);
            
            const paletteData = {
                name: saveData.name,
                description: saveData.description,
                project_id: saveData.projectId,
                collection_id: saveData.collectionId,
                colors: originalExplorerPalette, 
                brand_color: brandColor,
                gray_color: grayColor,
                is_gray_auto: isGrayAuto,
                locked_colors: lockedColors,
                main_colors: main_colors, // Dato analizado
                style_tags: style_tags   // Dato analizado
            };

            let savedPalette; 
            if (currentPaletteId) {
                // ACTUALIZAR
                const { data, error } = await supabase
                    .from('user_palettes')
                    .update(paletteData)
                    .eq('id', currentPaletteId)
                    .eq('user_id', user.id)
                    .select()
                    .single();
                if (error) throw error;
                savedPalette = data;
                
                if (saveData.tags) {
                    await syncPaletteTags(savedPalette.id, saveData.tags);
                }
                
                const updatedPalette = {
                    ...savedPalettes.find(p => p.id === currentPaletteId),
                    name: savedPalette.name,
                    description: savedPalette.description,
                    explorerPalette: savedPalette.colors,
                    brandColor: savedPalette.brand_color,
                    grayColor: savedPalette.gray_color,
                    isGrayAuto: savedPalette.is_gray_auto,
                    lockedColors: savedPalette.locked_colors,
                    projectId: savedPalette.project_id,
                    collectionId: savedPalette.collection_id,
                    styleTags: savedPalette.style_tags,
                    mainColors: savedPalette.main_colors
                };
                setSavedPalettes(savedPalettes.map(p => p.id === currentPaletteId ? updatedPalette : p));
                showNotification('¡Paleta actualizada!');

            } else {
                // CREAR
                const { data, error } = await supabase
                    .from('user_palettes')
                    .insert(paletteData) 
                    .select()
                    .single();
                if (error) throw error;
                savedPalette = data;
                
                if (saveData.tags) {
                    await syncPaletteTags(savedPalette.id, saveData.tags);
                }
                const newPalette = {
                    id: savedPalette.id,
                    name: savedPalette.name,
                    description: savedPalette.description,
                    explorerPalette: savedPalette.colors,
                    brandColor: savedPalette.brand_color,
                    grayColor: savedPalette.gray_color,
                    isGrayAuto: savedPalette.is_gray_auto,
                    lockedColors: savedPalette.locked_colors,
                    projectId: savedPalette.project_id,
                    collectionId: savedPalette.collection_id,
                    styleTags: savedPalette.style_tags,
                    mainColors: savedPalette.main_colors
                };
                setSavedPalettes([newPalette, ...savedPalettes]);
                setCurrentPaletteId(savedPalette.id);
                showNotification('¡Paleta guardada!');
            }
            return true;
        } catch (error) {
            console.error('Error al guardar paleta:', error);
            showNotification(`Error al guardar: ${error.message}`, 'error');
            return false;
        } finally {
            setIsSavingPalette(false);
        }
    };
    
    const handleLoadPalette = (palette) => {
        loadPaletteState(palette);
        saveStateToHistory(palette);
        showNotification(`Paleta "${palette.name}" cargada.`);
    };

    const handleLoadSpecificPalette = (palette) => {
        const brandShades = generateShades(palette.brandColor);
        const grayShades = generateShades(palette.grayColor);
        return {
            theme: theme,
            brandColor: palette.brandColor,
            grayColor: palette.grayColor,
            brandShades,
            grayShades,
            stylePalette: themeData.stylePalette,
            explorerPalette: palette.explorerPalette, 
            lockedColors: palette.lockedColors
        };
    };
    
    const handleDeletePalette = async (paletteId) => {
        if (!user || !paletteId) return;
        setDeletingPaletteId(paletteId);
        try {
            const { error } = await supabase
                .from('user_palettes')
                .delete()
                .eq('id', paletteId);
            if (error) throw error;
            setSavedPalettes(savedPalettes.filter(p => p.id !== paletteId));
            if (currentPaletteId === paletteId) {
                setCurrentPaletteId(null);
            }
            showNotification('Paleta eliminada.');
        } catch (error) {
            console.error('Error al borrar paleta:', error);
            showNotification(`Error al borrar: ${error.message}`, 'error');
        } finally {
            setDeletingPaletteId(null);
        }
    };
    
    const handleSharePalette = async () => {
        if (!user) {
            showNotification('Inicia sesión para compartir paletas', 'error');
            return;
        }
        if (!currentPaletteId) {
            showNotification('Debes guardar la paleta antes de poder compartirla', 'error');
            return;
        }
        try {
            const { error } = await supabase
                .from('user_palettes')
                .update({ is_public: true })
                .eq('id', currentPaletteId);
            if (error) throw error;
            const paletteUrl = `${window.location.origin}/palette/${currentPaletteId}`;
            const textArea = document.createElement("textarea");
            textArea.value = paletteUrl;
            textArea.style.position = "fixed"; 
            textArea.style.top = "-9999px";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('¡Enlace copiado! Tu paleta ahora es pública.');
            setSavedPalettes(palettes => palettes.map(p => 
                p.id === currentPaletteId ? { ...p, is_public: true } : p
            ));
        } catch (error) {
            console.error('Error al compartir paleta:', error);
            showNotification(`Error al compartir: ${error.message}`, 'error');
        }
    };

    const handleDuplicatePalette = async (paletteId) => {
        if (!user) return;
        const paletteToDuplicate = savedPalettes.find(p => p.id === paletteId);
        if (!paletteToDuplicate) return;

        try {
            // Corrección de la lógica de duplicado (del contexto)
            const { main_colors, style_tags } = analyzePaletteColors(paletteToDuplicate.explorerPalette);

            const newPaletteData = {
                name: `${paletteToDuplicate.name} (Copia)`,
                description: paletteToDuplicate.description,
                colors: paletteToDuplicate.explorerPalette,
                brand_color: paletteToDuplicate.brandColor,
                gray_color: paletteToDuplicate.grayColor,
                is_gray_auto: paletteToDuplicate.isGrayAuto,
                locked_colors: paletteToDuplicate.lockedColors,
                is_public: false, 
                main_colors: main_colors, 
                style_tags: style_tags,
                project_id: paletteToDuplicate.projectId,
                collection_id: paletteToDuplicate.collectionId,
            };
            
            const { data, error } = await supabase
                .from('user_palettes')
                .insert(newPaletteData)
                .select()
                .single();
            
            if (error) throw error;

            const newPalette = {
                id: data.id,
                name: data.name,
                description: data.description,
                explorerPalette: data.colors,
                brandColor: data.brand_color,
                grayColor: data.gray_color,
                isGrayAuto: data.is_gray_auto,
                lockedColors: data.locked_colors,
                projectId: data.project_id,
                collectionId: data.collection_id,
                styleTags: data.style_tags,
                mainColors: data.main_colors
            };

            setSavedPalettes([newPalette, ...savedPalettes]);
            showNotification(`Paleta "${newPalette.name}" creada.`);

        } catch (error) {
            console.error('Error al duplicar paleta:', error);
            showNotification(`Error al duplicar: ${error.message}`, 'error');
        }
    };

    const handleUpdatePaletteName = async (paletteId, newName) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('user_palettes')
                .update({ name: newName })
                .eq('id', paletteId);
            if (error) throw error;
            setSavedPalettes(palettes => palettes.map(p => 
                p.id === paletteId ? { ...p, name: newName } : p
            ));
            showNotification('Paleta renombrada.');
        } catch (error) {
            console.error('Error al renombrar paleta:', error);
            showNotification(`Error al renombrar: ${error.message}`, 'error');
        }
    };
    
    // --- CRUD para Proyectos ---
    const handleCreateProject = async (projectName) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert({ name: projectName }) 
                .select()
                .single();
            if (error) throw error;
            setProjects([...projects, data].sort((a,b) => a.name.localeCompare(b.name)));
            showNotification(`Proyecto "${projectName}" creado.`);
        } catch (error) {
            showNotification(`Error al crear proyecto: ${error.message}`, 'error');
        }
    };
    
    const handleUpdateProjectName = async (projectId, newName) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('projects')
                .update({ name: newName })
                .eq('id', projectId); 
            if (error) throw error;
            setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName } : p).sort((a,b) => a.name.localeCompare(b.name)));
            showNotification('Proyecto renombrado.');
        } catch (error) {
            showNotification(`Error al renombrar proyecto: ${error.message}`, 'error');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);
            if (error) throw error;
            if (filters.projectId === projectId) {
                setFilters(f => ({ ...f, projectId: null }));
            }
            setProjects(projects.filter(p => p.id !== projectId));
            setSavedPalettes(savedPalettes.map(p => 
                p.projectId === projectId ? { ...p, projectId: null } : p
            )); 
            showNotification('Proyecto eliminado (paletas conservadas).');
        } catch (error) {
            showNotification(`Error al eliminar proyecto: ${error.message}`, 'error');
        }
    };
    
    // --- CRUD para Colecciones ---
    const handleCreateCollection = async (collectionName) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('collections')
                .insert({ name: collectionName })
                .select()
                .single();
            if (error) throw error;
            setCollections([...collections, data].sort((a,b) => a.name.localeCompare(b.name)));
            showNotification(`Colección "${collectionName}" creada.`);
        } catch (error) {
            showNotification(`Error al crear colección: ${error.message}`, 'error');
        }
    };
    
    const handleUpdateCollectionName = async (collectionId, newName) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('collections')
                .update({ name: newName })
                .eq('id', collectionId);
            if (error) throw error;
            setCollections(collections.map(c => c.id === collectionId ? { ...c, name: newName } : c).sort((a,b) => a.name.localeCompare(b.name)));
            showNotification('Colección renombrada.');
        } catch (error) {
            showNotification(`Error al renombrar colección: ${error.message}`, 'error');
        }
    };
    
    const handleDeleteCollection = async (collectionId) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', collectionId);
            if (error) throw error;
            if (filters.collectionId === collectionId) {
                setFilters(f => ({ ...f, collectionId: null }));
            }
            setCollections(collections.filter(c => c.id !== collectionId));
            setSavedPalettes(savedPalettes.map(p => 
                p.collectionId === collectionId ? { ...p, collectionId: null } : p
            ));
            showNotification('Colección eliminada (paletas conservadas).');
        } catch (error) {
            showNotification(`Error al eliminar colección: ${error.message}`, 'error');
        }
    };
    
    // --- Lógica de filtrado ---
    const filteredPalettes = useMemo(() => {
        if (!savedPalettes) {
            return [];
        }
        return savedPalettes.filter(palette => {
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const nameMatch = palette.name.toLowerCase().includes(searchTerm);
                const descMatch = palette.description?.toLowerCase().includes(searchTerm);
                if (!nameMatch && !descMatch) return false;
            }
            if (filters.projectId && palette.projectId !== filters.projectId) {
                return false;
            }
            if (filters.collectionId && palette.collectionId !== filters.collectionId) {
                return false;
            }
            if (filters.style && (!palette.styleTags || !palette.styleTags.includes(filters.style))) {
                return false;
            }
            if (filters.color && (!palette.mainColors || !palette.mainColors.includes(filters.color))) {
                return false;
            }
            return true;
        });
    }, [savedPalettes, filters]);


    // --- RETURN DEL HOOK (sin cambios en las props devueltas) ---
    return {
        themeData, font, brandColor, grayColor, isGrayAuto, explorerMethod, simulationMode,
        explorerPalette,
        explorerGrayShades, paletteAdjustments, notification, fxSeparator, useFxQuotes,
        setFont, updateBrandColor, setGrayColor, setIsGrayAuto, setExplorerMethod, setSimulationMode, 
        handleUndo, handleRedo, 
        handleImport, 
        handleReset, showNotification, setPaletteAdjustments, handleExplorerColorPick, 
        handleRandomTheme, handleThemeToggle, setFxSeparator, setUseFxQuotes,
        lightPreviewMode, darkPreviewMode, semanticPreviewMode,
        cyclePreviewMode, setLightPreviewMode, setDarkPreviewMode, setSemanticPreviewMode,
        reorderExplorerPalette,
        insertColorInPalette, removeColorFromPalette,
        replaceColorInPalette,
        originalExplorerPalette,
        history, historyIndex,
        generatePaletteWithAI,
        updatePaletteState,
        applySimulationToPalette,
        goToHistoryState,
        lockedColors,
        toggleLockColor,
        commitPaletteAdjustments,
        cancelPaletteAdjustments,
        
        savedPalettes: filteredPalettes, 
        currentPaletteId,
        isLoadingPalettes,
        isSavingPalette,
        deletingPaletteId,
        handleSavePalette,
        handleLoadPalette,
        handleDeletePalette,
        handleSharePalette,
        handleDuplicatePalette,
        handleUpdatePaletteName,
        handleLoadSpecificPalette,
        
        projects,
        collections,
        tags,
        filters,
        setFilters,
        handleCreateProject,
        handleUpdateProjectName,
        handleDeleteProject,
        handleCreateCollection,
        handleUpdateCollectionName,
        handleDeleteCollection,
        handleCreateTag 
    };
};

export default useThemeGenerator;