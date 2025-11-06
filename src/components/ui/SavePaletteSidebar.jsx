import React, { useState, memo, useRef, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

// Hook para detectar clics fuera (solo para móvil)
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

const SavePaletteSidebar = ({
  onClose,
  onSave,
  isSaving = false,
  initialName = '',
  currentPaletteId = null,
  // --- PROPS ELIMINADAS ---
  // Se quitan projects, collections, etc.
}) => {
    const [name, setName] = useState('');
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);

    useEffect(() => {
        // Rellena el formulario
        if (currentPaletteId) {
            setName(initialName || '');
        } else {
            setName(initialName || `Mi Paleta #${Math.floor(Math.random() * 1000)}`);
        }
    }, [initialName, currentPaletteId]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            // --- ¡CAMBIO CLAVE! ---
            // Enviamos solo el nombre
            onSave({
                name: name.trim()
            });
        }
    };

    return (
        <>
            {/* Backdrop para móvil */}
            <div 
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={onClose}
            />
            
            {/* Panel del Sidebar */}
            <aside
                ref={sidebarRef}
                className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                           md:transform-none md:relative md:w-80 lg:w-96 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-default)',
                }}
            >
                <form 
                    className="h-full px-6 py-4 overflow-y-auto flex flex-col"
                    onSubmit={handleSubmit}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    {/* Handle visual (solo móvil) */}
                    <div className="w-12 h-1.5 bg-[var(--border-default)] rounded-full mx-auto mb-4 md:hidden" />
                    
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-default)' }}>
                            <Save size={20} className="text-purple-500" />
                            {currentPaletteId ? "Actualizar Paleta" : "Guardar Paleta"}
                        </h2>
                        <button 
                            type="button"
                            onClick={onClose} 
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-sm text-[var(--text-muted)] mb-4">
                        {currentPaletteId ? "La paleta se actualizará con los colores actuales." : "Tu paleta actual se guardará en tu cuenta."}
                    </p>
                    
                    {/* --- FORMULARIO SIMPLIFICADO --- */}
                    <div className="space-y-4 flex-grow">
                         <div className="space-y-1.5">
                            <label htmlFor="paletteName" className="text-sm font-medium" style={{ color: 'var(--text-muted)'}}>
                                Nombre de la paleta:
                            </label>
                            <input
                                id="paletteName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Tema Bosque Otoñal"
                                required
                                className="w-full p-3 rounded-lg text-sm border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-default)', borderColor: 'var(--border-default)' }}
                            />
                        </div>

                        {/* Campos de Proyecto, Colección y Tags ELIMINADOS */}
                        
                    </div>

                    {/* Botones de Acción */}
                    <div 
                        className="flex gap-3 pt-4 border-t mt-4" 
                        style={{ borderColor: 'var(--border-default)' }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors border"
                            style={{
                                backgroundColor: 'var(--bg-muted)',
                                color: 'var(--text-default)',
                                borderColor: 'var(--border-default)',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors text-white flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ backgroundColor: 'var(--action-primary-default)' }}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> {currentPaletteId ? "Actualizar" : "Guardar"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
};

export default memo(SavePaletteSidebar);