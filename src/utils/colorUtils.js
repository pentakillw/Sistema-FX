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

// --- MODIFICACIÓN --- Se añade el nuevo método "Complementario Dividido"
export const generationMethods = [
    { id: 'auto', name: 'Auto' },
    { id: 'mono', name: 'Monocromo' },
    { id: 'analogous', name: 'Análogo' },
    { id: 'complement', name: 'Complementario' },
    { id: 'split-complement', name: 'Comp. Dividido' }, // NUEVO
    { id: 'triad', name: 'Triádico' },
    { id: 'tetrad', name: 'Tetrádico' }
];

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

export const generateExplorerPalette = (method = 'auto', baseColorHex, count = 20) => {
    let newPalette = [];
    const colorForExplorer = !baseColorHex ? tinycolor.random() : tinycolor(baseColorHex);

    // --- MODIFICACIÓN --- Lógica mejorada para el modo "Auto"
    if (method === 'auto') {
      const harmonyMethods = ['analogous', 'complement', 'split-complement', 'triad'];
      const randomMethod = harmonyMethods[Math.floor(Math.random() * harmonyMethods.length)];
      // Llama a esta misma función con el método aleatorio elegido
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
        // --- NUEVO --- Lógica para "Complementario Dividido"
        case 'split-complement': {
            const splitColors = colorForExplorer.splitcomplement(); // Devuelve 3 colores
            for (let i = 0; i < count; i++) {
                const colorIndex = i % 3;
                let hsv = splitColors[colorIndex].toHsv();
                // Añade variaciones de saturación y brillo para más riqueza
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

