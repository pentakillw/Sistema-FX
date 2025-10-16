import tinycolor from 'tinycolor2';

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
}


export const generatePowerFxCode = (themeData, separator, useQuotes) => {
  if (!themeData || !themeData.brandShades) return "// Generando código...";

  // --- CORRECCIÓN 1: Se extrae explorerPalette de themeData ---
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

  // --- NUEVA FUNCIÓN ---
  // Formatea la paleta del explorador, que es un array simple de strings.
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
    // --- NUEVO: Se añade la paleta del Modo Color ---
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
