import tinycolor from 'tinycolor2';

/**
 * Encuentra la coordenada (x, y) en el canvas del primer píxel que coincida
 * o sea muy similar al color objetivo.
 * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
 * @param {string} targetHex - El color hexadecimal a buscar.
 * @returns {{x: number, y: number}|null} - Las coordenadas o null si no se encuentra.
 */
export const findColorInCanvas = (ctx, targetHex) => {
    const targetRgb = tinycolor(targetHex).toRgb();
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const pixels = imageData.data;
    let bestMatch = { x: 0, y: 0, distance: Infinity };

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 255) continue;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        const distance = Math.sqrt(
            Math.pow(r - targetRgb.r, 2) +
            Math.pow(g - targetRgb.g, 2) +
            Math.pow(b - targetRgb.b, 2)
        );

        if (distance < 5) {
            const x = (i / 4) % ctx.canvas.width;
            const y = Math.floor((i / 4) / ctx.canvas.width);
            return { x, y };
        }

        if (distance < bestMatch.distance) {
            bestMatch.distance = distance;
            bestMatch.x = (i / 4) % ctx.canvas.width;
            bestMatch.y = Math.floor((i / 4) / ctx.canvas.width);
        }
    }

    if (bestMatch.distance < Infinity) {
        return { x: bestMatch.x, y: bestMatch.y };
    }

    return null;
};

// **FIX**: Algoritmo de extracción de color completamente reconstruido para mayor precisión y fiabilidad.
export const extractColorsFromImage = (imageUrl, colorCount = 8) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const aspectRatio = img.width / img.height;
            const canvasWidth = 100;
            const canvasHeight = canvasWidth / aspectRatio;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                const colorMap = {};

                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] < 250) continue; 
                    
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    const color = tinycolor({ r, g, b });
                    const hsv = color.toHsv();
                    
                    if (hsv.v < 0.25 || (hsv.v > 0.95 && hsv.s < 0.05) || hsv.s < 0.15) {
                        continue;
                    }
                    
                    // Agrupar colores por rangos para simplificar
                    const key = [r, g, b].map(c => Math.round(c / 20) * 20).join(',');
                    colorMap[key] = (colorMap[key] || 0) + 1;
                }

                const sortedColors = Object.keys(colorMap)
                    .sort((a, b) => colorMap[b] - colorMap[a])
                    .slice(0, colorCount);
                
                const palette = sortedColors.map(key => {
                    const [r, g, b] = key.split(',').map(Number);
                    return tinycolor({r,g,b}).toHexString();
                });

                if (palette.length === 0) {
                   return reject(new Error('No se encontraron colores vibrantes.'));
                }
                resolve(palette);

            } catch { // **FIX**: Se elimina la variable de error no utilizada.
                reject(new Error('No se pudo procesar la imagen.'));
            }
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    });
};

