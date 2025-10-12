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

export const generatePowerFxCode = (themeData, separator, useQuotes) => {
  if (!themeData || !themeData.stylePalette) return "// Generando código...";
  
  const { brandShades, grayShades, stylePalette, font = "Segoe UI", harmonyPalettes } = themeData;

  const formatKey = (key) => {
      if (useQuotes) return `"${key}"`;
      return key.replace(/ /g, '');
  };

  const formatStylePalette = (palette) => (palette || []).map(item => `    ${formatKey(item.name)}: "${item.color.toUpperCase()}"`).join(`${separator}\n`);
  
  const fontStylesRecord = Object.entries(displayStylesConfig)
    .map(([name, styles]) => `    ${formatKey(name)}: { Font: Font.'${font.split(',')[0].replace(/"/g, '')}'${separator} Size: ${Math.round(parseFloat(styles.fontSize) * 10)}${separator} Bold: ${styles.fontWeight === '700'} }`)
    .join(`${separator}\n`);

  return `ClearCollect(
    colSistemaDeDiseño${separator}
    {
        Marca: {
${brandShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Gris: {
${grayShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Acento: {
${harmonyPalettes.accentShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        GrisArmonico: {
${harmonyPalettes.grayShades.map((s, i) => `    ${formatKey('t' + (i * 50))}: "${s.toUpperCase()}"`).join(`${separator}\n`)}
        }${separator}
        Fondos: {
${formatStylePalette(stylePalette.fullBackgroundColors)}
        }${separator}
        Textos: {
${formatStylePalette(stylePalette.fullForegroundColors)}
        }${separator}
        Bordes: {
${formatStylePalette(stylePalette.fullBorderColors)}
        }${separator}
        Acciones: {
${formatStylePalette(stylePalette.fullActionColors)}
        }${separator}
        Decorativos: {
${formatStylePalette(stylePalette.decorateColors)}
        }${separator}
        Fuentes: {
${fontStylesRecord}
        }
    }
);`;
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
        return shadeObject.slice(0, -1); // Keep last comma
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

