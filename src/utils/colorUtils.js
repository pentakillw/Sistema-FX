import tinycolor from 'tinycolor2';
import { colorNameList } from './colorNameList.js';

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
    { id: 'auto', name: 'Auto (Aleatorio)' }, 
    { id: 'mono', name: 'Monocromo' },
    { id: 'analogous', name: 'Análogo' },
    { id: 'complement', name: 'Complementario' },
    { id: 'split-complement', name: 'Comp. Dividido' },
    { id: 'triad', name: 'Triádico' },
    { id: 'tetrad', 
name: 'Tetrádico' }
];

export const colorblindnessMatrices = {
  protanopia: [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0],
  deuteranopia: [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0],
  tritanopia: [0.95, 
0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0],
  achromatopsia: [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0],
  protanomaly: [0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 
0.875, 0, 0, 0, 0, 0, 1, 0],
  deuteranomaly: [0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0],
  tritanomaly: [0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0],
  achromatomaly: [0.618, 
0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0],
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
  const baseColor = 
tinycolor(hex);
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

export const getHarmonicGrayColor = (brandColor) => {
    const color = tinycolor(brandColor);
    const hsl = color.toHsl();

    if (hsl.s < 0.1) {
        const randomLightness = 0.45 + (Math.random() * 0.1);
        return tinycolor({ h: hsl.h, s: 0, l: randomLightness }).toHexString();
    }

    let harmonicHue;

    if (hsl.h > 330 || hsl.h < 50) {
        harmonicHue = 30;
    } 
    else if (hsl.h > 200 && hsl.h < 310) {
        harmonicHue = 220;
    } 
    else {
        harmonicHue = 200;
    }
    
    const randomSaturation = 0.05 + (Math.random() * 0.1);
    const randomLightness = 0.45 + (Math.random() * 0.1);

    return tinycolor({ h: harmonicHue, s: randomSaturation, l: randomLightness }).toHexString();
};


const primaryHues = [
    { h: 0, s: 0.9, l: 0.45 },   // Rojo
    { h: 30, s: 0.95, l: 0.5 }, // Naranja
    { h: 60, s: 0.9, l: 0.5 },  // Amarillo
    { h: 120, s: 0.8, l: 0.4 }, // Verde
    { h: 220, s: 0.9, l: 0.5 }, // Azul
    { h: 275, s: 0.7, l: 0.45 },// Morado/Púrpura
    { h: 320, s: 0.9, l: 0.55 },// Rosa/Magenta
    { h: 25, s: 
0.6, l: 0.3 }   // Café
];

// --- FUNCIÓN MEJORADA (BASADA EN EL ORIGINAL) ---
export const generateAdvancedRandomPalette = (count = 5, method = 'auto', baseColorHex = null) => {
    
    // 1. Guardamos si el método original era 'auto'
    const isAutoMethod = (method === 'auto');

    let baseColor;
    if (baseColorHex) {
        baseColor = tinycolor(baseColorHex);
    } else {
        const biasCheck = Math.random();

        if (biasCheck < 0.3) { 
            const specialColor = primaryHues[Math.floor(Math.random() * primaryHues.length)];
            baseColor = tinycolor(specialColor);
        } else {
            // --- CORRECCIÓN 1: Paletas "Auto" más hermosas ---
            // Aumentamos la saturación mínima y ajustamos la luminosidad
            baseColor = tinycolor({
                h: Math.random() * 360,
                s: 0.5 + Math.random() * 0.4, // Rango: 0.5 a 0.9 (Antes 0.3-0.8)
                l: 0.45 + Math.random() * 0.2, // Rango: 0.45 a 0.65 (Antes 0.4-0.7)
            });
        }
    }

    let harmonyMethod = method;
    if (harmonyMethod === 'auto') {
        const harmonyMethods = ['analogous', 'triad', 'splitcomplement', 'tetrad', 'monochromatic', 'complement'];
        harmonyMethod = harmonyMethods[Math.floor(Math.random() * harmonyMethods.length)];
    }
    
    let initialPalette;
    switch (harmonyMethod) {
        case 'analogous':
            initialPalette = baseColor.analogous(count);
            break;
        case 'triad':
            initialPalette = baseColor.triad();
            break;
        case 'splitcomplement':
        case 'split-complement': // Añadido alias
            initialPalette = baseColor.splitcomplement();
            break;
        case 'tetrad':
            initialPalette = baseColor.tetrad();
            break;
        case 'monochromatic':
        case 'mono': // Añadido alias
             initialPalette = baseColor.monochromatic(count);
            break;
        case 'complement':
        default: // 'complement' y otros casos
            const complementColor = baseColor.complement();
             initialPalette = [baseColor];
             for (let i = 1; i < count; i++) {
                 const mixAmount = (i / (count - 1)) * 100;
                 initialPalette.push(tinycolor.mix(baseColor, complementColor, mixAmount));
             }
            break;
    }

    // Rellenamos si la paleta no tiene suficientes colores
    while (initialPalette.length < count) {
        const newColor = initialPalette[initialPalette.length % 3].clone().spin(15 * initialPalette.length).lighten(5);
        initialPalette.push(newColor);
    }
    initialPalette = initialPalette.slice(0, count);

    // --- LÓGICA DE BALANCEO (DE COOLORS.CO / EL ARCHIVO ORIGINAL) ---
    // --- CORRECCIÓN 3: Rango de saturación más alto ---
    const targetLuminosities = Array.from({ length: count }, (_, i) => 
        0.95 - (i * (0.8 / (count - 1 || 1)))
    );
    const targetSaturations = Array.from({ length: count }, (_, i) =>
        0.5 + (i * (0.4 / (count - 1 || 1))) // Rango: 0.5 a 0.9 (Antes 0.3-0.9)
    );
    
    // --- CORRECCIÓN 2: ¡ELIMINADO! ---
    // Ya no ordenamos por luminancia, para que las teorías se mantengan por matiz.
    // initialPalette.sort((a, b) => a.getLuminance() - b.getLuminance());
    
    // Desordenamos las saturaciones ANTES de mapearlas.
    const shuffledSaturations = [...targetSaturations].sort(() => 0.5 - Math.random());
    
    // Mapeamos a los nuevos valores de luminosidad y saturación
    let balancedPalette = initialPalette.map((color, index) => {
        let hsl = color.toHsl();
        // APLICAMOS EL BALANCEO de forma desordenada para que sea hermoso
        hsl.l = targetLuminosities[index] * (0.9 + Math.random() * 0.2); // Jitter de luminosidad
        hsl.s = shuffledSaturations[index] * (0.9 + Math.random() * 0.2); // Jitter de saturación
        return tinycolor(hsl);
    });
    
    // --- LÓGICA CONDICIONAL DE DESORDEN ---
    // Si el método original era 'auto', desordena la paleta.
    // Si era 'análogo', 'triádico', etc., la deja ordenada (por matiz/generación).
    if (isAutoMethod) {
        balancedPalette.sort(() => 0.5 - Math.random());
    }

    const finalPalette = balancedPalette.map(c => c.toHexString());
    
    const brandColor = baseColorHex 
        ? baseColorHex
        // Si no, el color más saturado de la paleta balanceada
        : balancedPalette.sort((a,b) => b.toHsl().s - a.toHsl().s)[0].toHexString();

    return { palette: finalPalette, brandColor: brandColor };
};

// --- FUNCIÓN SIMPLIFICADA ---
// Ahora SÓLO llama a la función principal de generación.
export const generateExplorerPalette = (method = 'auto', baseColorHex, count = 20) => {
    
    // 'method' es ahora 'auto', 'mono', 'analogous', etc.
    // generateAdvancedRandomPalette se encargará de:
    // 1. Elegir una armonía (si method es 'auto') o usar la específica.
    // 2. Balancear la paleta (para que sea "hermosa").
    // 3. Desordenar la paleta (SOLO si method es 'auto').
    
    const { palette } = generateAdvancedRandomPalette(count, method, baseColorHex);
    
    // La lógica de los grises sigue igual
    const baseForGray = palette.length > 0 ? palette[Math.floor(palette.length / 2)] : tinycolor.random().toHexString();
    const harmonicGrayShades = generateShades(tinycolor(baseForGray).desaturate(85).toHexString());

    return { palette: palette, gray: harmonicGrayShades };
};
// --- FIN DE LA SIMPLIFICACIÓN ---

export const applyAdjustments = (hex, adjustments) => {
  let color = tinycolor(hex);

  if (adjustments.hue !== 
0) {
    color = color.spin(adjustments.hue);
  }
  if (adjustments.saturation > 0) {
    color = color.saturate(adjustments.saturation);
  } else if (adjustments.saturation < 0) {
    color = color.desaturate(Math.abs(adjustments.saturation));
  }
  if (adjustments.brightness > 0) {
    color = color.lighten(adjustments.brightness);
  } else if (adjustments.brightness < 0) {
    color = color.darken(Math.abs(adjustments.brightness));
  }
  if (adjustments.temperature !== 0) {
    const tempValue = Math.abs(adjustments.temperature);
    const mixColor = adjustments.temperature > 0 ? '#ff8c00' : '#0077ff';
    color = tinycolor.mix(color, mixColor, tempValue / 2);
  }

  return color.toHexString();
};


export const findClosestColorName = (hex) => {
  const targetColor = tinycolor(hex).toRgb();
  let minDistance = Infinity;
  let closestName = "Color";

  if (!colorNameList || colorNameList.length === 0) {
    return closestName;
  }

  for (const color of colorNameList) {
    const listColor = tinycolor(color.hex).toRgb();

    // Cálculo de distancia de color (delta E) - más preciso que RGB simple
    const distance = Math.sqrt(
      Math.pow(targetColor.r - listColor.r, 2) +
      Math.pow(targetColor.g - listColor.g, 2) +
      Math.pow(targetColor.b - listColor.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestName = color.name;
    }
  }

  // --- MODIFICADO: Rango de distancia ajustado ---
  // Solo devuelve el nombre si es un "buen" match (distancia < 50)
  if (minDistance < 50) {
    return closestName;
  }

  // Si no, devuelve un nombre genérico
  const lightness = targetColor.r * 0.299 + targetColor.g * 0.587 + targetColor.b * 0.114;
  if (lightness < 40) return "Tono Oscuro";
  if (lightness > 220) return "Tono Claro";
  
  return "Color"; 
};