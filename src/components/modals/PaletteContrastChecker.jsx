import React, { useState } from 'react';
import { X } from 'lucide-react';
import tinycolor from 'tinycolor2';
import Switch from '../ui/Switch';

const PaletteContrastChecker = ({ palette, onClose, onCopy }) => {
  const [showOnlyValid, setShowOnlyValid] = useState(false);
  const fullPalette = [...new Set([...palette, '#FFFFFF', '#000000'])];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="p-4 sm:p-6 rounded-xl border max-w-7xl w-full relative flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', height: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>Comprobar Contraste de Paleta</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-default)'}}>
              <span>Solo Válido (AA/AAA)</span>
              <Switch checked={showOnlyValid} onCheckedChange={setShowOnlyValid} />
            </label>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: `30px repeat(${fullPalette.length}, 1fr)` }}>
            <div />
            {fullPalette.map((fgColor, index) => (
              <div key={`fg-${index}`} className="h-8 rounded-md" style={{ backgroundColor: fgColor }} title={fgColor.toUpperCase()} />
            ))}
            {fullPalette.map((bgColor, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                <div className="w-8 h-full rounded-md" style={{ backgroundColor: bgColor }} title={bgColor.toUpperCase()} />
                {fullPalette.map((fgColor, colIndex) => {
                  if (bgColor === fgColor) { return <div key={`cell-${rowIndex}-${colIndex}`} className="rounded-md" style={{ backgroundColor: bgColor }} />; }
                  const ratio = tinycolor.readability(bgColor, fgColor);
                  let level = '';
                  if (ratio >= 7) level = 'AAA'; else if (ratio >= 4.5) level = 'AA';
                  const levelColor = level === 'AAA' ? 'var(--text-success)' : level === 'AA' ? 'var(--text-attention)' : 'var(--text-critical)';
                  const isVisible = !showOnlyValid || level;
                  return (
                    <div key={`cell-${rowIndex}-${colIndex}`} className={`relative group h-full rounded-md flex flex-col items-center justify-center text-xs p-1 transition-opacity ${isVisible ? 'opacity-100' : 'opacity-20'}`} style={{ backgroundColor: bgColor, color: fgColor, minHeight: '50px' }}>
                      <div className="text-center transition-opacity group-hover:opacity-0">
                        <span className="font-bold">{ratio.toFixed(2)}</span>
                        {level && <span className="font-bold" style={{ color: levelColor }}>{level}</span>}
                      </div>
                      <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition-opacity rounded-md overflow-hidden cursor-pointer">
                        <div className="w-1/2 h-full flex items-center justify-center bg-black/50 hover:bg-black/70" onClick={(e) => { e.stopPropagation(); onCopy(bgColor, `Fondo ${bgColor.toUpperCase()} copiado!`); }} title={`Copiar fondo: ${bgColor.toUpperCase()}`}><span className="text-[10px] font-bold" style={{ color: tinycolor.mostReadable(bgColor, ['#fff', '#000']).toHexString() }}>BG</span></div>
                        <div className="w-1/2 h-full flex items-center justify-center bg-black/50 hover:bg-black/70" onClick={(e) => { e.stopPropagation(); onCopy(fgColor, `Texto ${fgColor.toUpperCase()} copiado!`); }} title={`Copiar texto: ${fgColor.toUpperCase()}`}><span className="text-[10px] font-bold" style={{ color: tinycolor.mostReadable(bgColor, ['#fff', '#000']).toHexString() }}>FG</span></div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaletteContrastChecker;
