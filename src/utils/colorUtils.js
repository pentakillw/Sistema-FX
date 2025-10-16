import tinycolor from 'tinycolor2';

export const availableFonts = {
  'Segoe UI': '"Segoe UI", system-ui, sans-serif',
  'Poppins': '"Poppins", sans-serif',
  'Roboto Slab': '"Roboto Slab", serif',
  'Inconsolata': '"Inconsolata", monospace',
  'Playfair Display': '"Playfair Display", serif',
  'Montserrat': '"Montserrat", sans-serif',
  'Lato': '"Lato", sans-serif',
};

export const generationMethods = [
    { id: 'auto', name: 'Auto' },
    { id: 'mono', name: 'Monocromo' },
    { id: 'analogous', name: 'Análogo' },
    { id: 'complement', name: 'Complementario' },
    { id: 'split-complement', name: 'Comp. Dividido' },
    { id: 'triad', name: 'Triádico' },
    { id: 'tetrad', name: 'Tetrádico' }
];

export const colorblindnessMatrices = {
  protanopia: [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0],
  deuteranopia: [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0],
  tritanopia: [0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0],
  achromatopsia: [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0],
  protanomaly: [0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 0, 1, 0],
  deuteranomaly: [0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0],
  tritanomaly: [0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0],
  achromatomaly: [0.618, 0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0],
};

export const applyColorMatrix = (hex, matrix) => {
    const rgb = tinycolor(hex).toRgb();
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;

    const newR = r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[4];
    const newG = r * matrix[5] + g * matrix[6] + b * matrix[7] + matrix[9];
    const newB = r * matrix[10] + g * matrix[11] + b * matrix[12] + matrix[14];

    const clamp = (val) => Math.max(0, Math.min(1, val));

    const finalRgb = {
        r: Math.round(clamp(newR) * 255),
        g: Math.round(clamp(newG) * 255),
        b: Math.round(clamp(newB) * 255),
    };

    return tinycolor(finalRgb).toHexString();
};

export const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(20).fill('#cccccc');
  const baseColor = tinycolor(hex);
  const shades = [];

  for (let i = 9; i > 0; i--) {
    shades.push(tinycolor.mix(baseColor, '#000', i * 10).toHexString());
  }
  shades.push(baseColor.toHexString());
  for (let i = 1; i <= 10; i++) {
    shades.push(tinycolor.mix(baseColor, '#fff', i * 9).toHexString());
  }
  return shades;
};

// --- ✨ FUNCIÓN DE GENERACIÓN INTELIGENTE Y ESCALABLE ✨ ---
export const generateAdvancedRandomPalette = (count = 5) => {
    // 1. El color base se elige aleatoriamente (pero con restricciones)
    const baseColor = tinycolor({
        h: Math.random() * 360,
        s: 0.3 + Math.random() * 0.5, // Evita grises y neones (30% a 80% sat)
        l: 0.4 + Math.random() * 0.3, // Evita blancos/negros (40% a 70% lum)
    });

    // 2. Aplica reglas de armonía cromática (aleatoriamente)
    const harmonyMethods = ['analogous', 'triad', 'splitcomplement', 'tetrad', 'monochromatic'];
    const randomMethod = harmonyMethods[Math.floor(Math.random() * harmonyMethods.length)];
    
    let initialPalette = [];
    switch (randomMethod) {
        case 'analogous':
            initialPalette = baseColor.analogous(count);
            break;
        case 'triad':
            initialPalette = baseColor.triad();
            break;
        case 'splitcomplement':
            initialPalette = baseColor.splitcomplement();
            break;
        case 'tetrad':
            initialPalette = baseColor.tetrad();
            break;
        case 'monochromatic':
        default:
            initialPalette = baseColor.monochromatic(count);
            break;
    }

    // Asegurarse de que tenemos 'count' colores
    while (initialPalette.length < count) {
        const newColor = initialPalette[0].clone().spin(30 * initialPalette.length);
        initialPalette.push(newColor);
    }
    initialPalette = initialPalette.slice(0, count);

    // 4. Motor de “paleta balanceada” (DINÁMICO PARA CUALQUIER 'count')
    const targetLuminosities = Array.from({ length: count }, (_, i) => 
        0.95 - (i * (0.8 / (count - 1 || 1)))
    ); // Se extiende de 0.95 (claro) a 0.15 (oscuro)

    const targetSaturations = Array.from({ length: count }, (_, i) =>
        0.3 + (i * (0.6 / (count - 1 || 1)))
    ); // Se extiende de 0.3 (apagado) a 0.9 (vibrante)
    
    // Ordena la paleta por luminosidad para aplicar el balance
    initialPalette.sort((a, b) => a.getLuminance() - b.getLuminance());
    
    let balancedPalette = initialPalette.map((color, index) => {
        let hsl = color.toHsl();
        hsl.l = targetLuminosities[index];
        hsl.s = targetSaturations[index] * (0.8 + Math.random() * 0.4);
        return tinycolor(hsl);
    });

    // 6. Barajar la paleta para un orden aleatorio
    balancedPalette.sort(() => 0.5 - Math.random());

    const finalPalette = balancedPalette.map(c => c.toHexString());
    
    // El color de marca será el más saturado de la paleta generada
    const brandColor = balancedPalette.sort((a,b) => b.toHsl().s - a.toHsl().s)[0].toHexString();

    return { palette: finalPalette, brandColor: brandColor };
};

export const generateExplorerPalette = (method = 'auto', baseColorHex, count = 20) => {
    let newPalette = [];
    const colorForExplorer = !baseColorHex ? tinycolor.random() : tinycolor(baseColorHex);

    if (method === 'auto') {
      const harmonyMethods = ['analogous', 'complement', 'split-complement', 'triad'];
      const randomMethod = harmonyMethods[Math.floor(Math.random() * harmonyMethods.length)];
      return generateExplorerPalette(randomMethod, colorForExplorer.toHexString(), count);
    }

    switch (method) {
        case 'mono':
            newPalette = generateShades(colorForExplorer.toHexString()).slice(0, count);
            break;
        case 'analogous': {
            const analogousColors = colorForExplorer.analogous(count);
            newPalette = analogousColors.map(c => c.toHexString());
            break;
        }
        case 'complement': {
            const complementColor = colorForExplorer.complement();
            for (let i = 0; i < count; i++) {
                const mixAmount = (i / (count - 1)) * 100;
                newPalette.push(tinycolor.mix(colorForExplorer, complementColor, mixAmount).toHexString());
            }
            break;
        }
        case 'split-complement': {
            const splitColors = colorForExplorer.splitcomplement();
            for (let i = 0; i < count; i++) {
                const colorIndex = i % 3;
                let hsv = splitColors[colorIndex].toHsv();
                hsv.s = 0.5 + Math.random() * 0.4;
                hsv.v = 0.6 + Math.random() * 0.4;
                newPalette.push(tinycolor(hsv).toHexString());
            }
            break;
        }
        case 'triad': {
            const triadColors = colorForExplorer.triad();
            for (let i = 0; i < count; i++) {
                const colorIndex = i % 3;
                let hsv = triadColors[colorIndex].toHsv();
                hsv.s = 0.5 + Math.random() * 0.5;
                hsv.v = 0.7 + Math.random() * 0.3;
                newPalette.push(tinycolor(hsv).toHexString());
            }
            break;
        }
        case 'tetrad': {
            const tetradColors = colorForExplorer.tetrad();
             for (let i = 0; i < count; i++) {
                const colorIndex = i % 4;
                let hsv = tetradColors[colorIndex].toHsv();
                hsv.s = 0.5 + Math.random() * 0.5;
                hsv.v = 0.7 + Math.random() * 0.3;
                newPalette.push(tinycolor(hsv).toHexString());
            }
            break;
        }
    }
    
    const finalPalette = newPalette.slice(0, count);
    const baseForGray = finalPalette.length > 0 ? finalPalette[Math.floor(finalPalette.length / 2)] : tinycolor.random().toHexString();
    const harmonicGrayShades = generateShades(tinycolor(baseForGray).desaturate(85).toHexString());

    return { palette: finalPalette, gray: harmonicGrayShades };
};

