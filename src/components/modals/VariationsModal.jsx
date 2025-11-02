import React, { useState } from 'react';
import { X } from 'lucide-react';
import tinycolor from 'tinycolor2';

const variationGenerators = {
    'Sombra': (base, i) => { const amount = (9 - i) * 8; return tinycolor.mix(base, amount >= 0 ? '#fff' : '#000', Math.abs(amount)); },
    'Saturación': (base, i) => { const amount = (9 - i) * 10; return amount >= 0 ? base.clone().saturate(amount) : base.clone().desaturate(Math.abs(amount)); },
    'Matiz': (base, i) => base.clone().spin((i - 9) * 20),
    'Temperatura': (base, i) => { const amount = (9 - i) * 10; return tinycolor.mix(base, amount > 0 ? '#ffc966' : '#66b3ff', Math.abs(amount / 2)); },
    'Luminosidad': (base, i) => { const hsl = base.toHsl(); return tinycolor({ h: hsl.h, s: hsl.s, l: 0.05 + ((18-i) / 18) * 0.9 }); },
    'Gradiente': (base, i) => tinycolor.mix(base.clone().darken(20).desaturate(10), base.clone().lighten(40).saturate(10), ((18-i) / 18) * 100)
};

const VariationsModal = ({ explorerPalette, onClose, onColorSelect }) => {
  const tabNames = Object.keys(variationGenerators);
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  
  const handleSelect = (color) => {
    onColorSelect(color);
    onClose();
  };

  const getLabels = (tab) => {
    if (tab === 'Matiz') return Array.from({ length: 19 }).map((_, i) => `${(i - 9) * 20}°`);
    return Array.from({ length: 19 }).map((_, i) => { const v = (9 - i) * 10; return `${v > 0 ? '+' : ''}${v}%`; });
  };

  const currentLabels = getLabels(activeTab);
  const currentGenerator = variationGenerators[activeTab];

  return (
    // --- MODIFICACIÓN --- Backdrop responsivo
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
        {/* --- MODIFICACIÓN ---
          - Panel responsivo (bottom sheet en móvil)
          - Padding inferior con 'safe-area-inset'.
        */}
      <div 
        className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-6 rounded-t-2xl md:rounded-xl border max-w-7xl w-full relative flex flex-col max-h-[90vh]" 
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- NUEVO --- Handle visual para el bottom sheet en móvil */}
        <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
        
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>Variaciones de Paleta</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>
        <div className="flex border-b flex-shrink-0 overflow-x-auto">
          {tabNames.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-4 text-sm font-semibold -mb-px border-b-2 flex-shrink-0 ${activeTab === tab ? 'border-[var(--action-primary-default)] text-[var(--action-primary-default)]' : 'border-transparent text-[var(--text-muted)]'}`}>{tab}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto mt-6">
          <div className="flex gap-x-1">
            <div className="sticky left-0 bg-[var(--bg-card)] flex-shrink-0 w-16 z-10">
                 {currentLabels.map((label, index) => (<div key={index} className="h-10 flex items-center justify-end text-xs font-mono pr-2" style={{color: 'var(--text-muted)'}}>{label === '+0%' || label === '0°' ? 'Base' : label}</div>))}
            </div>
            {explorerPalette.map((colorHex, colIndex) => (
              <div key={colIndex} className="group flex flex-col gap-1 w-12 flex-shrink-0">
                {Array.from({ length: 19 }).map((_, rowIndex) => {
                  const variedColor = currentGenerator(tinycolor(colorHex), rowIndex).toHexString();
                  return (
                    <div key={rowIndex} className="w-full h-10 rounded-md cursor-pointer flex items-center justify-center transition-transform hover:scale-110" style={{backgroundColor: variedColor}} onClick={() => handleSelect(variedColor)} title={variedColor.toUpperCase()}>
                        <span className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color: tinycolor(variedColor).isLight() ? '#000' : '#FFF' }}>
                            {variedColor.substring(1).toUpperCase()}
                        </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariationsModal;
