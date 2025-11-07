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

// --- (INICIO) PLAN ASTUTO: Simular la Base de Datos ---
// Esta es nuestra lista "curada" de colores base atractivos.
// Ya no elegimos un matiz aleatorio de 0-360. Elegimos de aquí.
const CURATED_BASE_COLORS = [
  '#d90429', '#ef233c', '#e85d04', '#f48c06', '#faa307', '#ffb703',
  '#008000', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2',
  '#0077b6', '#023e8a', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef',
  '#10002b', '#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd',
  '#c77dff', '#e0aaff', '#f72585', '#b5179e', '#7209b7', '#560bad',
  '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0',
  '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f', '#90be6d',
  '#43aa8b', '#4d908e', '#577590', '#277da1', '#c44536', '#772e25',
  '#a26769', '#6d597a', '#b56576', '#e56b6f', '#eaac8b', '#2a9d8f',
  '#e9c46a', '#f4a261', '#e76f51', '#d62828', '#003049', '#f77f00'
];
// --- (FIN) PLAN ASTUTO ---


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
    // --- Grupo: Métodos Clásicos ---
    { isHeader: true, name: 'Métodos Clásicos' },
    { id: 'auto', name: 'Auto (Aleatorio)' },
    { id: 'mono', name: 'Monocromo' },
    { id: 'analogous', name: 'Análogo (Clásico)' },
    { id: 'complement', name: 'Complementario (Clásico)' },
    { id: 'split-complement', name: 'Comp. Dividido (Clásico)' },
    { id: 'triad', name: 'Triádico (Clásico)' },
    { id: 'tetrad', name: 'Tetrádico (Clásico)' },

    // --- Grupo: Perfiles de Color ---
    { isHeader: true, name: 'Perfiles de Color' },
    { id: 'vibrante', name: 'Perfil: Vibrante' },
    { id: 'pop-neon', name: 'Perfil: Neón Pop' },
    { id: 'profundo', name: 'Perfil: Profundo (Joya)' },
    { id: 'pastel', name: 'Perfil: Pastel' },
    { id: 'faded', name: 'Perfil: Desvaído' },
    { id: 'vintage', name: 'Perfil: Vintage' },
    { id: 'grayscale', name: 'Perfil: Escala de Grises' },
    { id: 'metallic', name: 'Perfil: Metálico' },

    // --- Grupo: Temas Naturales ---
    { isHeader: true, name: 'Temas Naturales' },
    { id: 'theme-autumn', name: 'Tema: Otoño' },
    { id: 'theme-spring', name: 'Tema: Primavera' },
    { id: 'theme-winter', name: 'Tema: Invierno' },
    { id: 'earthy', name: 'Tema: Tierra' },
    { id: 'oceanic', name: 'Tema: Océano' },
    { id: 'sunset', name: 'Tema: Atardecer' },
    { id: 'tematico-fuego', name: 'Tema: Fuego' },
    { id: 'tematico-hielo', name: 'Tema: Hielo' },
    { id: 'tematico-desierto', name: 'Tema: Desierto' },
    { id: 'themed-forest', name: 'Tema: Bosque' },
    { id: 'theme-jungle', name: 'Tema: Jungla' },
    { id: 'theme-coastal', name: 'Tema: Costero' },
    { id: 'theme-tropical', name: 'Tema: Tropical' },
    { id: 'theme-savanna', name: 'Tema: Sabana' },

    // --- Grupo: Temas de Cultura y Estilo (Genéricos) ---
    { isHeader: true, name: 'Estilos y Cultura' },
    { id: 'theme-nebula', name: 'Estilo: Nebulosa' },
    { id: 'theme-vaporwave', name: 'Estilo: Vaporwave' },
    { id: 'game-cyberpunk', name: 'Estilo: Cyber' }, // (Ya estaba)
    { id: 'theme-cyber-noir', name: 'Estilo: Cyber Noir' },
    { id: 'movie-dune', name: 'Estilo: Desierto Arena' }, // (Ya estaba)
    { id: 'brand-google', name: 'Estilo: Digital' }, // (Ya estaba)
    { id: 'theme-artdeco', name: 'Estilo: Art Deco' },
    { id: 'theme-bauhaus', name: 'Estilo: Bauhaus' },
    { id: 'theme-gothic', name: 'Estilo: Gótico' },
    { id: 'theme-impressionism', name: 'Estilo: Impresionismo' },
    { id: 'academic', name: 'Estilo: Académico' },
    { id: 'southwestern', name: 'Estilo: Suroeste' },
    { id: 'themed-sweets', name: 'Estilo: Dulces / Pasteles' },
    { id: 'theme-gourmet', name: 'Estilo: Gourmet' },
    { id: 'movie-spiderverse', name: 'Estilo: Comic' },
    { id: 'movie-barbie', name: 'Estilo: Muñeca' },
    { id: 'movie-oppenheimer', name: 'Estilo: Fisión' },
    { id: 'movie-matrix', name: 'Estilo: Matriz' },
    { id: 'movie-interstellar', name: 'Estilo: Interestelar' },
    { id: 'movie-spiritedaway', name: 'Estilo: Anime' },
    { id: 'game-mario', name: 'Estilo: Reino Champiñón' },
    { id: 'game-zelda-botw', name: 'Estilo: Fantasía' },
    { id: 'game-minecraft', name: 'Estilo: Bloques' },
    { id: 'game-portal', name: 'Estilo: Laboratorio' },
    { id: 'game-witcher', name: 'Estilo: Medieval' },
    { id: 'game-animalcrossing', name: 'Estilo: Isla' },
    { id: 'brand-spotify', name: 'Estilo: Musical' },
    { id: 'brand-microsoft', name: 'Estilo: Oficina' },
    { id: 'brand-ikea', name: 'Estilo: Nórdico' },
    { id: 'brand-coke', name: 'Estilo: Clásico' },
    { id: 'brand-starbucks', name: 'Estilo: Cafetería' },

    // --- Grupo: Armonías Avanzadas y Contraste ---
    { isHeader: true, name: 'Armonías y Contraste' },
    { id: 'calido', name: 'Armonía: Cálida' },
    { id: 'frio', name: 'Armonía: Fría' },
    { id: 'primary', name: 'Armonía: Primaria' },
    { id: 'secondary', name: 'Armonía: Secundaria' },
    { id: 'alto-contraste', name: 'Contraste: Alto' },
    { id: 'bajo-contraste', name: 'Contraste: Bajo' },
    { id: 'high-key', name: 'Contraste: Clave Alta' },
    { id: 'low-key', name: 'Contraste: Clave Baja' },
    { id: 'gradiente-analogo', name: 'Gradiente: Análogo' },
    { id: 'gradiente-analogo-vibrante', name: 'Gradiente: Vibrante' },
    { id: 'rampa-saturacion', name: 'Gradiente: Saturación' },
    { id: 'complementario-dividido', name: 'Armonía: Comp. Dividido (Temp)' },
    { id: 'acentos-complementarios', name: 'Armonía: Acentos Comp.' },
    { id: 'tetrada', name: 'Armonía: Tétrada (Bal.)' },
    { id: 'triad-balanced', name: 'Armonía: Triada (Bal.)' },
    { id: 'analogo-comp', name: 'Armonía: Análogo+Comp.' },
    { id: 'monotone-split', name: 'Armonía: Mono+Acento' },
    { id: 'neutral-accent', name: 'Armonía: Neutros+Acento' },
    { id: 'acentos-dobles-neutros', name: 'Armonía: Doble Acento' },
    { id: 'doble-complementario', name: 'Armonía: Doble Comp.' },
    { id: 'dos-matices', name: 'Armonía: Dos Matices' },
    { id: 'complemento-neutros', name: 'Armonía: Comp+Neutros' },

    // --- Grupo: Otros ---
    { isHeader: true, name: 'Otros' },
    { id: 'caos', name: 'Aleatorio (Caos)' },
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
 * Lógica de generación de armonía (copiada de tu archivo original).
 * Se usa para los modos 'mono', 'triad', etc.
 */
function generateHarmonyPalette(baseColor, method, count) {
  let harmonyColors;
  switch (method) {
    // NOTA: 'mono' se maneja ahora con la lógica de plantillas
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
 * ¡FUNCIÓN PRINCIPAL MODIFICADA! (Plan Monstruoso 11.0)
 * Genera una paleta de colores avanzada.
 * - Ahora elige aleatoriamente entre 44 MÚLTIPLES plantillas de generación.
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

    // --- CASO 1: Armonía Específica (triad, analogous, etc.) ---
    // Si el método NO es 'auto' O 'mono', usamos la lógica de armonía simple.
    const classicMethods = ['analogous', 'complement', 'split-complement', 'splitcomplement', 'triad', 'tetrad'];
    if (classicMethods.includes(method)) {
        const baseColor = baseColorHex ? tinycolor(baseColorHex) : tinycolor(CURATED_BASE_COLORS[Math.floor(rand(0, CURATED_BASE_COLORS.length))]);
        let paletteColors = generateHarmonyPalette(baseColor, method, count);
        const finalPalette = paletteColors.map(c => c.toHexString());
        return {
            palette: finalPalette,
            brandColor: baseColor.toHexString()
        };
    }
    // --- FIN CASO 1 ---

    // --- CASO 2: Método 'auto' o Temático (¡Plan Monstruoso 11.0!) ---
    const effectiveCount = Math.max(3, count);

    // --- PASO 1: Seleccionar Color Base y Matices de Armonía ---
    
    // ¡Usamos la lista curada!
    const baseColor = baseColorHex 
        ? tinycolor(baseColorHex) 
        : tinycolor(CURATED_BASE_COLORS[Math.floor(rand(0, CURATED_BASE_COLORS.length))]);
        
    const baseHsb = baseColor.toHsv(); // { h: 0-360, s: 0-100, v: 0-100 }
    const baseHue = baseHsb.h;

    // Generamos 5 matices (Hues) únicos para los 5 roles
    const hues = [
        baseHue, // Base
        (baseHue + 180) % 360, // Complementario
        (baseHue + 30) % 360,  // Análogo 1
        (baseHue - 30 + 360) % 360, // Análogo 2
        (baseHue + 120) % 360, // Triádico 1
        (baseHue + 90) % 360, // Tetrádico 1
        (baseHue + 270) % 360, // Tetrádico 2
    ];
    // Barajamos los matices
    const shuffledHues = hues.sort(() => 0.5 - Math.random());


    // --- PASO 2: Seleccionar un "Template" de Generación ---
    
    // ¡NUESTRO ARSENAL DE 79 PLANTILLAS (REORDENADAS)!
    const templates = [
      // --- (Grupo 1) Temas Artísticos y Naturales (Más Atractivos) ---
      'theme-nebula', 'theme-vaporwave', 'theme-cyber-noir', 'theme-tropical', 'theme-autumn', 
      'theme-spring', 'theme-winter', 'theme-jungle', 'theme-coastal', 'theme-savanna', 
      'theme-artdeco', 'theme-gothic', 'theme-impressionism', 'theme-gourmet', 'theme-bauhaus',
      
      // --- (Grupo 2) Medios (Películas y Juegos) ---
      'movie-spiderverse', 'movie-barbie', 'movie-dune', 'movie-oppenheimer', 'movie-matrix', 
      'movie-interstellar', 'movie-spiritedaway', 'game-cyberpunk', 'game-mario', 'game-zelda-botw', 
      'game-minecraft', 'game-portal', 'game-witcher', 'game-animalcrossing',

      // --- (Grupo 3) Marcas ---
      'brand-google', 'brand-spotify', 'brand-microsoft', 'brand-ikea', 'brand-coke', 'brand-starbucks',

      // --- (Grupo 4) Perfiles de Alto Impacto ---
      'vibrante', 'pop-neon', 'profundo', 'sunset', 'oceanic', 'tematico-fuego', 'tematico-hielo', 
      'tematico-desierto', 'themed-forest', 'themed-sweets', 'primary', 'secondary', 'metallic', 
      'gradiente-analogo-vibrante', 'alto-contraste',

      // --- (Grupo 5) Perfiles Equilibrados y Apagados ---
      'equilibrado', 'pastel', 'apagado', 'vintage', 'faded', 'earthy', 'academic', 'southwestern',
      'high-key', 'low-key', 'acentos-dobles-neutros',

      // --- (Grupo 6) Teoría y Armonía ---
      'complementario-dividido', 'acentos-complementarios', 'triad-balanced', 'analogo-comp', 
      'tetrada', 'doble-complementario', 'dos-matices', 'complemento-neutros', 'neutral-accent', 
      'gradiente-analogo', 'monotone-split', 'rampa-saturacion', 'bajo-contraste',
      
      // --- (Grupo 7) Básicos y Caos ---
      'mono', 'grayscale', 'calido', 'frio', 'caos'
    ];
    
    let selectedTemplate;

    // --- (INICIO) SELECCIÓN DE PLANTILLA MANUAL ---
    // Si el método *NO* es 'auto' (ej. 'brand-google'), 
    // lo usamos para forzar la plantilla seleccionada.
    if (method !== 'auto' && templates.includes(method)) {
        selectedTemplate = method;
    }
    // --- (FIN) SELECCIÓN DE PLANTILLA MANUAL ---
    else if (baseColorHex && lockedColors.length === 0) {
        // --- INFERIR PLANTILLA ---
        const { h, s, v: b } = baseHsb; // s y b (brillo) están en 0-100
        
        if (s < 5) selectedTemplate = 'grayscale';
        else if (s > 90 && b > 80) selectedTemplate = 'pop-neon';
        else if (s > 60 && b < 50) selectedTemplate = 'profundo';       // Profundo/Joya
        else if (s > 70 && b > 70) selectedTemplate = 'gradiente-analogo-vibrante'; // vibrante
        else if (s < 20 && b > 75) selectedTemplate = 'faded';
        else if (s < 30 && b > 85) selectedTemplate = 'pastel';      // Pastel
        else if (s < 40 && b > 60) selectedTemplate = 'vintage';
        else if (s < 50 && b < 80) selectedTemplate = 'gradiente-analogo'; // apagado
        else selectedTemplate = 'equilibrado'; // Default
        
    } else if (baseColorHex && lockedColors.length > 0) {
        // --- MODO BLOQUEADO ---
        const balancingTemplates = [
            'equilibrado', 'complementario-dividido', 'acentos-complementarios', 'tetrada',
            'neutral-accent', 'triad-balanced', 'analogo-comp', 'acentos-dobles-neutros',
            'alto-contraste', 'dos-matices', 'complemento-neutros'
        ];
        selectedTemplate = balancingTemplates[Math.floor(rand(0, balancingTemplates.length))];

    } else {
        // --- MODO ALEATORIO PURO ---
        selectedTemplate = templates[Math.floor(rand(0, templates.length))];
    }
    
    // Si el método de generación era 'mono', forzar el template 'gradiente-mono'
    if (method === 'mono' || method === 'monochromatic') {
        selectedTemplate = 'gradiente-mono'; // Reemplazamos 'monocromatico' por la mejor versión
    }
    // --- Fin de la lógica de elección de plantilla ---


    let generatedHsbPalette = [];
    let baseTemplateColors = []; // <-- ¡NUEVO!

    // --- PASO 3: Ejecutar la Plantilla de Generación ---
    // (Esta sección define los colores "semilla" y los guarda en baseTemplateColors)
    switch (selectedTemplate) {
        
        case 'pastel':
            // TEMPLATE 2: Pastel Suave (Todos claros y desaturados)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(15, 40), // Saturación baja
                    b: rand(85, 95)  // Brillo alto
                });
            }
            break;

        case 'apagado':
            // TEMPLATE 3: Apagado/Tierra (Todos medios y desaturados)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(20, 50), // Saturación media-baja
                    b: rand(30, 80)  // Brillo medio
                });
            }
            break;

        case 'vibrante':
            // TEMPLATE 4: Vibrante (Todos brillantes y saturados)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(70, 100), // Saturación ALTA
                    b: rand(70, 100)  // Brillo ALTO
                });
            }
            break;

        case 'profundo':
            // TEMPLATE 5: Profundo / Joya (Todos oscuros y saturados)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(60, 100), // Saturación ALTA
                    b: rand(20, 50)   // Brillo BAJO/MEDIO
                });
            }
            break;
            
        case 'calido':
            // TEMPLATE 6: Cálido (Todos los Hues en rango cálido)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                const hue = Math.random() > 0.3 ? rand(0, 70) : rand(330, 360);
                baseTemplateColors.push({ 
                    h: hue, s: rand(40, 90), b: rand(30, 95)
                });
            }
            break;

        case 'frio':
            // TEMPLATE 7: Frío (Todos los Hues en rango frío)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(70, 329), s: rand(40, 90), b: rand(30, 95)
                });
            }
            break;

        case 'gradiente-mono':
            // TEMPLATE 8: Gradiente Monocromático (Mismo matiz, rampa de B)
            const monoHue = baseHue;
            const s = rand(70, 100); 
            const bValues = [rand(85, 95), rand(65, 80), rand(50, 65), rand(35, 50), rand(20, 35)];
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: monoHue,
                    s: s - (i * 5),
                    b: bValues[i % bValues.length]
                });
            }
            break;
            
        case 'gradiente-analogo':
            // TEMPLATE 9: Gradiente Análogo Apagado (Mueve el Hue, S/B constantes)
            const analogHue = baseHue;
            const hueStep = rand(15, 30); 
            const analogS = rand(20, 50); 
            const analogB = rand(40, 80);
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: (analogHue + (i * hueStep)) % 360,
                    s: analogS + rand(-5, 5),
                    b: analogB + rand(-10, 10)
                });
            }
            break;

        case 'complementario-dividido':
            // TEMPLATE 10: Par Complementario (2+2+1)
            const h1 = baseHue;
            const h2 = (baseHue + 180) % 360; 
            baseTemplateColors.push({ h: h1, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h1, s: rand(50, 90), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h2, s: rand(60, 95), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h2, s: rand(20, 50), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: rand(0, 360), s: rand(5, 15), b: rand(90, 98) }); // <-- CAMBIO
            break;

        case 'acentos-complementarios':
            // TEMPLATE 11: Base + Acentos (3+2)
            const accentBaseHue = baseHue;
            const accentCompHue = (baseHue + 180) % 360;
            baseTemplateColors.push({ h: accentBaseHue, s: rand(60, 100), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: accentBaseHue, s: rand(50, 90), b: rand(40, 60) }); // <-- CAMBIO
            baseTemplateColors.push({ h: accentBaseHue, s: rand(40, 80), b: rand(60, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: accentCompHue, s: rand(20, 50), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: accentCompHue, s: rand(30, 60), b: rand(60, 80) }); // <-- CAMBIO
            break;

        case 'tetrada':
            // TEMPLATE 12: Tétrada (1+1+1+1+Neutro)
            const tHue1 = baseHue;
            const tHue2 = (baseHue + 90) % 360;
            const tHue3 = (baseHue + 180) % 360;
            const tHue4 = (baseHue + 270) % 360;
            baseTemplateColors.push({ h: tHue1, s: rand(70, 100), b: rand(20, 50) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tHue2, s: rand(40, 80), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tHue3, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tHue4, s: rand(30, 60), b: rand(85, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: rand(0, 360), s: rand(5, 15), b: rand(80, 95) }); // <-- CAMBIO
            break;

        case 'pop-neon':
            // TEMPLATE 13: Hyper-vibrante
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(90, 100), b: rand(80, 100)
                });
            }
            break;

        case 'vintage':
            // TEMPLATE 14: Desteñido/Vintage
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(20, 40), b: rand(60, 90)
                });
            }
            break;
            
        case 'earthy':
            // TEMPLATE 15: Tonos Tierra
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                const hue = Math.random() > 0.5 ? rand(20, 70) : rand(180, 220); // Naranjas/Verdes
                baseTemplateColors.push({ 
                    h: hue, s: rand(30, 70), b: rand(30, 70)
                });
            }
            break;

        case 'oceanic':
            // TEMPLATE 16: Tonos Océano
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(70, 260), // Verdes/Azules/Cianes
                    s: rand(40, 90), b: rand(30, 95)
                });
            }
            break;

        case 'sunset':
            // TEMPLATE 17: Tonos Atardecer
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                const hue = Math.random() > 0.3 ? rand(0, 60) : rand(300, 360); // Rojos/Naranjas/Rosas
                baseTemplateColors.push({ 
                    h: hue, s: rand(50, 100), b: rand(40, 90)
                });
            }
            break;

        case 'high-key':
            // TEMPLATE 18: Mayormente Claro
            baseTemplateColors.push({ h: shuffledHues[0], s: rand(5, 20), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[1], s: rand(15, 40), b: rand(85, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[2], s: rand(15, 40), b: rand(85, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[3], s: rand(5, 20), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[4], s: rand(60, 100), b: rand(20, 40) }); // <-- CAMBIO
            break;

        case 'low-key':
            // TEMPLATE 19: Mayormente Oscuro
            baseTemplateColors.push({ h: shuffledHues[0], s: rand(10, 30), b: rand(15, 30) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[1], s: rand(60, 100), b: rand(20, 35) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[2], s: rand(60, 100), b: rand(25, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[3], s: rand(10, 30), b: rand(15, 30) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[4], s: rand(70, 100), b: rand(85, 95) }); // <-- CAMBIO
            break;

        case 'neutral-accent':
            // TEMPLATE 20: Neutros + 1 Acento
            baseTemplateColors.push({ h: baseHue, s: rand(5, 15), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(5, 15), b: rand(60, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(5, 15), b: rand(30, 50) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(5, 15), b: rand(15, 30) }); // <-- CAMBIO
            baseTemplateColors.push({ h: (baseHue + 180) % 360, s: rand(80, 100), b: rand(60, 80) }); // <-- CAMBIO
            break;

        case 'triad-balanced':
            // TEMPLATE 21: Tríada Balanceada (1+2+2)
            const h_triad_1 = baseHue;
            const h_triad_2 = (baseHue + 120) % 360;
            const h_triad_3 = (baseHue + 240) % 360;
            baseTemplateColors.push({ h: h_triad_1, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_triad_2, s: rand(50, 90), b: rand(40, 70) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_triad_3, s: rand(30, 70), b: rand(70, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_triad_1, s: rand(5, 15), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_triad_1, s: rand(5, 15), b: rand(15, 30) }); // <-- CAMBIO
            break;

        case 'analogo-comp':
            // TEMPLATE 22: Análogo + Complemento (3+1+1)
            const h_an_1 = baseHue;
            const h_an_2 = (baseHue + 30) % 360;
            const h_an_3 = (baseHue - 30 + 360) % 360;
            const h_comp = (baseHue + 180) % 360;
            baseTemplateColors.push({ h: h_an_1, s: rand(60, 100), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_an_2, s: rand(50, 90), b: rand(40, 70) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_an_3, s: rand(40, 80), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_comp, s: rand(70, 100), b: rand(70, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_an_1, s: rand(5, 15), b: rand(90, 98) }); // <-- CAMBIO
            break;

        case 'grayscale':
            // TEMPLATE 23: Escala de Grises
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: 0, s: 0, b: rand(10, 95)
                });
            }
            break;

        case 'faded':
            // TEMPLATE 24: Desvaído
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: shuffledHues[i % shuffledHues.length],
                    s: rand(10, 25), b: rand(75, 95)
                });
            }
            break;

        case 'primary':
            // TEMPLATE 25: Colores Primarios
            const p_hues = [rand(350, 10), rand(50, 70), rand(230, 250)];
            baseTemplateColors.push({ h: p_hues[0], s: rand(70, 100), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: p_hues[1], s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: p_hues[2], s: rand(70, 100), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(10, 20) }); // <-- CAMBIO
            break;

        case 'secondary':
            // TEMPLATE 26: Colores Secundarios
            const s_hues = [rand(25, 45), rand(110, 140), rand(260, 290)];
            baseTemplateColors.push({ h: s_hues[0], s: rand(70, 100), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: s_hues[1], s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: s_hues[2], s: rand(70, 100), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(10, 20) }); // <-- CAMBIO
            break;
            
        case 'metallic':
            // TEMPLATE 27: Metálicos
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(25, 50), // Rango de Dorados/Bronces
                    s: rand(20, 70),
                    b: rand(40, 95)
                });
            }
            break;

        case 'themed-forest':
            // TEMPLATE 28: Bosque
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                const hue = Math.random() > 0.3 ? rand(70, 160) : rand(20, 45); // Verdes y Marrones
                baseTemplateColors.push({ 
                    h: hue, s: rand(30, 80), b: rand(20, 70)
                });
            }
            break;
            
        case 'themed-sweets':
            // TEMPLATE 29: Pastelería
            const sw_hues = [rand(300, 350), rand(190, 220), rand(50, 60)]; // Rosa, Azul claro, Crema
            for (let i = 0; i < sw_hues.length; i++) {
                baseTemplateColors.push({ 
                    h: sw_hues[i],
                    s: rand(20, 50), b: rand(80, 95)
                });
            }
            break;

        case 'academic':
            // TEMPLATE 30: Académico
            const ac_hues = [rand(340, 360), rand(220, 250), rand(90, 120)]; // Borgoña, Azul Marino, Verde Oscuro
            baseTemplateColors.push({ h: ac_hues[0], s: rand(40, 80), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: ac_hues[1], s: rand(40, 80), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: ac_hues[2], s: rand(30, 70), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: rand(30, 50), s: rand(10, 30), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: rand(30, 50), s: rand(20, 40), b: rand(60, 80) }); // <-- CAMBIO
            break;

        case 'southwestern':
            // TEMPLATE 31: Suroeste
            const sws_hues = [rand(15, 35), rand(170, 190), rand(40, 50)]; // Terracota, Turquesa, Arena
            baseTemplateColors.push({ h: sws_hues[0], s: rand(50, 90), b: rand(40, 70) }); // <-- CAMBIO
            baseTemplateColors.push({ h: sws_hues[0], s: rand(40, 80), b: rand(60, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: sws_hues[1], s: rand(60, 90), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: sws_hues[2], s: rand(20, 40), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: sws_hues[2], s: rand(30, 50), b: rand(60, 80) }); // <-- CAMBIO
            break;

        case 'monotone-split':
            // TEMPLATE 32: Monótono Dividido (4+1)
            const msp_hue = baseHue;
            const msp_comp = (baseHue + 180) % 360;
            baseTemplateColors.push({ h: msp_hue, s: rand(10, 30), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: msp_hue, s: rand(30, 60), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: msp_hue, s: rand(50, 80), b: rand(20, 40) }); // <-- CAMBIO
            baseTemplateColors.push({ h: msp_hue, s: rand(5, 20), b: rand(10, 30) });  // <-- CAMBIO
            baseTemplateColors.push({ h: msp_comp, s: rand(80, 100), b: rand(60, 80) }); // <-- CAMBIO
            break;
            
        case 'acentos-dobles-neutros':
            // TEMPLATE 33: Acentos Dobles con Neutros (3 Neutros + 2 Acentos)
            const h_ac1 = shuffledHues[0];
            const h_ac2 = (h_ac1 + 180) % 360; // Complementario
            const h_neu = rand(0, 360); // Matiz aleatorio para los neutros
            baseTemplateColors.push({ h: h_ac1, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_ac2, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_neu, s: rand(0, 10), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_neu, s: rand(0, 10), b: rand(60, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: h_neu, s: rand(0, 10), b: rand(20, 40) }); // <-- CAMBIO
            break;

        case 'gradiente-analogo-vibrante':
            // TEMPLATE 34: Gradiente Análogo Vibrante (Mueve el Hue, S/B altos)
            const gv_analogHue = baseHue;
            const gv_hueStep = rand(15, 30); // Paso de matiz
            const gv_analogS = rand(70, 100); // Perfil vibrante
            const gv_analogB = rand(60, 95);
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: (gv_analogHue + (i * gv_hueStep)) % 360,
                    s: gv_analogS + rand(-5, 5),
                    b: gv_analogB + rand(-10, 10)
                });
            }
            break;

        case 'alto-contraste':
            // TEMPLATE 35: Alto Contraste
            baseTemplateColors.push({ h: shuffledHues[0], s: rand(5, 30), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[1], s: rand(15, 40), b: rand(85, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[2], s: rand(5, 30), b: rand(10, 20) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[3], s: rand(5, 30), b: rand(15, 25) }); // <-- CAMBIO
            baseTemplateColors.push({ h: shuffledHues[4], s: rand(70, 100), b: rand(50, 80) }); // <-- CAMBIO
            break;

        case 'bajo-contraste':
            // TEMPLATE 36: Bajo Contraste (Sutil)
            const lc_hue = baseHue;
            const lc_s = rand(10, 30);
            const lc_b_start = rand(40, 60);
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: (lc_hue + rand(-10, 10)) % 360,
                    s: lc_s + rand(-5, 5),
                    b: lc_b_start + rand(-5, 5) // Rango de Brillo muy estrecho
                });
            }
            break;

        case 'rampa-saturacion':
            // TEMPLATE 37: Rampa de Saturación
            const rs_hue = baseHue;
            const rs_b = rand(60, 80); // Brillo constante
            const s_values = [rand(10, 20), rand(20, 40), rand(40, 60), rand(60, 80), rand(80, 100)];
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rs_hue,
                    s: s_values[i % s_values.length],
                    b: rs_b
                });
            }
            break;

        case 'doble-complementario':
            // TEMPLATE 38: Doble Complementario
            const dc_h1 = baseHue;
            const dc_h2 = (baseHue + 30) % 360; // Análogo
            const dc_h3 = (baseHue + 180) % 360; // Complemento
            const dc_h4 = (baseHue + 210) % 360; // Complemento del Análogo
            baseTemplateColors.push({ h: dc_h1, s: rand(60, 90), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: dc_h2, s: rand(60, 90), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: dc_h3, s: rand(60, 90), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: dc_h4, s: rand(60, 90), b: rand(50, 80) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(5, 15), b: rand(90, 98) }); // <-- CAMBIO
            break;

        case 'dos-matices':
            // TEMPLATE 39: Dos Matices (3+2)
            const tm_h1 = baseHue;
            const tm_h2 = (baseHue + 150) % 360; // Ni análogo ni complemento
            baseTemplateColors.push({ h: tm_h1, s: rand(70, 100), b: rand(70, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tm_h1, s: rand(30, 60), b: rand(80, 95) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tm_h1, s: rand(50, 90), b: rand(30, 50) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tm_h2, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: tm_h2, s: rand(30, 60), b: rand(80, 95) }); // <-- CAMBIO
            break;

        case 'complemento-neutros':
            // TEMPLATE 40: Complemento + Neutros (1+1+3)
            const cn_h1 = baseHue;
            const cn_h2 = (baseHue + 180) % 360;
            baseTemplateColors.push({ h: cn_h1, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: cn_h2, s: rand(70, 100), b: rand(60, 90) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(90, 98) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(50, 70) }); // <-- CAMBIO
            baseTemplateColors.push({ h: baseHue, s: rand(0, 10), b: rand(10, 30) }); // <-- CAMBIO
            break;

        case 'tematico-fuego':
            // TEMPLATE 41: Fuego
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(0, 50), // Rojos/Naranjas/Amarillos
                    s: rand(70, 100), b: rand(60, 100)
                });
            }
            break;
            
        case 'tematico-hielo':
            // TEMPLATE 42: Hielo
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(170, 220), // Cianes/Azules Claros
                    s: rand(5, 30), b: rand(90, 100)
                });
            }
            break;

        case 'tematico-desierto':
            // TEMPLATE 43: Desierto
            const ds_hues = [rand(20, 40), rand(40, 60), rand(190, 210)]; // Naranjas, Arenas, Azul pálido
            for (let i = 0; i < ds_hues.length; i++) {
                baseTemplateColors.push({ 
                    h: ds_hues[i],
                    s: rand(30, 70), b: rand(50, 90)
                });
            }
            break;

        case 'caos':
            // TEMPLATE 44: Aleatorio (Caos)
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: rand(0, 360), s: rand(20, 100), b: rand(20, 100)
                });
            }
            break;

        // --- (INICIO) 20 PLANTILLAS DE MARCAS/MEDIOS ---
        
        case 'brand-google':
            // Hues: Azul, Rojo, Amarillo, Verde, Gris
            const hg = [rand(210, 230), rand(355, 5), rand(45, 55), rand(120, 140), rand(200, 220)];
            const sg = [rand(80, 100), rand(80, 100), rand(90, 100), rand(80, 100), rand(10, 20)];
            const bg = [rand(70, 90), rand(70, 90), rand(80, 100), rand(60, 80), rand(80, 90)];
            for (let i = 0; i < hg.length; i++) {
                baseTemplateColors.push({ h: hg[i], s: sg[i], b: bg[i] }); // <-- CAMBIO
            }
            break;

        case 'brand-microsoft':
            // Hues: Rojo, Verde, Azul, Amarillo, Gris
            const hm = [rand(5, 15), rand(80, 90), rand(195, 205), rand(45, 55), rand(0, 360)];
            const sm = [rand(90, 100), rand(90, 100), rand(90, 100), rand(90, 100), rand(0, 10)];
            const bm = [rand(70, 90), rand(60, 80), rand(80, 100), rand(80, 100), rand(60, 70)];
            for (let i = 0; i < hm.length; i++) {
                baseTemplateColors.push({ h: hm[i], s: sm[i], b: bm[i] }); // <-- CAMBIO
            }
            break;

        case 'brand-spotify':
            // Hues: Verde, Negro, Blanco, Gris, Gris Oscuro
            const hsp = [rand(140, 150), rand(0, 360), rand(0, 360), rand(0, 360), rand(0, 360)];
            const ssp = [rand(80, 100), rand(0, 10), rand(0, 5), rand(0, 10), rand(0, 10)];
            const bsp = [rand(60, 80), rand(10, 20), rand(95, 100), rand(70, 80), rand(30, 40)];
            for (let i = 0; i < hsp.length; i++) {
                baseTemplateColors.push({ h: hsp[i], s: ssp[i], b: bsp[i] }); // <-- CAMBIO
            }
            break;

        case 'brand-ikea':
            // Hues: Azul, Amarillo, Blanco, Negro, Rojo
            const hi = [rand(215, 225), rand(50, 60), rand(0, 360), rand(0, 360), rand(355, 5)];
            const si = [rand(90, 100), rand(90, 100), rand(0, 5), rand(0, 10), rand(90, 100)];
            const bi = [rand(60, 80), rand(80, 100), rand(95, 100), rand(10, 20), rand(70, 90)];
            for (let i = 0; i < hi.length; i++) {
                baseTemplateColors.push({ h: hi[i], s: si[i], b: bi[i] }); // <-- CAMBIO
            }
            break;

        case 'brand-coke':
            // Hues: Rojo, Blanco, Negro, Gris, Plata
            const hc = [rand(355, 5), rand(0, 360), rand(0, 360), rand(0, 360), rand(0, 360)];
            const sc = [rand(90, 100), rand(0, 5), rand(0, 10), rand(0, 5), rand(5, 15)];
            const bc = [rand(70, 90), rand(95, 100), rand(10, 20), rand(80, 90), rand(60, 70)];
            for (let i = 0; i < hc.length; i++) {
                baseTemplateColors.push({ h: hc[i], s: sc[i], b: bc[i] }); // <-- CAMBIO
            }
            break;

        case 'brand-starbucks':
            // Hues: Verde, Blanco, Negro, Gris, Crema
            const hst = [rand(150, 160), rand(0, 360), rand(0, 360), rand(0, 360), rand(40, 50)];
            const sst = [rand(80, 100), rand(0, 5), rand(0, 10), rand(0, 10), rand(10, 20)];
            const bst = [rand(30, 50), rand(95, 100), rand(10, 20), rand(60, 70), rand(90, 95)];
            for (let i = 0; i < hst.length; i++) {
                baseTemplateColors.push({ h: hst[i], s: sst[i], b: bst[i] }); // <-- CAMBIO
            }
            break;

        case 'game-mario':
            // Hues: Rojo, Azul, Amarillo, Verde, Marrón
            const hma = [rand(355, 5), rand(215, 225), rand(50, 60), rand(110, 130), rand(20, 30)];
            const sma = [rand(90, 100), rand(80, 100), rand(90, 100), rand(80, 100), rand(60, 80)];
            const bma = [rand(70, 90), rand(70, 90), rand(80, 100), rand(60, 80), rand(40, 60)];
            for (let i = 0; i < hma.length; i++) {
                baseTemplateColors.push({ h: hma[i], s: sma[i], b: bma[i] }); // <-- CAMBIO
            }
            break;

        case 'game-zelda-botw':
            // Hues: Cian, Crema, Rojo, Verde, Amarillo
            const hz = [rand(185, 195), rand(50, 60), rand(355, 5), rand(130, 140), rand(50, 60)];
            const sz = [rand(60, 80), rand(20, 30), rand(70, 90), rand(40, 60), rand(70, 90)];
            const bz = [rand(60, 80), rand(90, 100), rand(50, 70), rand(40, 60), rand(70, 90)];
            for (let i = 0; i < hz.length; i++) {
                baseTemplateColors.push({ h: hz[i], s: sz[i], b: bz[i] }); // <-- CAMBIO
            }
            break;

        case 'game-cyberpunk':
            // Hues: Amarillo, Cian, Rojo, Púrpura, Negro
            const hcp = [rand(55, 65), rand(180, 190), rand(350, 360), rand(275, 285), rand(0, 360)];
            const scp = [rand(90, 100), rand(90, 100), rand(90, 100), rand(90, 100), rand(0, 10)];
            const bcp = [rand(90, 100), rand(80, 100), rand(80, 100), rand(80, 100), rand(10, 20)];
            for (let i = 0; i < hcp.length; i++) {
                baseTemplateColors.push({ h: hcp[i], s: scp[i], b: bcp[i] }); // <-- CAMBIO
            }
            break;

        case 'game-minecraft':
            // Hues: Marrón, Verde, Azul, Gris, Gris Oscuro
            const hm_mc = [rand(25, 35), rand(85, 95), rand(195, 205), rand(0, 360), rand(0, 360)];
            const sm_mc = [rand(60, 80), rand(50, 70), rand(60, 80), rand(0, 10), rand(0, 10)];
            const bm_mc = [rand(30, 50), rand(40, 60), rand(70, 90), rand(60, 80), rand(20, 30)];
            for (let i = 0; i < hm_mc.length; i++) {
                baseTemplateColors.push({ h: hm_mc[i], s: sm_mc[i], b: bm_mc[i] }); // <-- CAMBIO
            }
            break;

        case 'game-portal':
            // Hues: Azul, Naranja, Blanco, Gris Oscuro, Gris Claro
            const hp = [rand(190, 200), rand(25, 35), rand(0, 360), rand(0, 360), rand(0, 360)];
            const sp = [rand(90, 100), rand(90, 100), rand(0, 5), rand(0, 10), rand(0, 5)];
            const bp = [rand(80, 100), rand(80, 100), rand(95, 100), rand(20, 30), rand(70, 80)];
            for (let i = 0; i < hp.length; i++) {
                baseTemplateColors.push({ h: hp[i], s: sp[i], b: bp[i] }); // <-- CAMBIO
            }
            break;

        case 'game-witcher':
            // Hues: Rojo, Gris Oscuro, Crema, Marrón, Blanco
            const hw = [rand(355, 5), rand(20, 40), rand(40, 50), rand(25, 35), rand(40, 50)];
            const sw = [rand(70, 90), rand(10, 20), rand(20, 30), rand(30, 50), rand(5, 15)];
            const bw = [rand(30, 50), rand(15, 25), rand(80, 90), rand(40, 60), rand(90, 100)];
            for (let i = 0; i < hw.length; i++) {
                baseTemplateColors.push({ h: hw[i], s: sw[i], b: bw[i] }); // <-- CAMBIO
            }
            break;

        case 'game-animalcrossing':
            // Hues: Verde, Amarillo, Azul, Naranja, Marrón
            const hac = [rand(85, 95), rand(50, 60), rand(185, 195), rand(25, 35), rand(25, 35)];
            const sac = [rand(50, 70), rand(80, 100), rand(60, 80), rand(80, 100), rand(40, 60)];
            const bac = [rand(60, 80), rand(90, 100), rand(80, 100), rand(80, 100), rand(50, 70)];
            for (let i = 0; i < hac.length; i++) {
                baseTemplateColors.push({ h: hac[i], s: sac[i], b: bac[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-dune':
            // Hues: Naranja, Arena, Negro, Marrón, Piedra
            const hd = [rand(20, 30), rand(35, 45), rand(0, 360), rand(20, 30), rand(25, 35)];
            const sd = [rand(70, 90), rand(30, 50), rand(0, 10), rand(40, 60), rand(10, 20)];
            const bd = [rand(60, 80), rand(80, 95), rand(10, 20), rand(30, 50), rand(60, 70)];
            for (let i = 0; i < hd.length; i++) {
                baseTemplateColors.push({ h: hd[i], s: sd[i], b: bd[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-barbie':
            // Hues: Rosa Fuerte, Rosa Claro, Azul, Amarillo, Blanco
            const hb = [rand(315, 325), rand(325, 335), rand(185, 195), rand(50, 60), rand(0, 360)];
            const sb = [rand(90, 100), rand(30, 50), rand(80, 100), rand(90, 100), rand(0, 5)];
            const bb = [rand(80, 100), rand(90, 100), rand(70, 90), rand(80, 100), rand(95, 100)];
            for (let i = 0; i < hb.length; i++) {
                baseTemplateColors.push({ h: hb[i], s: sb[i], b: bb[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-oppenheimer':
            // Hues: Naranja, Negro, Crema, Marrón, Gris
            const ho = [rand(25, 35), rand(0, 360), rand(40, 50), rand(15, 25), rand(0, 360)];
            const so = [rand(90, 100), rand(0, 10), rand(20, 30), rand(50, 70), rand(0, 10)];
            const bo = [rand(80, 100), rand(10, 20), rand(90, 95), rand(20, 40), rand(60, 70)];
            for (let i = 0; i < ho.length; i++) {
                baseTemplateColors.push({ h: ho[i], s: so[i], b: bo[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-matrix':
            // Hues: Verde, Verde Oscuro, Negro, Gris1, Gris2
            const hmx = [rand(115, 125), rand(115, 125), rand(0, 360), rand(0, 360), rand(0, 360)];
            const smx = [rand(90, 100), rand(70, 90), rand(0, 5), rand(0, 5), rand(0, 5)];
            const bmx = [rand(80, 100), rand(20, 40), rand(5, 10), rand(10, 20), rand(30, 40)];
            for (let i = 0; i < hmx.length; i++) {
                baseTemplateColors.push({ h: hmx[i], s: smx[i], b: bmx[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-interstellar':
            // Hues: Azul Oscuro, Blanco, Amarillo, Gris, Gris Claro
            const hin = [rand(205, 215), rand(35, 45), rand(45, 55), rand(0, 360), rand(0, 360)];
            const sin = [rand(70, 90), rand(10, 20), rand(90, 100), rand(0, 10), rand(0, 10)];
            const bin = [rand(10, 20), rand(90, 100), rand(80, 100), rand(30, 40), rand(60, 70)];
            for (let i = 0; i < hin.length; i++) {
                baseTemplateColors.push({ h: hin[i], s: sin[i], b: bin[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-spiritedaway':
            // Hues: Rojo, Crema, Teal, Púrpura, Durazno
            const hsa = [rand(350, 360), rand(40, 50), rand(175, 185), rand(275, 285), rand(25, 35)];
            const ssa = [rand(70, 90), rand(30, 50), rand(50, 70), rand(50, 70), rand(70, 90)];
            const bsa = [rand(60, 80), rand(90, 100), rand(50, 70), rand(20, 40), rand(80, 95)];
            for (let i = 0; i < hsa.length; i++) {
                baseTemplateColors.push({ h: hsa[i], s: ssa[i], b: bsa[i] }); // <-- CAMBIO
            }
            break;

        case 'movie-spiderverse':
            // Hues: Rojo, Azul, Amarillo, Púrpura, Negro
            const hsv = [rand(355, 5), rand(200, 210), rand(50, 60), rand(285, 295), rand(0, 360)];
            const ssv = [rand(90, 100), rand(90, 100), rand(90, 100), rand(90, 100), rand(0, 10)];
            const bsv = [rand(80, 100), rand(70, 90), rand(80, 100), rand(60, 80), rand(10, 20)];
            for (let i = 0; i < hsv.length; i++) {
                baseTemplateColors.push({ h: hsv[i], s: ssv[i], b: bsv[i] }); // <-- CAMBIO
            }
            break;
            
        case 'theme-autumn': // Otoño
            const ha = [rand(15, 30), rand(35, 45), rand(0, 10), rand(20, 35), rand(50, 60)];
            const sa = [rand(60, 90), rand(70, 100), rand(80, 100), rand(50, 70), rand(60, 80)];
            const ba = [rand(40, 70), rand(50, 80), rand(60, 80), rand(30, 50), rand(70, 90)];
            for (let i = 0; i < ha.length; i++) {
                baseTemplateColors.push({ h: ha[i], s: sa[i], b: ba[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-spring': // Primavera
            const hsp_ = [rand(90, 120), rand(330, 350), rand(50, 60), rand(190, 210), rand(40, 50)];
            const ssp_ = [rand(40, 60), rand(40, 60), rand(50, 70), rand(30, 50), rand(20, 40)];
            const bsp_ = [rand(85, 95), rand(90, 100), rand(90, 100), rand(90, 100), rand(95, 100)];
            for (let i = 0; i < hsp_.length; i++) {
                baseTemplateColors.push({ h: hsp_[i], s: ssp_[i], b: bsp_[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-winter': // Invierno
            const hwi = [rand(180, 220), rand(190, 230), rand(0, 360), rand(0, 360), rand(200, 240)];
            const swi = [rand(5, 15), rand(10, 20), rand(0, 5), rand(0, 5), rand(20, 40)];
            const bwi = [rand(80, 100), rand(60, 80), rand(95, 100), rand(70, 85), rand(40, 60)];
            for (let i = 0; i < hwi.length; i++) {
                baseTemplateColors.push({ h: hwi[i], s: swi[i], b: bwi[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-nebula': // Nebulosa
            const hn = [rand(240, 270), rand(270, 300), rand(300, 330), rand(0, 360), rand(190, 220)];
            const sn = [rand(70, 100), rand(80, 100), rand(60, 90), rand(0, 10), rand(30, 60)];
            const bn = [rand(20, 40), rand(30, 50), rand(70, 90), rand(10, 20), rand(80, 100)];
            for (let i = 0; i < hn.length; i++) {
                baseTemplateColors.push({ h: hn[i], s: sn[i], b: bn[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-coastal': // Costero
            const hco = [rand(40, 50), rand(190, 210), rand(0, 360), rand(0, 10), rand(190, 210)];
            const sco = [rand(15, 30), rand(30, 50), rand(0, 5), rand(70, 90), rand(20, 40)];
            const bco = [rand(85, 95), rand(70, 90), rand(95, 100), rand(70, 80), rand(85, 95)];
            for (let i = 0; i < hco.length; i++) {
                baseTemplateColors.push({ h: hco[i], s: sco[i], b: bco[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-jungle': // Jungla
            const hj = [rand(90, 140), rand(100, 150), rand(20, 35), rand(45, 55), rand(350, 5)];
            const sj = [rand(60, 90), rand(50, 80), rand(50, 70), rand(100, 100), rand(100, 100)];
            const bj = [rand(30, 60), rand(20, 40), rand(30, 50), rand(80, 90), rand(70, 80)];
            for (let i = 0; i < hj.length; i++) {
                baseTemplateColors.push({ h: hj[i], s: sj[i], b: bj[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-gothic': // Gótico
            const hg_ = [rand(0, 360), rand(270, 290), rand(355, 5), rand(0, 360), rand(260, 280)];
            const sg_ = [rand(0, 5), rand(50, 70), rand(80, 100), rand(0, 5), rand(30, 50)];
            const bg_ = [rand(10, 15), rand(20, 30), rand(40, 60), rand(50, 60), rand(15, 25)];
            for (let i = 0; i < hg_.length; i++) {
                baseTemplateColors.push({ h: hg_[i], s: sg_[i], b: bg_[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-vaporwave':
            const hv = [rand(300, 330), rand(170, 190), rand(260, 280), rand(40, 60), rand(0, 360)];
            const sv = [rand(70, 100), rand(70, 100), rand(60, 90), rand(80, 100), rand(0, 5)];
            const bv = [rand(80, 100), rand(80, 100), rand(70, 90), rand(80, 100), rand(10, 20)];
            for (let i = 0; i < hv.length; i++) {
                baseTemplateColors.push({ h: hv[i], s: sv[i], b: bv[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-cyber-noir':
            const hcn = [rand(180, 220), rand(190, 230), rand(0, 360), rand(330, 350), rand(50, 60)];
            const scn = [rand(30, 50), rand(40, 60), rand(0, 10), rand(100, 100), rand(100, 100)];
            const bcn = [rand(10, 30), rand(20, 40), rand(10, 20), rand(80, 90), rand(80, 90)];
            for (let i = 0; i < hcn.length; i++) {
                baseTemplateColors.push({ h: hcn[i], s: scn[i], b: bcn[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-artdeco':
            const had = [rand(40, 50), rand(0, 360), rand(160, 180), rand(0, 360), rand(200, 220)];
            const sad = [rand(70, 90), rand(0, 5), rand(60, 80), rand(0, 5), rand(50, 70)];
            const bad = [rand(70, 90), rand(10, 15), rand(20, 40), rand(95, 100), rand(30, 50)];
            for (let i = 0; i < had.length; i++) {
                baseTemplateColors.push({ h: had[i], s: sad[i], b: bad[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-bauhaus':
            const hba = [rand(355, 5), rand(50, 60), rand(230, 250), rand(0, 360), rand(0, 360)];
            const sba = [rand(90, 100), rand(90, 100), rand(90, 100), rand(0, 5), rand(0, 10)];
            const bba = [rand(70, 90), rand(80, 100), rand(70, 90), rand(95, 100), rand(10, 20)];
            for (let i = 0; i < hba.length; i++) {
                baseTemplateColors.push({ h: hba[i], s: sba[i], b: bba[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-impressionism': // Impresionismo
            const him = [rand(180, 250), rand(40, 70), rand(300, 320), rand(100, 130), rand(50, 70)];
            const sim = [rand(30, 60), rand(40, 70), rand(20, 40), rand(30, 50), rand(10, 30)];
            const bim = [rand(80, 100), rand(90, 100), rand(90, 100), rand(85, 95), rand(95, 100)];
            for (let i = 0; i < him.length; i++) {
                baseTemplateColors.push({ h: him[i], s: sim[i], b: bim[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-gourmet': // Gourmet
            const hg_o = [rand(15, 30), rand(30, 40), rand(350, 5), rand(20, 35), rand(35, 45)];
            const sg_o = [rand(40, 70), rand(10, 20), rand(60, 80), rand(60, 80), rand(20, 40)];
            const bg_o = [rand(20, 40), rand(90, 95), rand(30, 50), rand(50, 70), rand(80, 90)];
            for (let i = 0; i < hg_o.length; i++) {
                baseTemplateColors.push({ h: hg_o[i], s: sg_o[i], b: bg_o[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-tropical': // Tropical
            const ht = [rand(170, 190), rand(30, 45), rand(340, 360), rand(130, 150), rand(50, 60)];
            const st = [rand(80, 100), rand(90, 100), rand(80, 100), rand(60, 80), rand(90, 100)];
            const bt = [rand(70, 90), rand(80, 100), rand(70, 90), rand(60, 80), rand(80, 100)];
            for (let i = 0; i < ht.length; i++) {
                baseTemplateColors.push({ h: ht[i], s: st[i], b: bt[i] }); // <-- CAMBIO
            }
            break;

        case 'theme-savanna': // Savanna
            const hsa_ = [rand(35, 45), rand(20, 35), rand(40, 50), rand(190, 210), rand(15, 25)];
            const ssa_ = [rand(60, 90), rand(40, 70), rand(20, 40), rand(20, 40), rand(30, 50)];
            const bsa_ = [rand(70, 90), rand(50, 70), rand(85, 95), rand(80, 95), rand(30, 50)];
            for (let i = 0; i < hsa_.length; i++) {
                baseTemplateColors.push({ h: hsa_[i], s: ssa_[i], b: bsa_[i] }); // <-- CAMBIO
            }
            break;

        // --- (FIN) 15 NUEVAS PLANTILLAS TEMÁTICAS ---
            
        case 'tematico-desierto':
            // TEMPLATE 43: Desierto
            const Desierto = [rand(20, 40), rand(40, 60), rand(190, 210)]; // Naranjas, Arenas, Azul pálido
            for (let i = 0; i < ds_hues.length; i++) {
                baseTemplateColors.push({ 
                    h: ds_hues[i],
                    s: rand(30, 70), b: rand(50, 90)
                });
            }
            break;

        case 'themed-sweets':
            // TEMPLATE 29: Pastelería
            const Pastelería = [rand(300, 350), rand(190, 220), rand(50, 60)]; // Rosa, Azul claro, Crema
            for (let i = 0; i < sw_hues.length; i++) {
                baseTemplateColors.push({ 
                    h: sw_hues[i],
                    s: rand(20, 50), b: rand(80, 95)
                });
            }
            break;

        case 'monocromatico':
            // TEMPLATE (fallback para 'mono' si no fue 'gradiente-mono')
            const monoHue_fallback = baseHue;
            const s_fallback = [rand(5, 20), rand(20, 40), rand(40, 60), rand(60, 80), rand(80, 100)].sort(() => 0.5 - Math.random());
            const b_fallback = [rand(15, 30), rand(30, 50), rand(50, 70), rand(70, 90), rand(90, 95)].sort(() => 0.5 - Math.random());
            for (let i = 0; i < 5; i++) { // <-- ¡¡¡LA MEJORA!!! (era effectiveCount)
                baseTemplateColors.push({ 
                    h: monoHue_fallback,
                    s: s_fallback[i % s_fallback.length],
                    b: b_fallback[i % b_fallback.length]
                });
            }
            break;

        case 'equilibrado':
        default:
            // TEMPLATE 1: Equilibrado (1 Dark, 1 Light, 3 Core)
            baseTemplateColors.push({ 
                h: shuffledHues[0], s: rand(10, 40), b: rand(15, 35)
            });
            baseTemplateColors.push({ 
                h: shuffledHues[1], s: rand(5, 30), b: rand(90, 100)
            });
            baseTemplateColors.push({ 
                h: shuffledHues[2], s: rand(70, 100), b: rand(60, 90)
            });
            baseTemplateColors.push({ 
                h: shuffledHues[3], s: rand(60, 95), b: rand(30, 60)
            });
            baseTemplateColors.push({ 
                h: shuffledHues[4], s: rand(30, 60), b: rand(50, 80)
            });
            break;
    }

    // Rellenar si se piden más de 5 colores
    // ¡CORRECCIÓN! En lugar de añadir colores 100% aleatorios,
    // tomamos los colores base que ya generó la plantilla
    // y creamos variaciones de ellos.
    
    // const baseTemplateColors = [...generatedHsbPalette]; // <-- ¡ELIMINADO!
    const baseTemplateLength = baseTemplateColors.length;

    if (baseTemplateLength === 0) {
        // Fallback de seguridad si una plantilla falla en generar seeds
        console.error(`La plantilla "${selectedTemplate}" no generó colores base.`);
        baseTemplateColors.push({ h: rand(0, 360), s: rand(40, 80), b: rand(40, 80) });
    }

    // --- ¡¡¡LA NUEVA LÓGICA!!! ---
    // Rellena la paleta final con variaciones aleatorias de las semillas
    while (generatedHsbPalette.length < effectiveCount) {
        // Elige un color base aleatorio de la plantilla (ej: 1 de los 5)
        const baseColorToVary = baseTemplateColors[Math.floor(Math.random() * baseTemplateLength)];
        
        // Crea una variación
        generatedHsbPalette.push({
            h: (baseColorToVary.h + rand(-5, 5) + 360) % 360, // Ligera variación de matiz
            s: Math.max(10, Math.min(100, baseColorToVary.s + rand(-10, 10))), // Ligera variación de S
            b: Math.max(10, Math.min(100, baseColorToVary.b + rand(-10, 10)))  // Ligera variación de B
        });
    }
    // Truncar si es necesario (esto no debería pasar con nuestra lógica)
    // generatedHsbPalette = generatedHsbPalette.slice(0, effectiveCount);


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
            let replacement = generatedHsbPalette[generatedColorsUsed % generatedHsbPalette.length];
            generatedColorsUsed++;
            return replacement;
        });
        
    } else {
        // --- PASO 4: Ordenar (¡NUEVA LÓGICA!) ---
        // ¡Tu idea! En lugar de barajar, ordenamos los colores
        // para que sean atractivos a la vista.

        const noSortTemplates = [
            'gradiente-mono', 
            'grayscale', 
            'rampa-saturacion',
            // Plantillas con un orden estructural específico
            'high-key', 
            'low-key', 
            'neutral-accent',
            'acentos-dobles-neutros',
            'complemento-neutros',
            'monotone-split',
            'primary',
            'secondary',
            'bauhaus',
            'artdeco',
            'theme-artdeco' // Añadido por si acaso
        ];

        // Comprobar si es una plantilla de marca/medio
        const isBranded = selectedTemplate.startsWith('brand-') || selectedTemplate.startsWith('game-') || selectedTemplate.startsWith('movie-');
        // Comprobar si es un gradiente analogo
        const isAnalogGradient = selectedTemplate.includes('gradiente-analogo');

        if (noSortTemplates.includes(selectedTemplate) || isBranded) {
            // No hacer nada. Mantener el orden icónico o estructural
            // de la plantilla tal como fue definida.
            // ¡PERO SÍ BARAJAR!
            finalHsbPalette.sort(() => 0.5 - Math.random());
        } else if (isAnalogGradient) {
            // Los gradientes análogos se ven mejor ordenados por matiz (hue)
            finalHsbPalette.sort((a, b) => a.h - b.h);
        } else {
            // Para TODAS las demás, ordenar por brillo (b)
            // Esto crea una rampa de oscuro a claro, que es muy atractiva.
            finalHsbPalette.sort((a, b) => a.b - b.b);
        }
    }

    // Convertir a HEX
    const finalPalette = finalHsbPalette.map(c => {
      if (c && typeof c.h === 'number') {
        return hsbToHex(c.h, c.s, c.b); // <-- ¡¡¡LA CORRECCIÓN!!! (era c.h)
      }
      return tinycolor.random().toHexString(); // Fallback
    });

    // Determinar el color de marca
    const brandColor = baseColorHex 
        ? baseColorHex 
        : (selectedTemplate === 'equilibrado' ? hsbToHex(generatedHsbPalette[2].h, generatedHsbPalette[2].s, generatedHsbPalette[2].b) : finalPalette[0]);

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


// --- (INICIO) FORMATO DE CÓDIGO ---

// Configuración de estilos de fuente (sin cambios)
const displayStylesConfig = {
  'Título Grande': { fontSize: '2rem', fontWeight: '700' },
  'Título Mediano': { fontSize: '1.75rem', fontWeight: '700' },
  'Título Pequeño': { fontSize: '1.5rem', fontWeight: '700' },
  'Cuerpo Grande Negrita': { fontSize: '1.125rem', fontWeight: '700' },
  'Cuerpo Grande': { fontSize: '1.125rem', fontWeight: '400' },
  'Cuerpo Mediano Negrita': { fontSize: '1rem', fontWeight: '700' },
  'Cuerpo Mediano': { fontSize: '1rem', fontWeight: '400' },
  'Cuerpo Pequeño': { fontSize: '0.875rem', fontWeight: '400' },
  'Subtítulo': { fontSize: '0.75rem', fontWeight: '400' },
};

// Función interna para generar las paletas semánticas para un tema específico (claro u oscuro).
// (Sin cambios)
const generateSemanticPalettesForTheme = (theme, brandShades, grayShades, grayColor) => {
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
    return stylePalette;
};


export const generatePowerFxCode = (themeData, separator, useQuotes) => {
  if (!themeData || !themeData.brandShades) return "// Generando código...";

  const { brandShades, grayShades, grayColor, font = "Segoe UI", explorerPalette } = themeData;

  const formatKey = (key) => {
    if (useQuotes) return `"${key}"`;
    return key.replace(/ /g, '');
  };

  const formatShades = (shades) => {
    return shades.map((s, i) => `    ${formatKey(`t${i * 50}`)}: ColorValue("${s.toUpperCase()}")`).join(`${separator}\n`);
  };

  const formatPalette = (palette) => {
    return (palette || []).map(item => `    ${formatKey(item.name)}: ColorValue("${item.color.toUpperCase()}")`).join(`${separator}\n`);
  };

  const formatExplorerPalette = (palette) => {
      return (palette || []).map((color, index) => `    ${formatKey(`Color${index + 1}`)}: ColorValue("${color.toUpperCase()}")`).join(`${separator}\n`);
  };

  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    ${formatKey(name)}: { Font: Font.'${font.split(',')[0].replace(/"/g, '')}'${separator} Size: ${Math.round(parseFloat(styles.fontSize) * 10)}${separator} Bold: ${styles.fontWeight === '700'} }`)
    .join(`${separator}\n`);

  const lightPalettes = generateSemanticPalettesForTheme('light', brandShades, grayShades, grayColor);
  const darkPalettes = generateSemanticPalettesForTheme('dark', brandShades, grayShades, grayColor);

  const createThemeRecord = (themeName, palettes) => {
    return `{
    // --- Tema ${themeName} ---
    Marca: {
${formatShades(brandShades)}
    }${separator}
    Gris: {
${formatShades(grayShades)}
    }${separator}
    ModoColor: {
${formatExplorerPalette(explorerPalette)}
    }${separator}
    Fondos: {
${formatPalette(palettes.fullBackgroundColors)}
    }${separator}
    Textos: {
${formatPalette(palettes.fullForegroundColors)}
    }${separator}
    Bordes: {
${formatPalette(palettes.fullBorderColors)}
    }${separator}
    Acciones: {
${formatPalette(palettes.fullActionColors)}
    }${separator}
    Decorativos: {
${formatPalette(palettes.decorateColors)}
    }
}`;
  };

  const lightThemeRecord = createThemeRecord('Claro', lightPalettes);
  const darkThemeRecord = createThemeRecord('Oscuro', darkPalettes);

  return `// --- GUÍA RÁPIDA PARA POWER APPS ---
// 1. Pega este código en la propiedad 'OnStart' de tu App.
// 2. Para cambiar de tema, usa una variable: Set(gblIsDarkMode, Self.Value)
// 3. Para USAR un color: LookUp(colDesignSystem, Tema = If(gblIsDarkMode, "Oscuro", "Claro")).Colores.Acciones.Primario
// 4. Para USAR una fuente: First(colFonts).Fuentes.CuerpoMediano.Font

ClearCollect(
    colDesignSystem${separator}
    {
        Tema: "Claro"${separator}
        Colores: ${lightThemeRecord}
    }${separator}
    {
        Tema: "Oscuro"${separator}
        Colores: ${darkThemeRecord}
    }
)${separator}

ClearCollect(
    colFonts${separator}
    {
        Fuentes: {
${fontStylesRecord}
        }
    }
)${separator}`;
};


export const generateCssCode = (themeData) => {
  if (!themeData || !themeData.stylePalette) return "/* Generando CSS... */";
  const { brandShades, grayShades, stylePalette, theme } = themeData;

  const formatShades = (shades, prefix) => 
    shades.map((s, i) => `    --${prefix}-t${i * 50}: ${s.toUpperCase()};`).join('\n');
  
  const formatPalette = (palette, prefix) =>
    (palette || []).map(item => `    --${prefix}-${item.name.toLowerCase().replace(/ /g, '-')}: ${item.color.toUpperCase()};`).join('\n');

  return `
/* --- TEMA DE DISEÑO GENERADO --- */
/* Modo: ${theme === 'light' ? 'Claro' : 'Oscuro'} */

:root {
    /* --- Colores de Marca --- */
${formatShades(brandShades, 'brand')}

    /* --- Escala de Grises --- */
${formatShades(grayShades, 'gray')}

    /* --- Fondos --- */
${formatPalette(stylePalette.fullBackgroundColors, 'bg')}

    /* --- Textos --- */
${formatPalette(stylePalette.fullForegroundColors, 'text')}

    /* --- Bordes --- */
${formatPalette(stylePalette.fullBorderColors, 'border')}

    /* --- Acciones --- */
${formatPalette(stylePalette.fullActionColors, 'action')}

    /* --- Decorativos --- */
${formatPalette(stylePalette.decorateColors, 'deco')}
}`;
};

export const generateTailwindCode = (themeData) => {
    if (!themeData || !themeData.brandShades) return "// Generando Tailwind Config...";
    const { brandShades, grayShades } = themeData;
    const formatShades = (shades) => {
        let shadeObject = '';
        shades.forEach((s, i) => {
            shadeObject += `          '${i * 50}': '${s.toUpperCase()}',\n`;
        });
        return shadeObject.slice(0, -1);
    };

    return `
// In your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
${formatShades(brandShades)}
        },
        gray: {
${formatShades(grayShades)}
        }
      }
    }
  }
};`;
};

// --- NUEVA FUNCIÓN ---
// Genera un objeto JSON limpio para exportar.
export const generateJsonCode = (themeData) => {
    if (!themeData) return "{}";

    const { brandShades, grayShades, grayColor, font, theme, explorerPalette } = themeData;

    // Función auxiliar para convertir array de sombras a objeto
    const formatShadesForJson = (shades) => {
        const shadeObj = {};
        shades.forEach((s, i) => {
            shadeObj[`t${i * 50}`] = s.toUpperCase();
        });
        return shadeObj;
    };
    
    // Función auxiliar para convertir paleta semántica a objeto
    const formatPaletteForJson = (palette) => {
        const paletteObj = {};
        (palette || []).forEach(item => {
            paletteObj[item.name.toLowerCase().replace(/ /g, '-')] = item.color.toUpperCase();
        });
        return paletteObj;
    };

    const lightPalettes = generateSemanticPalettesForTheme('light', brandShades, grayShades, grayColor);
    const darkPalettes = generateSemanticPalettesForTheme('dark', brandShades, grayShades, grayColor);

    const exportData = {
        meta: {
            themeActual: theme,
            font: font,
            brandColor: themeData.brandColor,
            grayColor: themeData.grayColor,
            isGrayAuto: themeData.isGrayAuto,
        },
        palettes: {
            brand: formatShadesForJson(brandShades),
            gray: formatShadesForJson(grayShades),
            explorer: explorerPalette.map(c => c.toUpperCase()),
        },
        themes: {
            light: {
                backgrounds: formatPaletteForJson(lightPalettes.fullBackgroundColors),
                foregrounds: formatPaletteForJson(lightPalettes.fullForegroundColors),
                borders: formatPaletteForJson(lightPalettes.fullBorderColors),
                actions: formatPaletteForJson(lightPalettes.fullActionColors),
                decorative: formatPaletteForJson(lightPalettes.decorateColors),
            },
            dark: {
                backgrounds: formatPaletteForJson(darkPalettes.fullBackgroundColors),
                foregrounds: formatPaletteForJson(darkPalettes.fullForegroundColors),
                borders: formatPaletteForJson(darkPalettes.fullBorderColors),
                actions: formatPaletteForJson(darkPalettes.fullActionColors),
                decorative: formatPaletteForJson(darkPalettes.decorateColors),
            }
        }
    };

    return JSON.stringify(exportData, null, 2);
};

// --- NUEVA FUNCIÓN ---
// Genera variables SCSS (Sass).
export const generateScssCode = (themeData) => {
  if (!themeData || !themeData.stylePalette) return "/* Generando SCSS... */";
  const { brandShades, grayShades, stylePalette, theme } = themeData;

  // Modificamos las funciones de formato para SCSS
  const formatShades = (shades, prefix) => 
    shades.map((s, i) => `$${prefix}-t${i * 50}: ${s.toUpperCase()};`).join('\n');
  
  const formatPalette = (palette, prefix) =>
    (palette || []).map(item => `$${prefix}-${item.name.toLowerCase().replace(/ /g, '-')}: ${item.color.toUpperCase()};`).join('\n');

  // El tema actual (light/dark) se usa para generar las paletas semánticas
  const semanticPrefix = theme === 'light' ? 'light' : 'dark';
  
  return `
// --- TEMA DE DISEÑO GENERADO ---
// Modo: ${theme === 'light' ? 'Claro' : 'Oscuro'}

// --- Colores de Marca ---
${formatShades(brandShades, 'brand')}

// --- Escala de Grises ---
${formatShades(grayShades, 'gray')}

// --- Paletas Semánticas (basadas en el modo '${semanticPrefix}') ---
// --- Fondos ---
${formatPalette(stylePalette.fullBackgroundColors, 'bg')}

// --- Textos ---
${formatPalette(stylePalette.fullForegroundColors, 'text')}

// --- Bordes ---
${formatPalette(stylePalette.fullBorderColors, 'border')}

// --- Acciones ---
${formatPalette(stylePalette.fullActionColors, 'action')}

// --- Decorativos ---
${formatPalette(stylePalette.decorateColors, 'deco')}
`;
};