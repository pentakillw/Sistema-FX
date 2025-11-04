import { useState, useEffect, useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { generateShades, generateAdvancedRandomPalette, applyColorMatrix, 
colorblindnessMatrices, getHarmonicGrayColor } from '../utils/colorUtils.js';

// 1. Definimos el color base primero
const baseBrandColor = '#009fdb';
// --- NUEVA SALVAGUARDA (Línea 7) ---
// Nos aseguramos de que grayColor NUNCA sea undefined
const safeGrayColor = getHarmonicGrayColor(baseBrandColor) || '#808080'; 

// 2. Ahora usamos la constante para inicializar el estado
const defaultState = {
    theme: 'light',
    brandColor: baseBrandColor, // Usamos la constante
    isGrayAuto: true, 
    grayColor: safeGrayColor, // <-- USAR SALVAGUARDA
    font: 'Segoe UI',
    fxSeparator: ';',
    useFxQuotes: true,
    explorerPalette: [],
    lockedColors: [], 
};

const defaultPaletteAdjustments = { hue: 0, saturation: 0, brightness: 0, temperature: 0 };

const useThemeGenerator = () => {
    const [theme, setTheme] = useState(defaultState.theme);
    const [brandColor, setBrandColor] = useState(defaultState.brandColor);
    const [isGrayAuto, setIsGrayAuto] = useState(defaultState.isGrayAuto); 
    const [grayColor, setGrayColor] = useState(defaultState.grayColor); // Usamos el estado inicial ya calculado
    const [font, setFont] = useState(defaultState.font);
    const [lockedColors, setLockedColors] = useState(defaultState.lockedColors);

    const [history, setHistory] = useState([{
        brandColor: defaultState.brandColor,
        grayColor: defaultState.grayColor, 
        explorerPalette: defaultState.explorerPalette,
        lockedColors: defaultState.lockedColors, 
        isGrayAuto: defaultState.isGrayAuto, // <-- AÑADIDO
    }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [explorerMethod, setExplorerMethod] = useState('auto');
    const [explorerPalette, setExplorerPalette] = useState(defaultState.explorerPalette); 
    const [originalExplorerPalette, setOriginalExplorerPalette] = useState([]); 
    
    const [explorerGrayShades, setExplorerGrayShades] = useState([]);
    
    const [paletteAdjustments, setPaletteAdjustments] = useState(defaultPaletteAdjustments);

    const isUpdatingFromHistory = useRef(false);

    const [simulationMode, setSimulationMode] = useState('none');
    const [fxSeparator, setFxSeparator] 
= useState(defaultState.fxSeparator);
    const [useFxQuotes, setUseFxQuotes] = useState(defaultState.useFxQuotes);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    
    const [lightPreviewMode, setLightPreviewMode] = useState('white');
    const [darkPreviewMode, setDarkPreviewMode] = useState('black');
    const [semanticPreviewMode, setSemanticPreviewMode] = useState('card');

    const [themeData, setThemeData] = useState(null);

    const saveStateToHistory = (newState) => {
        if (isUpdatingFromHistory.current) {
            return;
        }
        // --- MODIFICACIÓN: Asegurarse de que isGrayAuto se incluya ---
        const stateToSave = {
            ...newState,
            isGrayAuto: newState.isGrayAuto !== undefined ? newState.isGrayAuto : isGrayAuto,
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(stateToSave); // Usar stateToSave
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
            // Actualiza el estado actual en el historial sin crear una nueva entrada
            const newHistory = [...history];
            newHistory[historyIndex] = newState;
            setHistory(newHistory);
        }
    };

    const updateBrandColor = useCallback((newColor) => {
        if (!newColor || newColor === brandColor) return;

        setBrandColor(newColor);
        

        let newGrayColor = grayColor;
        if (isGrayAuto) { 
            newGrayColor = getHarmonicGrayColor(newColor) || defaultState.grayColor; // <-- Salvaguarda
            setGrayColor(newGrayColor);
        }

        saveStateToHistory({ 

            brandColor: newColor, 
            grayColor: newGrayColor, 
            explorerPalette: originalExplorerPalette,
            lockedColors: lockedColors,
            isGrayAuto: isGrayAuto, // <-- AÑADIDO
        });
        
    }, [brandColor, originalExplorerPalette, history, historyIndex, lockedColors, isGrayAuto, grayColor]); 

    const updatePaletteState = (newPalette, newBrandColor = brandColor) => {
        setOriginalExplorerPalette(newPalette);
        
        let newGrayColor = grayColor; 
        if (isGrayAuto) { 
            newGrayColor = getHarmonicGrayColor(newBrandColor) || defaultState.grayColor; // <-- Salvaguarda
            setGrayColor(newGrayColor);
        }
        
        if(newBrandColor !== brandColor) {
            setBrandColor(newBrandColor);
        }
        
        saveStateToHistory({ 
            brandColor: newBrandColor, 
            grayColor: newGrayColor, 
            explorerPalette: newPalette, 
            lockedColors: lockedColors,
            isGrayAuto: isGrayAuto, // <-- AÑADIDO
        });
    };

    const applySimulationToPalette = () => {
        if (simulationMode === 'none') return;
        const matrix = colorblindnessMatrices[simulationMode];
        if (!matrix) return;

        const newPalette = originalExplorerPalette.map(color => {
            if (lockedColors.includes(color)) {
                return color;
            }
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
        const colorToRemove 
= originalExplorerPalette[index];
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
            setBrandColor(previousState.brandColor);
            setGrayColor(previousState.grayColor);
            setOriginalExplorerPalette(previousState.explorerPalette);
            setLockedColors(previousState.lockedColors || []);
            setPaletteAdjustments(defaultPaletteAdjustments);
            // --- CORRECCIÓN ---
            setIsGrayAuto(previousState.isGrayAuto); // Restaurar desde el historial
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
            setOriginalExplorerPalette(nextState.explorerPalette);
            setLockedColors(nextState.lockedColors || []);
            setPaletteAdjustments(defaultPaletteAdjustments);
            // --- CORRECCIÓN ---
            setIsGrayAuto(nextState.isGrayAuto); // Restaurar desde el historial
        }
    };

    const goToHistoryState = (index) => {
        if (index >= 0 && index < history.length) {
            isUpdatingFromHistory.current = true;
            const targetState = 
history[index];
            setHistoryIndex(index);
            setBrandColor(targetState.brandColor);
            setGrayColor(targetState.grayColor);
            setOriginalExplorerPalette(targetState.explorerPalette);
            setLockedColors(targetState.lockedColors || []);
            setPaletteAdjustments(defaultPaletteAdjustments);
            // --- CORRECCIÓN ---
            setIsGrayAuto(targetState.isGrayAuto); // Restaurar desde el historial
            showNotification(`Paleta ${index} cargada.`);
        }
    };
    
     const generatePaletteWithAI = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
        
        if (!apiKey) {
            console.error("API Key no encontrada. Asegúrate de crear un archivo .env con VITE_GEMINI_API_KEY");
            showNotification("Error: API Key no configurada.", "error");
            return false;
        }

        // --- ¡LA CORRECCIÓN ESTÁ AQUÍ! ---
        // Usamos el nombre del modelo que tú encontraste en la documentación.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const currentPaletteSize = originalExplorerPalette.length || 5;
        const fullPrompt = `You are an expert color palette generator. Based on the theme "${prompt}", generate an array of exactly ${currentPaletteSize} aesthetically pleasing and harmonious hex color codes.`;
        const payload = {
            contents: [{ parts: 
[{ text: fullPrompt }] }],
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
                        if (lockedColors.includes(oldColor)) {
                            return oldColor;
                        }
                        return newPaletteFromAI[index] || tinycolor.random().toHexString();
                    });

                    const newBrandColor 
= finalPalette.filter(c => !lockedColors.includes(c))[0] || finalPalette[0];
                    updatePaletteState(finalPalette, newBrandColor); // updatePaletteState se encargará del gris
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
            const { palette } = generateAdvancedRandomPalette(5);
            setOriginalExplorerPalette(palette);
            
            const initialGray = getHarmonicGrayColor(brandColor) || defaultState.grayColor; // <-- Salvaguarda
            setGrayColor(initialGray); 
            setIsGrayAuto(true); 

            const initialState = { 
brandColor, grayColor: initialGray, explorerPalette: palette, lockedColors: [], isGrayAuto: true }; // <-- AÑADIDO
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 


    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    };

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
        
        setExplorerGrayShades(generateShades(grayColor));

    }, [originalExplorerPalette, paletteAdjustments, lockedColors, grayColor]); 


    useEffect(() => {
        if (isUpdatingFromHistory.current) {
            isUpdatingFromHistory.current = false;
        }
    }, [brandColor, grayColor, originalExplorerPalette, lockedColors]);

    
    useEffect(() => {
        // --- NUEVA SALVAGUARDA (Línea 404) ---
        // Si los colores no están listos, no intentes renderizar
        if (!brandColor || !grayColor) {
            console.warn("Esperando a que los colores se inicialicen...");
            return; 
        }

        const brandShades = 
generateShades(brandColor);
        const grayShades = generateShades(grayColor);

        // --- NUEVA SALVAGUARDA (Línea 414) ---
        // Si las sombras fallaron, no continúes
        if (!brandShades || !grayShades || brandShades.length < 20 || grayShades.length < 20) {
            console.error("Fallo al generar las sombras de color", { brandColor, grayColor, brandShades, grayShades });
            return; // No sigas si las sombras no se generaron
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
            { 
name: 'Naranja1', color: attention }, { name: 'Naranja2', color: tinycolor(attention).lighten(15).toHexString() },
            { name: 'Violeta1', color: purple }, { name: 'Violeta2', color: tinycolor(purple).lighten(15).toHexString() },
            { name: 'Turquesa1', color: teal }, { name: 'Turquesa2', color: 
tinycolor(teal).lighten(15).toHexString() },
            { name: 'Rosa1', color: pink }, { name: 'Rosa2', color: tinycolor(pink).lighten(15).toHexString() },
          ],
          fullActionColors: [
            { name: 'Primario', color: brandShades[4] }, { name: 'PrimarioFlotante', color: brandShades[5] },
            { name: 'PrimarioPresionado', color: brandShades[6] }, { name: 'Secundario', color: grayShades[4] },
            { name: 'SecundarioPresionado', color: grayShades[5] }, { 
name: 'Critico', color: critical },
            { name: 'CriticoFlotante', color: tinycolor(critical).lighten(10).toHexString() }, { name: 'CriticoPresionado', color: tinycolor(critical).darken(10).toHexString() },
          ],
          explorerColors: originalExplorerPalette.map((c, i) => ({ name: `Color ${i 
+ 1}`, color: c })),
          lockedExplorerColors: lockedColors,
        };

        if (theme === 'dark') {
          stylePalette.fullBackgroundColors = [
            { name: 'Predeterminado', 
color: grayShades[0] }, { name: 'Apagado', color: grayShades[1] },
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
            { name: 'Critico', 
color: critical }, { name: 'Atencion', color: attention },
            { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
          ];
          stylePalette.fullBorderColors = [
            { name: 'Predeterminado', color: grayShades[2] }, { name: 'Fuerte', color: grayShades[4] },
            { name: 'Inverso', color: grayShades[0] }, { name: 'InfoFuerte', color: info },
            { name: 'CriticoFuerte', color: critical }, { name: 
'AtencionFuerte', color: attention },
            { name: 'ExitoFuerte', color: success },
          ];
        } else { // light theme
           stylePalette.fullBackgroundColors = [
            { name: 'Predeterminado', color: grayShades[19] }, { name: 'Apagado', color: grayShades[18] },
            { name: 'Debil', color: grayShades[17] }, { name: 'Fuerte', color: grayShades[0] },
            { name: 'Inverso', color: grayShades[0] }, 
{ name: 'MarcaDebil', color: brandShades[18] },
            { name: 'InfoDebil', color: tinycolor(info).lighten(25).toHexString() },
            { name: 'ExitoDebil', color: tinycolor(success).lighten(25).toHexString() },
            { name: 'AtencionDebil', color: 
tinycolor(attention).lighten(25).toHexString() },
            { name: 'CriticoDebil', color: tinycolor(critical).lighten(25).toHexString() },
            ];
           stylePalette.fullForegroundColors = [
            { name: 'Predeterminado', color: grayShades[0] }, { name: 'Apagado', color: grayShades[3] },
            { name: 'Debil', color: grayShades[5] }, { name: 'Fuerte', color: grayShades[0] },
            { name: 'Inverso', 
color: grayShades[19] }, { name: 'Info', color: info },
            { name: 'Critico', color: critical }, { name: 'Atencion', color: attention },
            { name: 'Exito', color: success }, { name: 'SobreAccento', color: '#FFFFFF' },
          ];
           stylePalette.fullBorderColors = 
[
            { name: 'Predeterminado', color: grayShades[17] }, { name: 'Fuerte', color: grayShades[5] },
            { name: 'Inverso', color: grayShades[19] }, { name: 'InfoFuerte', color: info },
            { name: 'CriticoFuerte', 
color: critical }, { name: 'AtencionFuerte', color: attention },
            { name: 'ExitoFuerte', color: success },
          ];
        }

        const controlsThemeStyle = {
            backgroundColor: theme === 'light' ? '#F9FAFB' : stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color,
            borderColor: theme === 'light' ? '#E5E7EB' : stylePalette.fullBorderColors.find(c => c.name === 'Predeterminado').color,
            color: theme === 'light' ?
'#4B5563' : '#D1D5DB'
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
            lockedColors: 
lockedColors,
        };

        setThemeData(data);
        
        document.documentElement.style.setProperty('--bg-card', data.stylePalette.fullBackgroundColors.find(c => c.name === 'Apagado').color);
        // --- ¡AQUÍ ESTABA EL ERROR! ---
        // Se corrigió 'Predetermado' a 'Predeterminado'
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
                const importedPalette = imported.explorerPalette 
|| generateAdvancedRandomPalette(5).palette;
                const importedLockedColors = imported.lockedColors || [];
                
                const auto = (imported.isGrayAuto === true || imported.isGrayAuto === undefined);
                setIsGrayAuto(auto); 
                
                const newGrayColor = auto 
                    ? getHarmonicGrayColor(imported.brandColor) || defaultState.grayColor // <-- Salvaguarda
                    : imported.grayColor;
                
                setBrandColor(imported.brandColor);
                setGrayColor(newGrayColor); 
                setFont(imported.font);
                setTheme(imported.theme);
                setOriginalExplorerPalette(importedPalette);
                setLockedColors(importedLockedColors);
                setPaletteAdjustments(defaultPaletteAdjustments); 
                
                const newState = {
                    brandColor: imported.brandColor,
                    grayColor: newGrayColor,
                    explorerPalette: importedPalette,
                    lockedColors: importedLockedColors,
                    isGrayAuto: auto, // <-- AÑADIDO
                };
                saveStateToHistory(newState);
                
                showNotification('¡Tema importado!');
            } catch (_error) {
                showNotification('Error al leer el archivo.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        const { palette } = generateAdvancedRandomPalette(5);
        setTheme(defaultState.theme);
        setBrandColor(defaultState.brandColor);
        setFont(defaultState.font);
        
        setIsGrayAuto(defaultState.isGrayAuto);

        const newGrayColor = getHarmonicGrayColor(defaultState.brandColor) || defaultState.grayColor; // <-- Salvaguarda
        setGrayColor(newGrayColor); 
        
        setOriginalExplorerPalette(palette);
        setLockedColors([]);
        setPaletteAdjustments(defaultPaletteAdjustments);
        
        const initialState = { 
            brandColor: defaultState.brandColor, 
            grayColor: newGrayColor, 
            explorerPalette: palette, 
            lockedColors: [],
            isGrayAuto: defaultState.isGrayAuto, // <-- AÑADIDO
        };
        setHistory([initialState]);
        setHistoryIndex(0);
        showNotification("Tema reiniciado.");
    };

    const handleThemeToggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    
    const handleRandomTheme = (baseColorHex 
= null) => {
        let methodToUse = explorerMethod;
        if (explorerMethod === 'auto') {
            const harmonyMethods = ['analogous', 'triad', 'splitcomplement', 'tetrad', 'monochromatic', 'complement'];
            methodToUse = harmonyMethods[Math.floor(Math.random() * harmonyMethods.length)];
        }
        
        const { palette: newRandomPalette, brandColor: newBrandColorSuggestion } = 
            generateAdvancedRandomPalette(originalExplorerPalette.length || 5, methodToUse, baseColorHex); 

        let randomColorsUsed = 0;
        let baseColorPlaced = false;
        const finalPalette = originalExplorerPalette.map((oldColor) => {
            if (lockedColors.includes(oldColor)) {
                return oldColor;
            }
            if (baseColorHex && !baseColorPlaced) {
                baseColorPlaced = true;
                return baseColorHex;
            }
            const newColor = 
newRandomPalette[randomColorsUsed % newRandomPalette.length];
            randomColorsUsed++;
            return newColor;
        });

        let newBrandColor;
        if (baseColorHex) {
            newBrandColor = baseColorHex;
} else {
            const unLockedColors = finalPalette.filter(c => !lockedColors.includes(c));
            newBrandColor = unLockedColors.length > 0 ? unLockedColors[0] : (lockedColors.length > 0 ? lockedColors[0] : newBrandColorSuggestion);
        }
        
        setBrandColor(newBrandColor);
        setOriginalExplorerPalette(finalPalette); 

        let newGrayColor = grayColor;
        if (isGrayAuto) { 
            newGrayColor = getHarmonicGrayColor(newBrandColor) || defaultState.grayColor; // <-- Salvaguarda
            setGrayColor(newGrayColor);
        }
        
        setPaletteAdjustments(defaultPaletteAdjustments);
        saveStateToHistory({ 
            brandColor: newBrandColor, 
            grayColor: newGrayColor, 
            explorerPalette: finalPalette, 
            lockedColors: lockedColors,
            isGrayAuto: isGrayAuto, // <-- AÑADIDO
        });
    };

    const commitPaletteAdjustments = () => {
        const newLockedColors = lockedColors.map(oldLockedColor => {
            const index = originalExplorerPalette.indexOf(oldLockedColor);
            if (index !== -1 && explorerPalette[index]) {
                return explorerPalette[index];
            }
            return null;
            }).filter(Boolean);

        setOriginalExplorerPalette(explorerPalette);
        setLockedColors(newLockedColors);
        setPaletteAdjustments(defaultPaletteAdjustments);
        
        saveStateToHistory({
            brandColor,
            grayColor,
            explorerPalette: explorerPalette,
            lockedColors: newLockedColors,
            isGrayAuto: isGrayAuto, // <-- AÑADIDO
        });
        showNotification('Ajustes de paleta aplicados.');
    };

    const cancelPaletteAdjustments = () => {
        setPaletteAdjustments(defaultPaletteAdjustments);
    };

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
    };
};

export default 
useThemeGenerator;

