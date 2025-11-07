import React, { memo, useRef, useEffect, useState } from 'react';
import { X, Loader2, Plus, ChevronDown } from 'lucide-react';

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

// Componente para seleccionar Proyecto/Colección
const ItemSelector = ({ 
    label, 
    items, 
    selectedId, 
    onSelect, 
    onCreate 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const dropdownRef = useRef(null);

    const selectedItemName = items.find(item => item.id === selectedId)?.name || `Seleccionar ${label}`;

    const handleCreate = () => {
        if (newItemName.trim()) {
            onCreate(newItemName.trim());
            setNewItemName("");
            setIsAdding(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-semibold mb-2 block text-gray-900">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-3 rounded-lg border text-sm bg-gray-100 border-gray-200 text-gray-900"
            >
                <span className="truncate">{selectedItemName}</span>
                <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {isOpen && (
                <div 
                    className="absolute z-10 top-full mt-2 w-full max-h-60 overflow-y-auto p-2 rounded-lg border shadow-lg bg-white border-gray-200"
                >
                    <button
                        onClick={() => { onSelect(null); setIsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        Ninguno
                    </button>
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { onSelect(item.id); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md ${selectedId === item.id ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100 text-gray-900`}
                        >
                            {item.name}
                        </button>
                    ))}
                    <div className="h-px bg-gray-200 my-1" />
                    {isAdding ? (
                        <div className="p-2">
                            <input
                                type="text"
                                value={newItemName}
                                autoFocus
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                placeholder={`Nuevo ${label}...`}
                                className="w-full text-sm p-2 bg-transparent border-b border-purple-500 focus:outline-none"
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 text-purple-600"
                        >
                            <Plus size={16} strokeWidth={1.75} /> Crear nuevo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente para gestionar Tags (simplificado para el formulario de guardado)
const TagManager = ({ 
    allTags, 
    selectedTagNames, 
    onTagNamesChange, 
    onCreateTag 
}) => {
    const [inputValue, setInputValue] = useState("");
    
    const handleAddTag = (tagName) => {
        const name = tagName.trim();
        if (name && !selectedTagNames.includes(name)) {
            onTagNamesChange([...selectedTagNames, name]);
            onCreateTag(name); // Llama a onCreateTag para asegurar que exista en la BD
        }
        setInputValue("");
    };
    
    const handleRemoveTag = (tagToRemove) => {
        onTagNamesChange(selectedTagNames.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(inputValue);
        }
    };
    
    return (
        <div>
            <label className="text-sm font-semibold mb-2 block text-gray-900">
                Etiquetas
            </label>
            <div 
                className="w-full flex flex-wrap items-center gap-2 p-2 rounded-lg border bg-gray-100 border-gray-200"
            >
                {selectedTagNames.map(tag => (
                    <div 
                        key={tag} 
                        className="flex items-center gap-1.5 bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full"
                    >
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => handleAddTag(inputValue)}
                    placeholder="Añadir tag..."
                    className="flex-1 bg-transparent p-1 focus:outline-none text-sm text-gray-900"
                />
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (SavePaletteSidebar) ---
const SavePaletteSidebar = ({ 
    onClose, 
    onSave, 
    isSaving, 
    initialName,
    currentPaletteId,
    // Props para seleccionar/crear
    projects,
    collections,
    tags, 
    onCreateProject,
    onCreateCollection,
    onCreateTag 
}) => {
    
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);

    // Estado local del formulario
    const [name, setName] = useState(initialName || "Mi Nueva Paleta");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [selectedTagNames, setSelectedTagNames] = useState([]); // Guardamos solo los nombres

    // Cargar datos si estamos actualizando una paleta existente
    useEffect(() => {
        setName(initialName || "Mi Nueva Paleta");
        // Aquí podrías pre-cargar la descripción, proyecto, etc., si
        // pasaras la paleta completa en lugar de solo 'initialName'.
        // Por ahora, solo reseteamos el nombre.
    }, [initialName, currentPaletteId]);


    const handleSaveClick = (e) => {
        e.preventDefault();
        onSave({
            name: name.trim() || "Paleta Sin Título",
            description: description.trim(),
            projectId: selectedProjectId,
            collectionId: selectedCollectionId,
            tags: selectedTagNames // Pasa los nombres de los tags
        });
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={onClose}
            />
            
            <aside
                ref={sidebarRef}
                className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-2xl shadow-2xl transition-transform transform
                           md:transform-none md:relative md:w-80 lg:w-96 md:flex-shrink-0 md:sticky md:top-0 md:rounded-xl md:shadow-lg md:border md:max-h-[calc(100vh-8rem)] md:z-10 border-t md:border"
                // --- ¡MODIFICADO! --- Fondo blanco
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                }}
            >
                <form 
                    className="h-full overflow-y-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onSubmit={handleSaveClick}
                >
                    {/* Handle visual (solo móvil) */}
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
                    
                    {/* Header (Fijo) */}
                    <div className="flex justify-between items-center mb-4 flex-shrink-0 px-6 pt-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            {currentPaletteId ? "Actualizar Paleta" : "Guardar Paleta"}
                        </h2>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Contenido del Formulario (con scroll) */}
                    <div className="px-6 py-4 space-y-4 flex-grow">
                        <div>
                            <label htmlFor="palette-name" className="text-sm font-semibold mb-2 block text-gray-900">
                                Nombre
                            </label>
                            <input
                                id="palette-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Mi Nueva Paleta"
                                required
                                className="w-full p-3 rounded-lg border text-sm bg-gray-100 border-gray-200 text-gray-900"
                            />
                        </div>

                        <div>
                            <label htmlFor="palette-desc" className="text-sm font-semibold mb-2 block text-gray-900">
                                Descripción (Opcional)
                            </label>
                            <textarea
                                id="palette-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Una breve descripción..."
                                className="w-full p-3 rounded-lg border text-sm bg-gray-100 border-gray-200 text-gray-900"
                            />
                        </div>
                        
                        <ItemSelector
                            label="Proyecto"
                            items={projects}
                            selectedId={selectedProjectId}
                            onSelect={setSelectedProjectId}
                            onCreate={onCreateProject}
                        />
                        
                        <ItemSelector
                            label="Colección"
                            items={collections}
                            selectedId={selectedCollectionId}
                            onSelect={setSelectedCollectionId}
                            onCreate={onCreateCollection}
                        />
                        
                        <TagManager
                            allTags={tags}
                            selectedTagNames={selectedTagNames}
                            onTagNamesChange={setSelectedTagNames}
                            onCreateTag={onCreateTag}
                        />

                    </div>

                    {/* Footer (Fijo) */}
                    <div 
                        className="flex gap-3 pt-4 border-t mt-4 px-6 pb-4 flex-shrink-0" 
                        style={{ borderColor: '#E5E7EB' }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 font-bold py-2.5 px-4 rounded-lg transition-colors border bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        {/* --- ¡BOTÓN CON GRADIENTE! --- */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 font-bold py-2.5 px-4 rounded-lg transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-95"
                            style={{ background: 'linear-gradient(to right, #E0405A, #F59A44, #56B470, #4A90E2, #6F42C1)' }}
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                currentPaletteId ? "Actualizar" : "Guardar"
                            )}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
};

export default memo(SavePaletteSidebar);