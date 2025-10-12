import tinycolor from 'tinycolor2'; // **FIX**: Importar tinycolor para análisis de color

// Esta función usa un Canvas para extraer los colores dominantes de una imagen.
export const extractColorsFromImage = (imageUrl, colorCount = 8) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            try {
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                const colorMap = {};

                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] < 128) continue; 
                    
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    // **FIX**: Analizar el color para ignorar los tonos no deseados.
                    const color = tinycolor({ r, g, b });
                    const hsv = color.toHsv();

                    // Ignorar colores que son demasiado oscuros (value < 20%) o 
                    // tienen muy poca saturación (saturation < 10%).
                    if (hsv.v < 0.2 || hsv.s < 0.1) {
                        continue;
                    }
                    
                    const R = Math.round(r / 32) * 32;
                    const G = Math.round(g / 32) * 32;
                    const B = Math.round(b / 32) * 32;

                    const key = `${R},${G},${B}`;
                    colorMap[key] = (colorMap[key] || 0) + 1;
                }

                const sortedColors = Object.keys(colorMap)
                    .sort((a, b) => colorMap[b] - colorMap[a])
                    .slice(0, colorCount);
                
                const palette = sortedColors.map(key => {
                    const [r, g, b] = key.split(',').map(Number);
                    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
                });

                if (palette.length === 0) {
                   return reject(new Error('No se encontraron colores vibrantes. La imagen podría ser muy oscura o en escala de grises.'));
                }

                resolve(palette);

            } catch {
                reject(new Error('No se pudo procesar la imagen. Verifica que no sea de un sitio protegido (CORS).'));
            }
        };

        img.onerror = () => {
            reject(new Error('No se pudo cargar la imagen. Revisa la URL o el archivo.'));
        };
    });
};

