import React from 'react';
import tinycolor from 'tinycolor2';

const ColorPalette = ({ title, color, hex, shades, onShadeCopy, themeOverride, isExplorer = false }) => {
  return (
    <div className="mb-4">
      {!isExplorer && (
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-md mr-3 border" style={{ backgroundColor: color, borderColor: themeOverride === 'light' ? '#E5E7EB' : '#4B5563' }}></div>
          <div>
            <p className={`text-sm font-medium ${themeOverride === 'light' ? 'text-gray-900' : 'text-gray-50'}`}>{title}</p>
            <p className={`text-xs font-mono ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{hex.toUpperCase()}</p>
          </div>
        </div>
      )}
      {/* --- MODIFICACIÓN --- Se añade un div contenedor para el scroll horizontal */}
      <div className="overflow-x-auto pb-2 -mb-2">
        <div className="flex rounded-md overflow-hidden h-10 relative group" style={{ minWidth: `${shades.length * 25}px` }}>
          {shades.map((shade, index) => (
            <div 
                key={index} 
                className="flex-1 cursor-pointer transition-transform duration-100 ease-in-out group-hover:transform group-hover:scale-y-110 hover:!scale-125 hover:z-10 flex items-center justify-center" 
                style={{ backgroundColor: shade, minWidth: '25px' }}
                onClick={() => onShadeCopy(shade)}
                title={`Usar ${shade.toUpperCase()}`}
            >
              <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ color: tinycolor(shade).isLight() ? '#000' : '#FFF' }}>
                {shade.substring(1).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
       {!isExplorer && (
        <div className={`hidden sm:flex text-xs font-mono px-1 relative pt-2 mt-1 ${themeOverride === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="absolute top-0 w-0 h-0" style={{ left: 'calc(47.5% - 7px)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `10px solid ${themeOverride === 'light' ? '#374151' : '#D1D5DB'}`}} title="Color Base"></div>
            {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="flex-1 text-center text-[10px]">T{index * 50}</div>
            ))}
        </div>
      )}
    </div>
  );
}

export default ColorPalette;

