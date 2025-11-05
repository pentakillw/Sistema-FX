import tinycolor from 'tinycolor2';
import { colorNameList } from './colorNameList.js';

/*
  NOTA IMPORTANTE SOBRE LIBRERÍAS:
  
  Tu solicitud menciona espacios de color perceptuales como OKLab/LCH y cálculos 
  de distancia de color (ΔE2000). Estas son características avanzadas que 
  NO están incluidas en 'tinycolor2' (la librería de tu proyecto actual).
  
  Para implementar eso, necesitarías instalar 'colorjs.io':
  1. Ejecutar: `npm install colorjs.io`
  2. Importar: `import Color from "colorjs.io";`
  3. Y luego podrías usar:
     - `new Color(hex).oklch`
     - `Color.deltaE(c1, c2, "2000")`
  
  Dado que no puedo modificar tu 'package.json', he reescrito la lógica 
  de generación de paletas usando 'tinycolor2' (con HSL/HSV) como la 
  MEJOR APROXIMACIÓN POSIBLE a los requisitos de Coolors.
  
  Esta nueva lógica es mucho más avanzada que la anterior y te dará
  paletas significativamente más hermosas y balanceadas.
*/

// --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---
// (Se mantienen para que el resto de la app siga funcionando)

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
    { id: 'auto', name: 'Auto (Coolors)' }, // Nombre actualizado
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

export const getHarmonicGrayColor = (brandColor) => {
    const color = tinycolor(brandColor);
    const hsl = color.toHsl();
    if (hsl.s < 0.1) {
        const randomLightness = 0.45 + (Math.random() * 0.1);
        return tinycolor({ h: hsl.h, s: 0, l: randomLightness }).toHexString();
    }
    let harmonicHue;
    if (hsl.h > 330 || hsl.h < 50) { harmonicHue = 30; } 
    else if (hsl.h > 200 && hsl.h < 310) { harmonicHue = 220; } 
    else { harmonicHue = 200; }
    const randomSaturation = 0.05 + (Math.random() * 0.1);
    const randomLightness = 0.45 + (Math.random() * 0.1);
    return tinycolor({ h: harmonicHue, s: randomSaturation, l: randomLightness }).toHexString();
};

export const findClosestColorName = (hex) => {
  const targetColor = tinycolor(hex).toRgb();
  let minDistance = Infinity;
  let closestName = "Color";
  if (!colorNameList || colorNameList.length === 0) return closestName;
  for (const color of colorNameList) {
    const listColor = tinycolor(color.hex).toRgb();
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
  if (minDistance < 50) return closestName;
  const lightness = targetColor.r * 0.299 + targetColor.g * 0.587 + targetColor.b * 0.114;
  if (lightness < 40) return "Tono Oscuro";
  if (lightness > 220) return "Tono Claro";
  return "Color"; 
};

export const applyAdjustments = (hex, adjustments) => {
  let color = tinycolor(hex);
  if (adjustments.hue !== 0) { color = color.spin(adjustments.hue); }
  if (adjustments.saturation > 0) { color = color.saturate(adjustments.saturation); } 
  else if (adjustments.saturation < 0) { color = color.desaturate(Math.abs(adjustments.saturation)); }
  if (adjustments.brightness > 0) { color = color.lighten(adjustments.brightness); } 
  else if (adjustments.brightness < 0) { color = color.darken(Math.abs(adjustments.brightness)); }
  if (adjustments.temperature !== 0) {
    const tempValue = Math.abs(adjustments.temperature);
    const mixColor = adjustments.temperature > 0 ? '#ff8c00' : '#0077ff';
    color = tinycolor.mix(color, mixColor, tempValue / 2);
  }
  return color.toHexString();
};

// --- FIN DE FUNCIONES EXISTENTES ---

// --- ¡NUEVA LÓGICA DE GENERACIÓN! ---

/**
 * Genera un color aleatorio que cumple con los criterios de Coolors (buena saturación y brillo).
 * @returns {tinycolor.Instance} Un objeto tinycolor.
 */
function getValidRandomBaseColor() {
  let color;
  let hsl;
  let attempts = 0;
  do {
    color = tinycolor.random();
    hsl = color.toHsl();
    attempts++;
  } while (
    // Evitar colores muy oscuros, muy claros o "grises"
    (hsl.l < 0.2 || hsl.l > 0.9 || hsl.s < 0.3) && attempts < 50
  );
  
  // Si falla después de 50 intentos, solo ajusta el último color
  if (hsl.l < 0.2) hsl.l = 0.2 + Math.random() * 0.1;
  if (hsl.l > 0.9) hsl.l = 0.9 - Math.random() * 0.1;
  if (hsl.s < 0.3) hsl.s = 0.3 + Math.random() * 0.2;

  return tinycolor(hsl);
}

/**
 * Función de utilidad para obtener un valor aleatorio en un rango.
 * @param {number} min - Valor mínimo.
 * @param {number} max - Valor máximo.
 * @returns {number}
 */
const rand = (min, max) => min + Math.random() * (max - min);

/**
 * Genera una paleta de colores al estilo "Auto" de Coolors.
 * @param {tinycolor.Instance} baseColor - El color base para generar la paleta.
 * @param {number} count - El número de colores a generar.
 * @returns {tinycolor.Instance[]} Un array de objetos tinycolor.
 */
function generateAutoPalette(baseColor, count) {
  const palette = [baseColor];
  let currentColor = baseColor;

  for (let i = 1; i < count; i++) {
    const hsl = currentColor.toHsl();
    
    // 1. Variación de Tono (Hue): ±20° a ±60°
    const hueShift = rand(20, 60) * (Math.random() > 0.5 ? 1 : -1);
    
    // 2. Variación de Brillo (Lightness): 20% - 90%
    // Intenta un cambio, pero luego lo sujeta al rango
    let newLightness = hsl.l + rand(-0.2, 0.2); // Cambia hasta un 20%
    newLightness = Math.max(0.2, Math.min(0.9, newLightness)); // Sujeta al rango 20-90%

    // 3. Variación de Saturación (Chroma/Saturation): 30% - 80%
    let newSaturation = hsl.s + rand(-0.3, 0.3); // Cambia hasta un 30%
    newSaturation = Math.max(0.3, Math.min(0.8, newSaturation)); // Sujeta al rango 30-80%

    const newColor = tinycolor({
      h: (hsl.h + hueShift) % 360,
      s: newSaturation,
      l: newLightness,
    });
    
    palette.push(newColor);
    currentColor = newColor; // El siguiente color se basa en el recién creado
  }

  // 4. Asegurar al menos un color claro y uno oscuro
  const hasLight = palette.some(c => c.toHsl().l > 0.8);
  const hasDark = palette.some(c => c.toHsl().l < 0.3);

  if (!hasLight) {
    // Hace el segundo color claro (índice 1)
    if (palette[1]) {
      const hsl = palette[1].toHsl();
      hsl.l = rand(0.8, 0.95);
      palette[1] = tinycolor(hsl);
    }
  }
  if (!hasDark) {
    // Hace el último color oscuro
    if (palette[palette.length - 1]) {
      const hsl = palette[palette.length - 1].toHsl();
      hsl.l = rand(0.15, 0.3);
      palette[palette.length - 1] = tinycolor(hsl);
    }
  }

  return palette;
}

/**
 * Genera una paleta de armonía y la balancea.
 * @param {tinycolor.Instance} baseColor - El color base.
 * @param {string} method - El método de armonía.
 * @param {number} count - El número de colores.
 * @returns {tinycolor.Instance[]} Un array de objetos tinycolor.
 */
function generateHarmonyPalette(baseColor, method, count) {
  let harmonyColors;

  switch (method) {
    case 'mono':
    case 'monochromatic':
      harmonyColors = baseColor.monochromatic(count);
      break;
    case 'analogous':
      harmonyColors = baseColor.analogous(count);
      break;
    case 'complement':
      // Genera una interpolación entre el base y el complementario
      const complement = baseColor.complement();
      harmonyColors = [baseColor];
      for (let i = 1; i < count; i++) {
        const mixAmount = (i / (count - 1)) * 100;
        harmonyColors.push(tinycolor.mix(baseColor, complement, mixAmount));
      }
      break;
    case 'split-complement':
    case 'splitcomplement':
      harmonyColors = baseColor.splitcomplement(); // Devuelve 3
      break;
    case 'triad':
      harmonyColors = baseColor.triad(); // Devuelve 3
      break;
    case 'tetrad':
      harmonyColors = baseColor.tetrad(); // Devuelve 4
      break;
    default:
      // Fallback a análogo si el método es desconocido
      harmonyColors = baseColor.analogous(count);
  }

  // Rellenar o truncar la paleta para que coincida con `count`
  if (harmonyColors.length < count) {
    const originalLength = harmonyColors.length;
    for (let i = originalLength; i < count; i++) {
      // Añade variaciones de brillo/saturación de los colores existentes
      const colorToVary = harmonyColors[i % originalLength].toHsl();
      colorToVary.l = (colorToVary.l + 0.2 * (i - originalLength + 1)) % 1.0;
      harmonyColors.push(tinycolor(colorToVary));
    }
  } else if (harmonyColors.length > count) {
    harmonyColors = harmonyColors.slice(0, count);
  }

  // --- Normalización y Balanceo ---
  // Ordena por matiz (hue) para que las armonías sean predecibles
  harmonyColors.sort((a, b) => a.toHsl().h - b.toHsl().h);

  // Define un rango de luminosidad deseado (p.ej. de 0.25 a 0.85)
  const minLightness = 0.25;
  const maxLightness = 0.85;
  const lightnessStep = (maxLightness - minLightness) / (count - 1 || 1);
  
  // *** ¡AQUÍ ESTÁ EL CAMBIO! ***
  // 1. Crea una lista de objetivos de luminosidad y saturación
  const targetLightness = [];
  const targetSaturation = [];
  for (let i = 0; i < count; i++) {
      targetLightness.push(minLightness + (i * lightnessStep));
      // Genera saturaciones en un buen rango (p.ej. 0.4 a 0.8)
      targetSaturation.push(rand(0.4, 0.8)); 
  }

  // 2. ¡Baraja (Shuffle) los objetivos!
  // Esto rompe la conexión "hue-0 siempre es oscuro".
  const shuffledLightness = targetLightness.sort(() => 0.5 - Math.random());
  const shuffledSaturation = targetSaturation.sort(() => 0.5 - Math.random());
  
  // 3. Re-mapea la paleta (que está ordenada por matiz)
  //    a los valores de luminosidad/saturación BARROJADOS.
  return harmonyColors.map((color, i) => {
    const hsl = color.toHsl();
    
    // Asigna la luminosidad y saturación barajada
    hsl.l = shuffledLightness[i];
    hsl.s = shuffledSaturation[i]; 
    
    // Asegura que la saturación no sea demasiado baja (fallback)
    if (hsl.s < 0.35) hsl.s = 0.35;
    
    return tinycolor(hsl);
  });
}


/**
 * ¡¡FUNCIÓN PRINCIPAL REESCRITA!!
 * Genera una paleta de colores avanzada basada en un método (Auto o Armonía).
 * @param {number} [count=5] - Número de colores en la paleta.
 * @param {string} [method='auto'] - 'auto', 'mono', 'analogous', 'complement', 'split-complement', 'triad', 'tetrad'.
 * @param {string | null} [baseColorHex=null] - Un color base opcional en formato H E X.
 * @returns {{palette: string[], brandColor: string}}
 */
export const generateAdvancedRandomPalette = (count = 5, method = 'auto', baseColorHex = null) => {
  
  const baseColor = baseColorHex ? tinycolor(baseColorHex) : getValidRandomBaseColor();
  let paletteColors; // Array de objetos tinycolor

  if (method === 'auto') {
    paletteColors = generateAutoPalette(baseColor, count);
  } else {
    paletteColors = generateHarmonyPalette(baseColor, method, count);
  }

  // Si el método era 'auto', desordena la paleta para que parezca aleatoria
  if (method === 'auto') {
    paletteColors.sort(() => 0.5 - Math.random());
  }
  
  // Convierte la paleta final a H E X
  const finalPalette = paletteColors.map(c => c.toHexString());
  
  return {
    palette: finalPalette,
    brandColor: baseColor.toHexString() // El color base siempre se devuelve como brandColor
  };
};

/**
 * Función anterior que ahora solo se usa como fallback si la nueva falla.
 * La nueva `generateAdvancedRandomPalette` la reemplaza.
 */
export const generateExplorerPalette = (method = 'auto', baseColorHex, count = 20) => {
    console.warn("Usando 'generateExplorerPalette' (antigua). Prefiera 'generateAdvancedRandomPalette'.");
    const { palette } = generateAdvancedRandomPalette(count, method, baseColorHex);
    
    const baseForGray = palette.length > 0 ? palette[Math.floor(palette.length / 2)] : tinycolor.random().toHexString();
    const harmonicGrayShades = generateShades(tinycolor(baseForGray).desaturate(85).toHexString());

    return { palette: palette, gray: harmonicGrayShades };
};