import React, { useState } from 'react';
import { Eye } from 'lucide-react';

const AccessibilityCard = ({ accessibility, colors }) => {
  const [isVisible, setIsVisible] = useState(false);

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-default)',
    color: 'var(--text-default)'
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'AAA': return { bg: 'var(--bg-success-weak)', text: 'var(--text-success)' };
      case 'AA': return { bg: 'var(--bg-attention-weak)', text: 'var(--text-attention)' };
      default: return { bg: 'var(--bg-critical-weak)', text: 'var(--text-critical)' };
    }
  };
  
  const btnLevelColors = getLevelColor(accessibility.btn.level);
  const textLevelColors = getLevelColor(accessibility.text.level);

  return (
    <section className="p-4 rounded-xl border mb-8" style={cardStyle}>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Eye size={20} /> Verificación de Accesibilidad
        </h2>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="text-sm font-medium py-1 px-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)'}}
        >
          {isVisible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {isVisible && (
        <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-default)'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Contraste del Color de Acento</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-12 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: colors.btnBg, color: colors.btnText, border: '1px solid var(--border-strong)' }}>
                  {colors.btnText.toUpperCase()}
                </div>
                <div>
                  <p>Ratio: <span className="font-bold">{accessibility.btn.ratio}:1</span></p>
                  <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: btnLevelColors.bg, color: btnLevelColors.text }}>
                    {accessibility.btn.level}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Contraste del Color de Marca</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-12 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: colors.textBg, color: colors.textColor, border: '1px solid var(--border-strong)' }}>
                  {colors.textColor.toUpperCase()}
                </div>
                <div>
                  <p>Ratio: <span className="font-bold">{accessibility.text.ratio}:1</span></p>
                  <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: textLevelColors.bg, color: textLevelColors.text }}>
                    {accessibility.text.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccessibilityCard;
