import tinycolor from 'tinycolor2';
import { colorNameList } from './colorNameList.js';

/*
  NOTA DE IMPLEMENTACIÓN:
  Tu receta (HSB/HSV) es excelente. La he implementado
  en la función `generateAdvancedRandomPalette` cuando el
  método es 'auto'.

  - `tinycolor(hex).toHsv()` devuelve S y B en el rango 0-100 (justo como tu receta).
  - `tinycolor({ h, s, v })` espera S y V en el rango 0-1.
  - He creado los ayudantes `hsbToHex` y `hexToHsb` para manejar esta conversión.
*/

// --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---
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

// --- FIN FUNCIONES EXISTENTES ---

// --- INICIO DE NUEVA LÓGICA DE GENERACIÓN ---

/**
 * Genera un número aleatorio en un rango.
 * @param {number} min - Valor mínimo.
 * @param {number} max - Valor máximo.
 * @returns {number}
 */
const rand = (min, max) => min + Math.random() * (max - min);

/**
 * Convierte HSB/HSV (con S/V 0-100) a un string HEX.
 * @param {number} h - Matiz (0-360)
 * @param {number} s - Saturación (0-100)
 * @param {number} b - Brillo (0-100)
 * @returns {string}
 */
const hsbToHex = (h, s, b) => {
    // tinycolor espera S y V como 0-1
    return tinycolor({ h: h, s: s / 100, v: b / 100 }).toHexString();
}

/**
 * Convierte un string HEX a HSB/HSV (con S/V 0-100).
 * @param {string} hex - Color Hex
 * @returns {{h: number, s: number, v: number}}
 */
const hexToHsb = (hex) => {
    return tinycolor(hex).toHsv(); // tinycolor.toHsv() devuelve s y v como 0-100
}

/**
 * Genera un color aleatorio base válido (ni muy oscuro, ni muy claro, ni gris).
 * @returns {tinycolor.Instance}
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
    (hsl.l < 0.2 || hsl.l > 0.9 || hsl.s < 0.3) && attempts < 50
  );
  if (hsl.l < 0.2) hsl.l = 0.2 + Math.random() * 0.1;
  if (hsl.l > 0.9) hsl.l = 0.9 - Math.random() * 0.1;
  if (hsl.s < 0.3) hsl.s = 0.3 + Math.random() * 0.2;
  return tinycolor(hsl);
}

/**
 * Lógica de generación de armonía (copiada de tu archivo original).
 * Se usa para los modos 'mono', 'triad', etc.
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
      const complement = baseColor.complement();
      harmonyColors = [baseColor];
      for (let i = 1; i < count; i++) {
        const mixAmount = (i / (count - 1)) * 100;
        harmonyColors.push(tinycolor.mix(baseColor, complement, mixAmount));
      }
      break;
    case 'split-complement':
    case 'splitcomplement':
      harmonyColors = baseColor.splitcomplement();
      break;
    case 'triad':
      harmonyColors = baseColor.triad();
      break;
    case 'tetrad':
      harmonyColors = baseColor.tetrad();
      break;
    default:
      harmonyColors = baseColor.analogous(count);
  }
  if (harmonyColors.length < count) {
    const originalLength = harmonyColors.length;
    for (let i = originalLength; i < count; i++) {
      const colorToVary = harmonyColors[i % originalLength].toHsl();
      colorToVary.l = (colorToVary.l + 0.2 * (i - originalLength + 1)) % 1.0;
      harmonyColors.push(tinycolor(colorToVary));
    }
  } else if (harmonyColors.length > count) {
    harmonyColors = harmonyColors.slice(0, count);
  }
  harmonyColors.sort((a, b) => a.toHsl().h - b.toHsl().h);
  const minLightness = 0.25;
  const maxLightness = 0.85;
  const lightnessStep = (maxLightness - minLightness) / (count - 1 || 1);
  const targetLightness = [];
  const targetSaturation = [];
  for (let i = 0; i < count; i++) {
      targetLightness.push(minLightness + (i * lightnessStep));
      targetSaturation.push(rand(0.4, 0.8)); 
  }
  const shuffledLightness = targetLightness.sort(() => 0.5 - Math.random());
  const shuffledSaturation = targetSaturation.sort(() => 0.5 - Math.random());
  return harmonyColors.map((color, i) => {
    const hsl = color.toHsl();
    hsl.l = shuffledLightness[i];
    hsl.s = shuffledSaturation[i]; 
    if (hsl.s < 0.35) hsl.s = 0.35;
    return tinycolor(hsl);
  });
}


/**
 * ¡FUNCIÓN PRINCIPAL MODIFICADA!
 * Genera una paleta de colores avanzada.
 * - Si method='auto', usa tu nueva receta HSB/HSV (¡CORREGIDA!).
 * - Si method!='auto', usa la lógica de armonía anterior.
 *
 * @param {number} [count=5] - Número de colores en la paleta.
 * @param {string} [method='auto'] - 'auto', 'mono', 'analogous', etc.
 * @param {string | null} [baseColorHex=null] - Un color base opcional.
 * @param {string[]} [lockedColors=[]] - Array de colores HEX bloqueados.
 * @param {string[]} [originalPalette=[]] - La paleta actual (para mantener posiciones).
 * @returns {{palette: string[], brandColor: string}}
 */
export const generateAdvancedRandomPalette = (
    count = 5, 
    method = 'auto', 
    baseColorHex = null, 
    lockedColors = [], 
    originalPalette = []
) => {

    // --- CASO 1: Armonía Específica (mono, triad, etc.) ---
    // Si el método NO es 'auto', usamos la lógica de armonía anterior.
    if (method !== 'auto') {
        const baseColor = baseColorHex ? tinycolor(baseColorHex) : getValidRandomBaseColor();
        let paletteColors = generateHarmonyPalette(baseColor, method, count);
        const finalPalette = paletteColors.map(c => c.toHexString());
        return {
            palette: finalPalette,
            brandColor: baseColor.toHexString()
        };
    }

    // --- CASO 2: Método 'auto' (Tu Nueva Receta CORREGIDA) ---
    // Forzamos un mínimo de 3 colores para esta lógica.
    const effectiveCount = Math.max(3, count);

    // --- PASO 1: Seleccionar Modelo de Armonía ---
    const harmonyModels = ['Análogo', 'Complementario', 'Triádico', 'Monocromático'];
    const selectedModel = harmonyModels[Math.floor(rand(0, harmonyModels.length))];
    
    const baseHsb = baseColorHex ? hexToHsb(baseColorHex) : hexToHsb(getValidRandomBaseColor().toHexString());
    const baseHue = baseHsb.h;

    let hues = []; // Almacenará los matices funcionales

    switch (selectedModel) {
        case 'Monocromático':
            hues = [baseHue, baseHue, baseHue];
            break;
        case 'Análogo':
            hues = [baseHue, (baseHue + 30) % 360, (baseHue - 30 + 360) % 360];
            break;
        case 'Complementario':
            hues = [baseHue, (baseHue + 180) % 360, (baseHue + 30) % 360];
            break;
        case 'Triádico':
        default:
            hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
            break;
    }
    const [h1, ...remainingHues] = hues;
    const shuffledRemaining = remainingHues.sort(() => 0.5 - Math.random());
    hues = [h1, ...shuffledRemaining];


    // --- PASO 2: Definir Perfil de Cohesión ---
    const profiles = [
        { name: "Pastel", s: [25, 50], b: [85, 95] },
        { name: "Apagado / Terroso", s: [30, 60], b: [40, 75] },
        { name: "Profundo / Joya", s: [60, 100], b: [20, 50] },
        { name: "Vibrante / Limpio", s: [80, 100], b: [80, 100] }
    ];
    
    let selectedProfile;
    if (baseColorHex) {
        const { s, v: b } = baseHsb;
        if (b > 80 && s < 60) selectedProfile = profiles[0]; // Pastel
        else if (b < 60 && s > 50) selectedProfile = profiles[2]; // Profundo
        else if (b > 75 && s > 75) selectedProfile = profiles[3]; // Vibrante
        else selectedProfile = profiles[1]; // Apagado (default)
    } else {
        selectedProfile = profiles[Math.floor(rand(0, profiles.length))];
    }
    const [minS, maxS] = selectedProfile.s;
    const [minB, maxB] = selectedProfile.b;

    // --- PASO 3: Generar y Asignar Roles (¡CORREGIDO!) ---
    // Ya NO generamos neutros. Generamos 'count' colores del perfil.
    let generatedHsbPalette = []; 

    // 1. Color Primario (Marca)
    const primaryHsb = baseColorHex 
        ? { ...baseHsb, role: 'primary' } 
        : { role: 'primary', h: hues[0], s: rand(minS, maxS), b: rand(minB, maxB) };
    generatedHsbPalette.push(primaryHsb);
    
    // 2. Color Secundario (Soporte)
    generatedHsbPalette.push({
        role: 'secondary', h: hues[1], s: rand(minS, maxS), b: rand(minB, maxB)
    });
    
    // 3. Color de Acento (CTA)
    let accentS = rand(minS, maxS);
    let accentB = rand(minB, maxB);
    if (selectedProfile.name !== "Vibrante / Limpio" && Math.random() > 0.5) {
        accentS = Math.min(100, accentS + rand(10, 20));
        accentB = Math.min(100, accentB + rand(10, 20));
    }
    generatedHsbPalette.push({
        role: 'accent', h: hues[2], s: accentS, b: accentB
    });
    
    // 4. Rellenar con colores "Extra" HASTA 'count'
    // Usamos los matices de la armonía para cohesión
    while (generatedHsbPalette.length < effectiveCount) {
        generatedHsbPalette.push({
            role: 'extra',
            h: hues[generatedHsbPalette.length % hues.length], // Cicla los matices
            s: rand(minS, maxS),
            b: rand(minB, maxB)
        });
    }
    // Truncar si es necesario (no debería pasar si count >= 3)
    generatedHsbPalette = generatedHsbPalette.slice(0, effectiveCount);


    // --- Integración de Colores Bloqueados ---
    let finalHsbPalette = [...generatedHsbPalette]; 
    let generatedColorsUsed = 0; 

    if (lockedColors.length > 0 && originalPalette.length === effectiveCount) {
        
        finalHsbPalette = originalPalette.map((oldHex) => {
            // Si el color estaba bloqueado, lo mantenemos.
            if (lockedColors.includes(oldHex)) {
                return hexToHsb(oldHex);
            }

            // Si no está bloqueado, tomamos el siguiente color generado
            // (Nos aseguramos de no re-usar colores)
            let replacement = generatedHsbPalette[generatedColorsUsed % generatedHsbPalette.length];
            generatedColorsUsed++;
            return replacement;
        });
        
    } else {
        // --- PASO 4: Ordenar y Formatear (¡CORREGIDO!) ---
        // Ya NO ordenamos por brillo.
        // Solo barajamos la paleta generada si no hay bloqueos.
        finalHsbPalette.sort(() => 0.5 - Math.random());
    }

    // Convertir a HEX
    const finalPalette = finalHsbPalette.map(c => {
      // Asegurarnos de que c es un objeto {h,s,b} antes de convertir
      if (c && typeof c.h === 'number') {
        return hsbToHex(c.h, c.s, c.b)
      }
      // Fallback por si algo sale mal (ej. un color bloqueado inválido)
      return tinycolor.random().toHexString();
    });

    // Determinar el color de marca
    const brandColor = baseColorHex 
        ? baseColorHex 
        : hsbToHex(primaryHsb.h, primaryHsb.s, primaryHsb.b);

    return {
        palette: finalPalette,
        brandColor: brandColor
    };
}


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