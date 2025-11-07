import React, { memo, useRef, useEffect, useState } from 'react';
import { 
    X, Loader2, FolderOpen, AlertTriangle, MoreHorizontal, Download, Play, 
    Copy, Edit, XCircle, Search, Plus, Trash2, ChevronDown 
} from 'lucide-react';
import { PopoverMenu, MenuButton } from './Explorer.jsx'; 

// --- Opciones estáticas para los filtros ---
const styleOptions = [
    { label: "Cálido", value: "warm" }, { label: "Frío", value: "cold" },
    { label: "Claro", value: "light" }, { label: "Oscuro", value: "dark" },
    { label: "Brillante", value: "bright" }, { label: "Silenciado", value: "muted" },
    { label: "Pastel", value: "pastel" }, { label: "Vintage", value: "vintage" },
    { label: "Monocromo", value: "monochromatic" }, { label: "Gradiente", value: "gradient" }
];

const colorOptions = [
    { label: "Rojo", value: "red", color: "#e11d48" },
    { label: "Naranja", value: "orange", color: "#f97316" },
    { label: "Marrón", value: "brown", color: "#78350f" },
    { label: "Amarillo", value: "yellow", color: "#facc15" },
    { label: "Verde", value: "green", color: "#22c55e" },
    { label: "Azul", value: "blue", color: "#3b82f6" },
    { label: "Púrpura", value: "purple", color: "#a855f7" },
    { label: "Rosa", value: "pink", color: "#ec4899" },
    { label: "Gris", value: "gray", color: "#6b7280" }
];
// --- FIN DE OPCIONES ---

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

// Tarjeta de Paleta (Estilo Lista)
const PaletteCard = ({ 
    palette, 
    onLoad, 
    onDelete, 
    onDuplicate,
    onExport,
    onUpdateName,
    isDeleting 
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(palette.name);

    const handleNameUpdate = () => {
        if (name.trim() && name.trim() !== palette.name) {
            onUpdateName(palette.id, name.trim());
        }
        setIsEditing(false);
    };

    return (
        <div className="w-full">
            <div 
                className="flex-1 cursor-pointer h-12 rounded-lg overflow-hidden flex shadow-md hover:shadow-lg transition-shadow"
                onClick={() => onLoad(palette)}
                title={`Cargar paleta "${palette.name}"`}
            >
                {(palette.explorerPalette || []).map((color, i) => (
                    <div 
                        key={i} 
                        style={{ backgroundColor: color }} 
                        className="h-full flex-1"
                        title={color} 
                    />
                ))}
            </div>
            
            <div className="flex items-center justify-between gap-2 pt-1.5 px-1">
                {isEditing ? (
                    <input
                        type="text"
                        value={name}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-sm p-0 m-0 bg-transparent border-b border-purple-500 focus:outline-none flex-1 w-full"
                        style={{ color: 'var(--text-default)' }}
                    />
                ) : (
                    <p 
                        className="font-semibold text-sm truncate flex-1 cursor-pointer text-gray-800"
                        onClick={() => onLoad(palette)}
                        title={palette.name}
                    >
                        {palette.name}
                    </p>
                )}
                
                <div className="relative flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(p => !p); }}
                        disabled={isDeleting}
                        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        title="Opciones de paleta"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={16} strokeWidth={1.75} />}
                    </button>
                    
                    {menuOpen && (
                        <PopoverMenu onClose={() => setMenuOpen(false)}>
                            <MenuButton 
                                icon={<Play size={16} strokeWidth={1.75} />} 
                                label="Cargar" 
                                onClick={() => { onLoad(palette); setMenuOpen(false); }} 
                            />
                            <MenuButton 
                                icon={<Edit size={16} strokeWidth={1.75} />} 
                                label="Renombrar" 
                                onClick={() => { setIsEditing(true); setMenuOpen(false); }} 
                            />
                             <MenuButton 
                                icon={<Download size={16} strokeWidth={1.75} />} 
                                label="Exportar" 
                                onClick={() => { onExport(palette); setMenuOpen(false); }} 
                            />
                            <MenuButton 
                                icon={<Copy size={16} strokeWidth={1.75} />} 
                                label="Duplicar" 
                                onClick={() => { onDuplicate(palette.id); setMenuOpen(false); }} 
                            />
                            <div className="h-px bg-gray-200 my-1"></div>
                            <MenuButton 
                                icon={<XCircle size={16} strokeWidth={1.75} className="text-red-500"/>} 
                                label="Borrar paleta" 
                                className="text-red-500 hover:bg-red-500/10"
                                onClick={() => { onDelete(palette.id); setMenuOpen(false); }} 
                            />
                        </PopoverMenu>
                    )}
                </div>
            </div>
        </div>
    );
};


// Componente para gestionar Proyectos y Colecciones
const ProjectCollectionManager = ({
    title,
    items,
    activeItemId,
    onSelectItem,
    onAddItem,
    onUpdateItem,
    onDeleteItem,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [isOpen, setIsOpen] = useState(true);

    const handleAddNew = () => {
        if (newItemName.trim()) {
            onAddItem(newItemName.trim());
            setNewItemName("");
            setIsAdding(false);
        }
    };

    const handleUpdate = () => {
        if (editingName.trim() && editingId) {
            onUpdateItem(editingId, editingName.trim());
        }
        setEditingId(null);
        setEditingName("");
    };

    return (
        <div className="py-2 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2 px-2">
                <button 
                    className="flex items-center gap-1 font-semibold text-sm text-gray-900"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                    {title}
                    {activeItemId && <div className="w-2 h-2 rounded-full bg-purple-500 ml-1"></div>}
                </button>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    title={`Añadir ${title.slice(0, -1)}`}
                >
                    <Plus size={16} strokeWidth={1.75} />
                </button>
            </div>
            
            {isOpen && (
                <div className="pl-4 pr-2 space-y-1">
                    {/* Botón de "Todas las Paletas" (solo para Proyectos) */}
                    {title === "Proyectos" && (
                         <button
                            onClick={() => onSelectItem(null)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${!activeItemId ? 'font-bold bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Todas las paletas
                        </button>
                    )}
                    
                    {items && items.map(item => (
                        <div
                            key={item.id}
                            className={`group flex items-center justify-between w-full text-left px-3 py-1.5 text-sm rounded-md ${activeItemId === item.id ? 'font-bold bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {editingId === item.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={handleUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate}
                                    className="flex-1 p-0 m-0 bg-transparent border-b border-purple-500 focus:outline-none"
                                />
                            ) : (
                                <span className="flex-1 truncate" onClick={() => onSelectItem(item.id)}>
                                    {item.name}
                                </span>
                            )}
                            
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => { setEditingId(item.id); setEditingName(item.name); }}
                                    className="p-1 rounded-md hover:text-gray-900"
                                    title="Renombrar"
                                >
                                    <Edit size={14} strokeWidth={1.75} />
                                </button>
                                <button 
                                    onClick={() => onDeleteItem(item.id, item.name)}
                                    className="p-1 rounded-md text-red-500 hover:bg-red-500/10"
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {isAdding && (
                        <div className="px-3 py-1.5">
                            <input
                                type="text"
                                value={newItemName}
                                autoFocus
                                onChange={(e) => setNewItemName(e.target.value)}
                                onBlur={handleAddNew}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNew}
                                placeholder={`Nuevo ${title.slice(0, -1)}...`}
                                className="w-full text-sm p-0 m-0 bg-transparent border-b border-purple-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente para los filtros de Estilo y Color
const FilterGroup = ({ title, options, activeOption, onSelectOption }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="py-2 border-b border-gray-200">
            <button 
                className="flex items-center gap-1 font-semibold text-sm mb-2 px-2 text-gray-900"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                {title}
                {activeOption && <div className="w-2 h-2 rounded-full bg-purple-500 ml-1"></div>}
            </button>
            {isOpen && (
                <div className="pl-4 pr-2 space-y-1">
                    <button
                        onClick={() => onSelectOption(null)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${!activeOption ? 'font-bold bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Todos
                    </button>
                    {options && options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onSelectOption(option.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${activeOption === option.value ? 'font-bold bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {option.color && (
                                <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: option.color }}></div>
                            )}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (MyPalettesSidebar) ---
// Este componente SÍ necesita los filtros, y los recibe de App.jsx
const MyPalettesSidebar = ({ 
    onClose, 
    palettes, 
    isLoading, 
    onLoadPalette, 
    onDeletePalette,
    onDuplicatePalette,
    onExportPalette,
    onUpdatePaletteName,
    deletingId,
    // --- Props de filtros ---
    projects,
    collections,
    filters, // <-- Recibido de App.jsx
    setFilters, // <-- Recibido de App.jsx
    onCreateProject,
    onUpdateProject,
    onDeleteProject,
    onCreateCollection,
    onUpdateCollection,
    onDeleteCollection
}) => {
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);
    const [showFilters, setShowFilters] = useState(true);

    // Esta función ahora funcionará porque 'filters' está garantizado
    // (o al menos, se espera que App.jsx lo pase).
    const getFilterButtonText = () => {
        // Añadimos una comprobación por si acaso 'filters' es undefined
        if (!filters) return "Todas las paletas"; 
        
        if (filters.projectId) {
            return projects.find(p => p.id === filters.projectId)?.name || "Proyecto";
        }
        if (filters.collectionId) {
            return collections.find(c => c.id === filters.collectionId)?.name || "Colección";
        }
        if (filters.style) {
            return styleOptions.find(o => o.value === filters.style)?.label || "Estilo";
        }
        if (filters.color) {
            return colorOptions.find(o => o.value === filters.color)?.label || "Color";
        }
        return "Todas las paletas";
    };

    // Fallback por si filters es nulo o undefined
    const safeFilters = filters || { projectId: null, collectionId: null, style: null, color: null, search: '' };

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
                <div 
                    className="h-full overflow-y-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    {/* Handle visual (solo móvil) */}
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
                    
                    {/* Header (Fijo) */}
                    <div className="flex justify-between items-center mb-4 flex-shrink-0 px-6 pt-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            <FolderOpen size={20} strokeWidth={1.75} className="text-purple-500" /> Mis Paletas
                        </h2>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Barra de Filtro/Búsqueda (Fijo) */}
                    <div className="flex justify-between items-center border-b border-gray-200 px-4 flex-shrink-0">
                        <button 
                            onClick={() => setShowFilters(f => !f)}
                            className="flex-1 text-left font-semibold py-3 px-2 flex items-center justify-between text-gray-900"
                        >
                            <span className="truncate">{getFilterButtonText()}</span>
                            <ChevronDown size={20} strokeWidth={1.75} className={`transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        <div className="relative">
                             <Search size={16} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Buscar..."
                                value={safeFilters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="w-28 bg-gray-100 border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Contenido Desplazable (Filtros + Paletas) */}
                    
                    {showFilters && (
                        <div className="px-4 py-2 border-b border-gray-200">
                            <ProjectCollectionManager
                                title="Proyectos"
                                items={projects}
                                activeItemId={safeFilters.projectId}
                                onSelectItem={(id) => setFilters(f => ({ ...f, projectId: id, collectionId: null, style: null, color: null }))}
                                onAddItem={onCreateProject}
                                onUpdateItem={onUpdateProject}
                                onDeleteItem={onDeleteProject}
                            />
                            <ProjectCollectionManager
                                title="Colecciones"
                                items={collections}
                                activeItemId={safeFilters.collectionId}
                                onSelectItem={(id) => setFilters(f => ({ ...f, collectionId: id, projectId: null, style: null, color: null }))}
                                onAddItem={onCreateCollection}
                                onUpdateItem={onUpdateCollection}
                                onDeleteItem={onDeleteCollection}
                            />
                            <FilterGroup
                                title="Estilo"
                                options={styleOptions}
                                activeOption={safeFilters.style}
                                onSelectOption={(value) => setFilters(f => ({ ...f, style: value, projectId: null, collectionId: null }))}
                            />
                            <FilterGroup
                                title="Color"
                                options={colorOptions}
                                activeOption={safeFilters.color}
                                onSelectOption={(value) => setFilters(f => ({ ...f, color: value, projectId: null, collectionId: null }))}
                            />
                        </div>
                    )}

                    <div className="px-6 py-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 size={32} className="animate-spin text-purple-500" />
                            </div>
                        ) : !palettes || palettes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center h-48 p-4 rounded-lg bg-gray-100">
                                <AlertTriangle size={32} strokeWidth={1.75} className="text-amber-500 mb-2" />
                                <p className="font-semibold text-gray-900">No se encontraron paletas</p>
                                <p className="text-sm text-gray-500">
                                    {safeFilters.search || safeFilters.projectId || safeFilters.collectionId || safeFilters.style || safeFilters.color 
                                        ? "Prueba con otros filtros." 
                                        : "Usa el botón \"Guardar\"."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {palettes.map(palette => (
                                    <PaletteCard
                                        key={palette.id}
                                        palette={palette}
                                        onLoad={onLoadPalette}
                                        onDelete={onDeletePalette}
                                        onDuplicate={onDuplicatePalette}
                                        onExport={onExportPalette}
                                        onUpdatePaletteName={onUpdatePaletteName}
                                        isDeleting={deletingId === palette.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default memo(MyPalettesSidebar);