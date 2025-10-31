import React from 'react';
import { X } from 'lucide-react';
import tinycolor from 'tinycolor2';

const SliderControl = ({ label, value, min, max, onChange, gradient }) => (
    <div className="grid grid-cols-[1fr_80px] items-center gap-4">
        <label className="text-sm font-medium">{label}</label>
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full px-2 py-1 rounded-md border text-sm text-center"
          style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-default)'}}
        />
        <div className="col-span-2">
            <input
                type="range" min={min} max={max} value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full custom-slider"
                style={{ '--slider-gradient': gradient }}
            />
        </div>
    </div>
);

const PaletteAdjusterModal = ({ adjustments, onAdjust, onClose, brandColor }) => {
  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturation: `linear-gradient(to right, ${tinycolor(brandColor).desaturate(100).toHexString()}, ${tinycolor(brandColor).saturate(100).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${brandColor}, #fff)`,
    temperature: 'linear-gradient(to right, #66b3ff, #fff, #ffc966)'
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div 
        className="p-6 rounded-xl border max-w-sm w-full relative" 
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-default)' }}>Ajustar Paleta</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>
        
        <div className="space-y-6">
          <SliderControl label="Matiz" value={adjustments.hue} min="-180" max="180" onChange={(v) => onAdjust({...adjustments, hue: v})} gradient={gradients.hue} />
          <SliderControl label="Saturación" value={adjustments.saturation} min="-100" max="100" onChange={(v) => onAdjust({...adjustments, saturation: v})} gradient={gradients.saturation} />
          <SliderControl label="Brillo" value={adjustments.brightness} min="-100" max="100" onChange={(v) => onAdjust({...adjustments, brightness: v})} gradient={gradients.brightness} />
          <SliderControl label="Temperatura" value={adjustments.temperature} min="-100" max="100" onChange={(v) => onAdjust({...adjustments, temperature: v})} gradient={gradients.temperature} />
        </div>
      </div>
    </div>
  );
};

export default PaletteAdjusterModal;

