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

export const generateExplorerPalette = (method = 'auto', baseColorHex) => {
    let newPalette = [];
    const colorForExplorer = (method === 'auto' || !baseColorHex) 
      ? tinycolor.random()
      : tinycolor(baseColorHex);

    switch (method) {
        case 'mono':
            newPalette = generateShades(colorForExplorer.toHexString());
            break;
        case 'analogous': {
            const analogousColors = colorForExplorer.analogous(5, 10);
            analogousColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(4, 8));
            });
            break;
        }
        case 'complement': {
            const complementColors = [colorForExplorer, colorForExplorer.complement()];
            complementColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(0, 10));
            });
            break;
        }
        case 'triad': {
            const triadColors = colorForExplorer.triad();
            for(let i = 0; i < 7; i++) {
                if (triadColors[0] && triadColors[1] && triadColors[2]) {
                    newPalette.push(...generateShades(triadColors[0].toHexString()).slice(i*2, i*2+2));
                    newPalette.push(...generateShades(triadColors[1].toHexString()).slice(i*2, i*2+2));
                    newPalette.push(...generateShades(triadColors[2].toHexString()).slice(i*2, i*2+2));
                }
            }
             newPalette = newPalette.slice(0, 20);
            break;
        }
        case 'tetrad': {
            const tetradColors = colorForExplorer.tetrad();
            tetradColors.forEach(c => {
                newPalette.push(...generateShades(c.toHexString()).slice(2, 7));
            });
            break;
        }
        case 'auto':
        default: {
            let hsv = colorForExplorer.toHsv();
            for (let i = 0; i < 20; i++) {
                hsv.h = (hsv.h + 137.508) % 360; // Golden Angle
                hsv.s = Math.max(0.3, Math.min(1, hsv.s + (Math.random() - 0.5) * 0.2));
                hsv.v = Math.max(0.6, Math.min(1, hsv.v + (Math.random() - 0.5) * 0.2));
                newPalette.push(tinycolor(hsv).toHexString());
            }
            break;
        }
    }
    
    const finalPalette = newPalette.slice(0, 20);
    const baseForGray = finalPalette.length > 9 ? finalPalette[9] : tinycolor.random().toHexString();
    const harmonicGrayShades = generateShades(tinycolor(baseForGray).desaturate(85).toHexString());

    return { palette: finalPalette, gray: harmonicGrayShades };
};

