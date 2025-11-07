import React, { memo, useRef, useEffect } from 'react';
import { X, Check, Eye } from 'lucide-react';
import { colorblindnessMatrices } from '../../utils/colorUtils.js';

// Hook para detectar clics fuera del panel (solo para móvil)
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (window.innerWidth >= 768) return;
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// --- ¡NUEVO! --- Lista de opciones de simulación
const simulationOptions = [
    { value: "none", label: "Normal" },
    { value: "protanopia", label: "Protanopia" },
    { value: "deuteranopia", label: "Deuteranopia" },
    { value: "tritanopia", label: "Tritanopia" },
    { value: "achromatopsia", label: "Acromatopsia" },
    { value: "protanomaly", label: "Protanomalía" },
    { value: "deuteranomaly", label: "Deuteranomalía" },
    { value: "tritanomaly", label: "Tritanomalía" },
    { value: "achromatomaly", label: "Acromatomalía" }
];

// Componente para una fila de opción
const SimulationOption = ({ label, value, isActive, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`w-full text-left flex justify-between items-center p-3 rounded-lg text-sm font-medium transition-colors
            ${isActive 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-800 hover:bg-gray-100'
            }`}
    >
        <span>{label}</span>
        {isActive && <Check size={16} strokeWidth={3} />}
    </button>
);


const ColorBlindnessSidebar = ({
  simulationMode,
  setSimulationMode,
  onCancel,
  onApply,
}) => {
  const sidebarRef = useRef();
  useOnClickOutside(sidebarRef, onCancel);

  return (
    <>
      {/* Backdrop para móvil */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onCancel}
      />
      
      {/* Panel del Sidebar */}
      {/* --- ¡MODIFICACIÓN CLAVE! ---
          Se cambió 'md:w-80 lg:w-96' por 'md:w-64 lg:w-72'
          para hacerlo más delgado.
      */}
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                   md:transform-none md:relative md:w-64 lg:w-72 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
        // --- ¡MODIFICADO! --- Fondo blanco
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB', // Borde gris claro
        }}
      >
        <div 
          className="h-full px-6 py-4 overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Handle visual (solo móvil) */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Eye size={20} strokeWidth={1.75} />
              Daltonismo
            </h2>
            <button 
              onClick={onCancel} 
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Selecciona un tipo de simulación para previsualizar cómo se vería tu paleta.
          </p>
          
          {/* Lista de Opciones */}
          <div className="space-y-2 flex-grow">
            {simulationOptions.map(opt => (
                <SimulationOption 
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                    isActive={simulationMode === opt.value}
                    onClick={setSimulationMode}
                />
            ))}
          </div>

          {/* Botones de Acción */}
          <div 
            className="flex gap-3 pt-4 border-t mt-4" 
            style={{ borderColor: '#E5E7EB' }}
          >
            <button
              onClick={onCancel}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
            >
              Cancelar
            </button>
            {/* --- ¡BOTÓN CON GRADIENTE! --- */}
            <button
              onClick={onApply}
              disabled={simulationMode === 'none'}
              className="flex-1 font-bold py-2 px-4 rounded-lg transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
            >
              <Check size={16} strokeWidth={1.75} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(ColorBlindnessSidebar);