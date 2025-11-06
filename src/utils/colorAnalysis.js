import tinycolor from 'tinycolor2';

/**
 * Analiza un color HEX y devuelve sus etiquetas de color primario.
 * @param {string} hex - El color en formato HEX.
 * @returns {string[]} Un array de nombres de colores (ej: ['red', 'pink'])
 */
function getPrimaryColorTags(hex) {
    const hsl = tinycolor(hex).toHsl();
    const h = hsl.h;
    const l = hsl.l;
    const s = hsl.s;
    const tags = new Set();

    // Casos especiales (grises, blanco, negro)
    if (l < 0.15) tags.add('black');
    if (l > 0.95) tags.add('white');
    if (s < 0.1) tags.add('gray');

    // Casos de color basados en el Matiz (Hue)
    if (h >= 345 || h < 15) tags.add('red');
    if (h >= 15 && h < 45) tags.add('orange');
    if (h >= 45 && h < 70) tags.add('yellow');
    if (h >= 70 && h < 160) tags.add('green');
    if (h >= 160 && h < 260) tags.add('blue');
    if (h >= 260 && h < 300) tags.add('purple');
    if (h >= 300 && h < 345) tags.add('pink');

    // Añadir marrón si es naranja/rojo oscuro y desaturado
    if ((h >= 15 && h < 45) || h >= 345 || h < 15) {
        if (l < 0.5 && s < 0.6) {
            tags.add('brown');
        }
    }

    return Array.from(tags);
}

/**
 * Analiza un color HEX y devuelve sus etiquetas de estilo.
 * @param {string} hex - El color en formato HEX.
 * @returns {string[]} Un array de etiquetas de estilo (ej: ['warm', 'bright'])
 */
function getStyleTags(hex) {
    const hsl = tinycolor(hex).toHsl();
    const hsv = tinycolor(hex).toHsv();
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;
    const v = hsv.v;
    const tags = new Set();

    // 1. Temperatura: Cálido vs Frío
    if ((h >= 0 && h <= 60) || (h >= 270 && h <= 360)) {
        tags.add('warm');
    } else if (h > 60 && h < 270) {
        tags.add('cold');
    }

    // 2. Brillo y Saturación
    if (l > 0.75 && s < 0.4) tags.add('pastel');
    if (l < 0.3) tags.add('dark');
    if (v > 0.8 && s > 0.7) tags.add('bright');
    if (s < 0.3 || l < 0.3 || l > 0.9) tags.add('muted');
    if (s > 0.6 && l > 0.4 && l < 0.7) tags.add('vibrant');
    if (l < 0.6 && s < 0.4 && s > 0.1) tags.add('vintage');
    
    return Array.from(tags);
}

/**
 * Analiza una paleta completa (array de HEX) y devuelve las etiquetas agregadas.
 * @param {string[]} palette - Array de colores HEX.
 * @returns {{main_colors: string[], style_tags: string[]}}
 */
export function analyzePaletteColors(palette) {
    if (!palette || palette.length === 0) {
        return { main_colors: [], style_tags: [] };
    }

    const allColorTags = new Set();
    const allStyleTags = new Set();
    let totalLightness = 0;
    const hueHistogram = {};

    palette.forEach(hex => {
        const hsl = tinycolor(hex).toHsl();
        totalLightness += hsl.l;
        
        const hueBucket = Math.round(hsl.h / 10) * 10;
        hueHistogram[hueBucket] = (hueHistogram[hueBucket] || 0) + 1;
        
        getPrimaryColorTags(hex).forEach(tag => allColorTags.add(tag));
        getStyleTags(hex).forEach(tag => allStyleTags.add(tag));
    });

    const avgLightness = totalLightness / palette.length;
    
    if (avgLightness > 0.7) allStyleTags.add('light');
    if (avgLightness < 0.3) allStyleTags.add('dark');

    // Comprobar si es monocromática
    if (Object.keys(hueHistogram).length <= 2) {
        allStyleTags.add('monochromatic');
    }

    // Comprobar si es gradiente (si los matices son muy cercanos)
    const hues = Object.keys(hueHistogram).map(Number).sort((a,b) => a - b);
    if (hues.length > 2) {
        const hueRange = hues[hues.length - 1] - hues[0];
        // Manejar el "cruce" del 0/360
        const wrapAroundRange = (360 - hues[hues.length - 1]) + hues[0];
        if (hueRange < 60 || wrapAroundRange < 60) {
            allStyleTags.add('gradient');
        }
    }

    return {
        main_colors: Array.from(allColorTags),
        style_tags: Array.from(allStyleTags)
    };
}